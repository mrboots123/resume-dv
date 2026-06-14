import { useEffect, useRef, useState } from 'react'

// How quickly `progress` chases the scroll target each frame (0–1). Lower =
// gentler/slower glide (less motion-sickness), higher = snappier. ~60fps.
const DAMP = 0.1
// A single-frame target jump larger than this = a programmatic scroll
// (pin-click scrollIntoView), not a gradual scroll → snap instead of easing
// through every stop (which would look like a "rewind").
const JUMP_SNAP = 0.6

/**
 * Tracks scroll position relative to a set of tracked elements and returns:
 *  - `activeId`  — the element nearest the (eased) current position
 *  - `progress`  — a continuous, DAMPED float in [0, n] (n = ids.length - 1).
 *                  The scroll position sets a target; `progress` eases toward it
 *                  so the map glides instead of lurching 1:1 with the scroll.
 *  - `register`  — ref-callback to attach to each tracked element.
 */
export function useActiveOnScroll(ids: string[], initial: string) {
  const [activeId, setActiveId] = useState(initial)
  const [progress, setProgress] = useState(0)
  const els = useRef(new Map<string, HTMLElement>())
  const targetRef = useRef(0) // scroll-derived target (undamped)
  const progressRef = useRef(0) // latest eased value (avoids stale closures)

  // Stable ref-callback per id. Returning a fresh closure each render would
  // give every TimelineCard a new prop on every scroll frame, defeating memo
  // and re-rendering the whole list 60×/s.
  const cbs = useRef(new Map<string, (el: HTMLElement | null) => void>())
  const register = (id: string) => {
    let cb = cbs.current.get(id)
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) els.current.set(id, el)
        else els.current.delete(id)
      }
      cbs.current.set(id, cb)
    }
    return cb
  }

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const n = ids.length - 1
    let scrollFrame = 0
    let easeFrame = 0

    // Commit a value to both the ref and React state, plus the derived active id.
    const commit = (val: number) => {
      progressRef.current = val
      setProgress((p) => (p === val ? p : val))
      const a = ids[Math.max(0, Math.min(n, Math.round(val)))]
      setActiveId((prev) => (prev === a ? prev : a))
    }

    // rAF loop: ease progress toward the target until settled, then stop (so we
    // don't re-render forever while idle).
    const ease = () => {
      const target = targetRef.current
      const next = progressRef.current + (target - progressRef.current) * DAMP
      const settled = Math.abs(target - next) < 0.0015
      commit(settled ? target : next)
      easeFrame = settled ? 0 : requestAnimationFrame(ease)
    }
    const startEase = () => {
      if (!easeFrame) easeFrame = requestAnimationFrame(ease)
    }

    const measure = () => {
      scrollFrame = 0
      const mid = window.innerHeight / 2

      // Card centers in screen coords, in list order (index 0 = topmost).
      const centers = ids.map((id) => {
        const el = els.current.get(id)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return r.top + r.height / 2
      })

      let t = 0
      if (centers[0] != null && mid <= centers[0]) {
        t = 0 // above the first card
      } else if (centers[n] != null && mid >= centers[n]) {
        t = n // past the last card
      } else {
        for (let i = 0; i < n; i++) {
          const a = centers[i]
          const b = centers[i + 1]
          if (a == null || b == null) continue
          if (mid >= a && mid <= b) {
            t = i + (mid - a) / (b - a)
            break
          }
        }
      }

      const prev = targetRef.current
      targetRef.current = t

      // Snap (no easing) for reduced-motion users, or when the target jumps far
      // in one frame (a pin-click instant scroll) so we don't crawl through every
      // stop. Otherwise let the eased glide handle it.
      if (reduce || Math.abs(t - prev) > JUMP_SNAP) {
        if (easeFrame) {
          cancelAnimationFrame(easeFrame)
          easeFrame = 0
        }
        commit(t)
      } else {
        startEase()
      }
    }

    // Throttle scroll measurement to one per animation frame.
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      if (easeFrame) cancelAnimationFrame(easeFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // ids is stable for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  return { activeId, progress, register }
}
