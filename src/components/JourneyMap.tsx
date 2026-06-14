import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { AttributionControl, CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Stop } from '../data/resume'

/** Mortarboard glyph for the alma-mater marker (the journey's origin). */
const CAP_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 1 8l11 6 9-4.91V15h2V8L12 2z"/><path d="M5 12.18v3.32c0 1.93 3.14 3.5 7 3.5s7-1.57 7-3.5v-3.32l-7 3.82-7-3.82z"/></svg>'

const D2R = Math.PI / 180
const R2D = 180 / Math.PI
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2))
const invMercY = (y: number) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * R2D

/**
 * Point a fraction `f` along the straight segment a→b, interpolated in Web
 * Mercator so it lands exactly on the line Leaflet draws between the dots
 * (lng is linear in Mercator x; lat is not).
 */
function lerpMerc(a: [number, number], b: [number, number], f: number): [number, number] {
  const lng = a[1] + (b[1] - a[1]) * f
  const y = mercY(a[0]) + (mercY(b[0]) - mercY(a[0])) * f
  return [invMercY(y), lng]
}

/** Ken Perlin's smootherstep: eases in and out, flat slope at 0 and 1. */
const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

const DOT_ZOOM = 11
/** Above this distance a segment is a "jump": no connecting line, just a fly. */
const JUMP_METERS = 500_000

/** Great-circle distance in meters (no map instance needed at render time). */
function haversine(a: [number, number], b: [number, number]) {
  const R = 6_371_000
  const dLat = (b[0] - a[0]) * D2R
  const dLng = (b[1] - a[1]) * D2R
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * D2R) * Math.cos(b[0] * D2R) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const isJump = (path: [number, number][], s: number) => haversine(path[s], path[s + 1]) > JUMP_METERS

/**
 * Sample points along a quadratic Bézier from `a` to `b` that bows NORTH — a
 * flight-path arch. Computed in Web-Mercator space (x = lng, y = mercY(lat)) so
 * the curve stays clean at any zoom, then projected back to [lat,lng]. The
 * control point sits off the midpoint along the perpendicular, forced to the
 * +mercY ("up"/north) side so the arc always arches over the top.
 */
function buildArc(a: [number, number], b: [number, number], bow = 0.18, n = 64): [number, number][] {
  // Geometry in TRUE Web-Mercator units: x = lng IN RADIANS (so x and y share a
  // unit — using lng in degrees would scale the perpendicular by the ~38° span
  // and fling the control point past the pole). Convert x back to degrees below.
  const ax = a[1] * D2R, ay = mercY(a[0])
  const bx = b[1] * D2R, by = mercY(b[0])
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  const dx = bx - ax, dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  let px = -dy / len, py = dx / len // perpendicular unit
  if (py < 0) { px = -px; py = -py } // ensure it bows "up"/north (+mercY)
  const cx = mx + px * len * bow, cy = my + py * len * bow // control point
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const k = 1 - t
    const x = k * k * ax + 2 * k * t * cx + t * t * bx
    const y = k * k * ay + 2 * k * t * cy + t * t * by
    pts.push([invMercY(y), x * R2D])
  }
  return pts
}

/**
 * The exact (center, zoom) the cinematic camera shows at fraction `f` (0→1) of
 * the JUMP on segment `s`. Factored out so `place()` (the live scrub) and the
 * tile preloader compute byte-identical views — if they diverged, the preloaded
 * tile URLs wouldn't match Leaflet's actual requests and the cache would miss.
 */
function jumpView(
  map: L.Map,
  path: [number, number][],
  s: number,
  f: number,
): { center: [number, number]; zoom: number } {
  const a = path[s]
  const b = path[s + 1]
  const center = lerpMerc(a, b, smootherstep(f)) // focus lingers at ends, transits the middle
  const fitZoom = map.getBoundsZoom(L.latLngBounds([a, b]).pad(0.2)) // frames both endpoints
  const zoom = DOT_ZOOM + (fitZoom - DOT_ZOOM) * Math.sin(Math.PI * f) // out at mid, DOT_ZOOM at ends
  return { center, zoom }
}

// Keep references to in-flight preload <img> elements so the browser doesn't GC
// them (and cancel the request) before the tile lands in the HTTP cache.
const preloadedTiles: HTMLImageElement[] = []

/**
 * Pre-warm the browser's HTTP tile cache for the deterministic jump corridors.
 * The scrub shows an exactly-computable (center, zoom) at every scroll fraction,
 * so we can enumerate every tile it will request and `new Image()` them ahead of
 * time. Browser cache keys on the URL string, so the URLs built here MUST be
 * byte-identical to what Leaflet requests.
 *
 * SYNC: this URL template + subdomains + (no) retina suffix MUST match the
 * <TileLayer> below. Leaflet defaults in play: subdomains 'abc', detectRetina
 * false ({r} → ''), tileSize 256.
 */
function preloadJumpTiles(map: L.Map, path: [number, number][]) {
  const size = map.getSize()
  if (!size.x || !size.y) return // map not laid out yet; a later run will handle it
  const half = size.divideBy(2)
  const urls = new Set<string>()

  for (let s = 0; s < path.length - 1; s++) {
    if (!isJump(path, s)) continue
    for (let f = 0; f <= 1.0001; f += 0.02) {
      const { center, zoom } = jumpView(map, path, s, f)
      // Leaflet's _tileZoom under zoomSnap 0 is the rounded zoom.
      const z = Math.max(0, Math.min(20, Math.round(zoom)))
      const max = Math.pow(2, z) - 1
      const p = map.project(L.latLng(center[0], center[1]), z)
      // Viewport tile coverage + a 1-tile margin to match keepBuffer.
      const x0 = Math.floor((p.x - half.x) / 256) - 1
      const x1 = Math.floor((p.x + half.x) / 256) + 1
      const y0 = Math.floor((p.y - half.y) / 256) - 1
      const y1 = Math.floor((p.y + half.y) / 256) + 1
      for (let x = x0; x <= x1; x++) {
        if (x < 0 || x > max) continue
        for (let y = y0; y <= y1; y++) {
          if (y < 0 || y > max) continue
          const sub = 'abc'[Math.abs(x + y) % 3] // Leaflet's default subdomain pick
          urls.add(`https://${sub}.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`)
        }
      }
    }
  }

  if (urls.size > 800) {
    // Unexpected — the jump corridor should be a few hundred tiles. Proceed anyway.
    // eslint-disable-next-line no-console
    console.warn(`[JourneyMap] preloading ${urls.size} jump tiles (more than expected)`)
  }

  urls.forEach((url) => {
    const img = new Image()
    img.src = url
    preloadedTiles.push(img)
  })
}

/** Builds a glowing custom marker. The active one pulses and shows its label.
 *  Jobs get a dot; the alma mater gets a graduation cap to mark the origin. */
function markerIcon(stop: Stop, active: boolean) {
  const isEdu = stop.kind === 'education'
  const label = isEdu ? stop.school : stop.company
  const glyph = isEdu ? `<span class="jm-pin__cap">${CAP_SVG}</span>` : `<span class="jm-pin__dot"></span>`
  const html = `
    <div class="jm-pin ${active ? 'jm-pin--active' : ''} ${isEdu ? 'jm-pin--edu' : ''}">
      <span class="jm-pin__ring"></span>
      ${glyph}
      <span class="jm-pin__label">${label}</span>
    </div>`
  return L.divIcon({
    html,
    className: 'jm-pin-wrap',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

/**
 * Camera as a PURE CONTINUOUS FUNCTION of `progress` — no state, no timers, no
 * animations. Each frame we derive center + zoom directly from `progress`, so
 * the camera is scrubbed by scroll, identical forward and backward, and stays
 * glued to the bright line tip (it uses the same `lerpMerc` with `s=floor`).
 *
 *  - NEAR segment: pan to the exact line tip at a CONSTANT `DOT_ZOOM`. No zoom
 *    change → no strobe, tiles only stream at the edges.
 *  - FAR jump: there's no line; instead the camera does an "anchored reveal"
 *    driven by an interpolated bounding box. Phase 1 (f 0→0.5) anchors the
 *    start dot `a` and grows the far corner a→b → zoom OUT revealing the
 *    destination. Phase 2 (f 0.5→1) anchors the end dot `b` and slides the
 *    near corner a→b → zoom IN onto the destination. Bounded smooth function
 *    of `progress`, so sub-pixel jitter yields negligible change (no restart).
 */
function ScrollCamera({ path, progress }: { path: [number, number][]; progress: number }) {
  const map = useMap()
  const lastSeg = path.length - 2
  const clampSeg = (x: number) => Math.max(0, Math.min(lastSeg, x))
  const preloadedRef = useRef(false)
  const reduce = useReducedMotion()

  const place = () => {
    const size = map.getSize()
    if (!size.x || !size.y) return // hidden map (display:none across breakpoint)

    // Reduced motion: don't scrub/zoom — cut straight to the nearest stop at a
    // constant zoom, so the map changes in discrete steps instead of gliding.
    if (reduce) {
      const stop = Math.max(0, Math.min(path.length - 1, Math.round(progress)))
      map.setView(path[stop], DOT_ZOOM, { animate: false })
      return
    }

    const s = clampSeg(Math.floor(progress))
    const f = Math.max(0, Math.min(1, progress - s))

    if (isJump(path, s)) {
      // Eased glide: the CENTER lingers at each endpoint (smootherstep) and
      // transits the gap through the middle, while the ZOOM bumps OUT to frame
      // both endpoints at the midpoint (sin peak) and returns to DOT_ZOOM at
      // each end. Pure function of `f`, so it scrubs identically either way.
      const { center, zoom } = jumpView(map, path, s, f)
      map.setView(center, zoom, { animate: false })
      return
    }

    // NEAR segment: pan to the exact line tip at a constant DOT_ZOOM.
    map.setView(lerpMerc(path[s], path[s + 1], f), DOT_ZOOM, { animate: false })
  }

  // Re-place every frame progress changes — this IS the animation, scrubbed by
  // scroll, identical forward and backward, perfectly synced to the line tip.
  useEffect(() => {
    place()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, path, progress])

  // Re-place (and revalidate size) on resize / when a hidden map appears.
  useEffect(() => {
    const refit = () => {
      map.invalidateSize()
      place()
    }
    window.addEventListener('resize', refit)
    return () => window.removeEventListener('resize', refit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, path])

  // Once the map is ready, pre-warm the tile cache for the jump corridors so the
  // zoom-out/in scrub doesn't flash the dark background while tiles download.
  // Deferred (idle/timeout) so it never competes with first paint, and guarded
  // to run exactly once. If the map has no size yet we skip; a later run (resize
  // refit re-triggering deps, or the retry below) picks it up once it's laid out.
  useEffect(() => {
    if (preloadedRef.current) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let idleId: number | undefined

    const run = () => {
      const size = map.getSize()
      if (!size.x || !size.y) {
        // Not laid out yet — retry shortly without consuming the single-run guard.
        timeoutId = setTimeout(run, 500)
        return
      }
      if (preloadedRef.current) return
      preloadedRef.current = true
      preloadJumpTiles(map, path)
    }

    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void) => number
    }).requestIdleCallback
    if (typeof ric === 'function') {
      idleId = ric(run)
    } else {
      timeoutId = setTimeout(run, 1500)
    }

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      const cic = (window as unknown as {
        cancelIdleCallback?: (id: number) => void
      }).cancelIdleCallback
      if (idleId !== undefined && typeof cic === 'function') cic(idleId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, path])

  return null
}

export function JourneyMap({
  stops,
  activeId,
  progress,
  hideProgress = false,
}: {
  stops: Stop[]
  activeId: string
  progress: number
  /** Hide the bright "traveled" line + comet (e.g. during scroll-to-top) so the
   *  path doesn't visibly rewind. The faint planned route + markers stay. */
  hideProgress?: boolean
}) {
  const path = useMemo(() => stops.map((s) => s.coords), [stops])

  // The city the camera is currently parked over — captioned below, since the
  // tiles are deliberately label-free. Crossfades as the active stop changes,
  // so the cross-country jump (Phoenix → New York) actually lands.
  const activeCity = useMemo(
    () => (stops.find((s) => s.id === activeId) ?? stops[0]).city,
    [stops, activeId],
  )

  // A segment is part of the drawn career line only when it connects two NEAR
  // JOBS. Far jumps draw no connection (the zoom-out/in carries it), and any
  // segment touching the alma mater stays unconnected — it's the journey's
  // origin, a place on the map, not a step in the career path.
  const isLinked = (s: number) =>
    !isJump(path, s) && stops[s].kind === 'job' && stops[s + 1].kind === 'job'

  // Base dashed line. (Multi-polyline: Leaflet accepts an array of segments.)
  const baseSegments = useMemo<[number, number][][]>(
    () =>
      stops
        .slice(0, -1)
        .map((_, s) => s)
        .filter(isLinked)
        .map((s) => [path[s], path[s + 1]]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stops, path],
  )

  // Bright line builds as you scroll: empty at the top (progress 0), lighting up
  // from the top DOWN to the current position. So at any pin it's lit from the
  // first stop down to that pin, with the current segment trimmed at the live
  // tip. (Jumps + alma-mater are excluded via isLinked.)
  const traveledSegments = useMemo<[number, number][][]>(() => {
    const segs: [number, number][][] = []
    for (let s = 0; s < path.length - 1; s++) {
      if (!isLinked(s) || progress <= s) continue
      const end = progress >= s + 1 ? path[s + 1] : lerpMerc(path[s], path[s + 1], progress - s)
      segs.push([path[s], end])
    }
    return segs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, path, progress])

  // Full flight-path arcs for every JUMP segment — STATIC (depends on `path`
  // only), so the (mildly costly) Bézier sampling + Mercator projection runs
  // once. Per-frame work is just `.slice()` on these arrays.
  const jumpArcs = useMemo(() => {
    const arcs: { s: number; points: [number, number][] }[] = []
    for (let s = 0; s < path.length - 1; s++) {
      if (!isJump(path, s)) continue
      arcs.push({ s, points: buildArc(path[s], path[s + 1]) })
    }
    return arcs
  }, [path])

  // Per-frame reveal — cheap: only array slicing on the memoized arcs.
  // For each jump arc, the revealed fraction comes straight from `progress`, so
  // the arc grows forward and recedes backward as a pure function of scroll.
  const dashedArcs: [number, number][][] = []
  const revealedArcs: [number, number][][] = []
  let cometTip: [number, number] | null = null
  for (const { s, points } of jumpArcs) {
    dashedArcs.push(points) // always show the planned route faintly
    const frac = Math.max(0, Math.min(1, progress - s))
    if (frac <= 0) continue
    const lastIdx = Math.round(frac * (points.length - 1))
    const revealed = points.slice(0, lastIdx + 1)
    revealedArcs.push(revealed)
    if (frac > 0 && frac < 1) cometTip = revealed[revealed.length - 1] // mid-jump only
  }

  // Markers only depend on which job is active — keep them out of the
  // per-frame scroll re-render so the pulse animation doesn't restart.
  const markers = useMemo(
    () =>
      stops.map((stop) => (
        <Marker
          key={stop.id}
          position={stop.coords}
          icon={markerIcon(stop, stop.id === activeId)}
          eventHandlers={{
            // Jump straight to that card's state. Must be 'instant', NOT 'auto':
            // 'auto' falls back to the global `scroll-behavior: smooth`, which
            // sweeps progress through every segment (the "fly in rewind").
            // 'instant' forces a non-animated jump so the line/map just snap.
            click: () =>
              document.getElementById(`stop-${stop.id}`)?.scrollIntoView({ behavior: 'instant', block: 'center' }),
          }}
        >
          {/* Hover-to-explore: a recruiter can read any stop without scrolling. */}
          <Tooltip direction="top" offset={[0, -9]} opacity={1} className="jm-tip">
            {stop.kind === 'job' ? (
              <>
                <span className="jm-tip__title">{stop.company}</span>
                <span className="jm-tip__sub">{stop.role}</span>
                <span className="jm-tip__meta">{stop.period} · {stop.city}</span>
              </>
            ) : (
              <>
                <span className="jm-tip__title">{stop.school}</span>
                <span className="jm-tip__sub">{stop.degree}</span>
                <span className="jm-tip__meta">Class of {stop.year} · {stop.city}</span>
              </>
            )}
          </Tooltip>
        </Marker>
      )),
    [stops, activeId],
  )

  return (
    <div className="jm-root h-full w-full">
      <MapContainer
        center={stops[0].coords}
        zoom={DOT_ZOOM}
        zoomSnap={0} // allow fractional zoom so flyToBounds frames segments exactly
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false} // map is a controlled cinematic surface; page scroll drives it
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false} // replaced by the custom one below (drops the "Leaflet" prefix)
        fadeAnimation={false} // no per-tile opacity transition — removes zoom-scrub stutter
        className="h-full w-full bg-slate-950"
      >
        {/* Standard map-data attribution (OSM + CARTO), no Leaflet prefix. */}
        <AttributionControl position="bottomright" prefix={false} />
        {/* SYNC: preloadJumpTiles() above hardcodes this exact url template +
            default subdomains ('abc') + no retina suffix (detectRetina off, so
            {r} → ''). Keep them in lockstep or the preload cache will miss. */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution={
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
          }
          keepBuffer={1} // minimal off-screen ring — the preload warms the cache, so a big
          //                buffer just adds DOM/tiles to rebuild on each zoom-level crossing
          updateWhenZooming={false} // don't re-request tiles every frame of the zoom;
          updateWhenIdle={true} //     scale existing tiles, then load detail once it settles
        />

        {/* Near segments, dim + dashed (far jumps draw no connection). */}
        <Polyline
          positions={baseSegments}
          pathOptions={{ color: '#334155', weight: 1.5, dashArray: '4 8', opacity: 0.8 }}
        />
        {/* Traveled portion, bright and glowing — fills as you scroll. Hidden
            during scroll-to-top so the line doesn't visibly rewind. */}
        {!hideProgress && (
          <Polyline positions={traveledSegments} pathOptions={{ color: '#38bdf8', weight: 2.5, opacity: 0.95 }} />
        )}

        {/* JUMP flight-path arcs. Glow is built from LAYERED STROKES (a wide,
            faint underlay beneath the bright stroke) — NO SVG filter/drop-shadow
            on these polylines, which redraw every frame. Dashed full arc is the
            always-on route preview; the bright arc + glow grow with `progress`. */}
        {dashedArcs.map((pts, i) => (
          <Polyline
            key={`jump-preview-${i}`}
            positions={pts}
            pathOptions={{ color: '#334155', weight: 1.5, dashArray: '4 8', opacity: 0.6 }}
          />
        ))}
        {!hideProgress &&
          revealedArcs.map((pts, i) => (
            <Polyline
              key={`jump-glow-${i}`}
              positions={pts}
              pathOptions={{ color: '#38bdf8', weight: 8, opacity: 0.12 }}
            />
          ))}
        {!hideProgress &&
          revealedArcs.map((pts, i) => (
            <Polyline
              key={`jump-bright-${i}`}
              positions={pts}
              pathOptions={{ color: '#38bdf8', weight: 2.5, opacity: 0.95 }}
            />
          ))}
        {!hideProgress && cometTip && (
          <>
            <CircleMarker
              center={cometTip}
              radius={9}
              pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.18, weight: 0 }}
            />
            <CircleMarker
              center={cometTip}
              radius={3.5}
              pathOptions={{ color: '#e0f2fe', fillColor: '#e0f2fe', fillOpacity: 1, weight: 0, className: 'jm-comet' }}
            />
          </>
        )}

        {markers}

        <ScrollCamera path={path} progress={progress} />
      </MapContainer>

      {/* Place-name caption — names the label-free map. Keyed on the city so it
          remounts and replays its fade each time the active stop changes. */}
      <div className="jm-place" key={activeCity}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="jm-place__pin">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
        <span>{activeCity}</span>
      </div>

      {/* Soft vignette (non-interactive). */}
      <div className="jm-vignette" />
    </div>
  )
}
