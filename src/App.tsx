import { useEffect, useMemo, useRef, useState } from 'react'
import { FaChevronUp } from 'react-icons/fa'
import { resume, stops } from './data/resume'
import { JourneyMap } from './components/JourneyMap'
import { Hero } from './components/Hero'
import { MapNameplate } from './components/MapNameplate'
import { TimelineCard } from './components/TimelineCard'
import { EducationCard } from './components/EducationCard'
import { Closing } from './components/Closing'
import { ResumeModal } from './components/ResumeModal'
import { useActiveOnScroll } from './hooks/useActiveOnScroll'

export function App() {
  // `stops` is stored oldest → newest (alma mater first, then jobs); present it
  // newest-first (reverse-chron, the resume standard) so scrolling down travels
  // back in time, ending at the origin: ASU. Reversing here keeps cards, ids,
  // and the map path all derived from one array, so they stay perfectly in sync.
  const orderedStops = useMemo(() => [...stops].reverse(), [])
  const ids = useMemo(() => orderedStops.map((s) => s.id), [orderedStops])

  // One source for the résumé PDF link — shared by the hero CTA, the persistent
  // contact bar, and the preview modal.
  const resumeHref = `${import.meta.env.BASE_URL}resume/Diego_Vazquez_Resume.pdf`

  // The résumé opens in a preview modal first (download is the secondary step),
  // so a recruiter can read it without committing to a download.
  const [resumeOpen, setResumeOpen] = useState(false)
  const { activeId, progress, register } = useActiveOnScroll(ids, ids[0])

  // Re-anchor the name over the map once the hero intro has scrolled past.
  const [heroPassed, setHeroPassed] = useState(false)

  // Back-to-top jumps INSTANTLY to the top, exactly like a page refresh — no
  // smooth-scroll sweep through the journey. `hidePath` suppresses the bright
  // line for the brief moment between the jump and `progress` re-measuring, so
  // there's no one-frame flash of the fully-drawn path at the top.
  const [hidePath, setHidePath] = useState(false)
  const scrollToTop = () => {
    setHidePath(true)
    // 'instant' (not the default 'auto') — 'auto' obeys the global
    // `html { scroll-behavior: smooth }`, which is what was animating the jump.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Clear the suppression once progress has actually settled back to the top —
  // that's the frame the empty line is correct, so the reveal never flashes.
  useEffect(() => {
    if (hidePath && progress <= 0.001) setHidePath(false)
  }, [hidePath, progress])

  // Scroll-driven "attention handoff": at any instant only one zone is loud.
  // Card centered (at rest) → card full, map dimmed ("read the card").
  // Scrolling between cards (in transit) → cards dim, map full ("watch the journey").
  // Both come from one continuous signal — distance from the nearest card center —
  // so the crossfade is smooth with no flips.
  const FALLOFF = 0.6 // how sharply focus falls off with distance (smaller = snappier)
  const nearest = Math.round(progress)
  const dist = Math.abs(progress - nearest) // 0 = a card centered, →0.5 = mid-transit
  const centeredness = Math.max(0, Math.min(1, 1 - dist / FALLOFF)) // 1 centered, ~0.17 mid-transit
  // Map is LOUD when no card is centered. Stay full until the hero is passed
  // (intro stays vibrant). Gentle recede only — with snap you sit at rest most
  // of the time, so a deep dim leaves the map looking permanently greyed.
  // → ~0.82 at rest, ~0.97 mid-transit, 1 during hero.
  const mapOpacity = heroPassed ? 1 - 0.18 * centeredness : 1
  const heroSentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroSentinel.current
    if (!el) return
    const observer = new IntersectionObserver(
      // The sentinel sits just below the hero and starts well below the shrunk
      // root's top edge (40% down the viewport), so it begins INTERSECTING.
      // It stops intersecting once it rises past that line — i.e. the hero is
      // ~60% scrolled away — which reveals the bar. Scrolling back up
      // re-intersects and hides it again. (No top<0 guard: with a negative top
      // rootMargin the exit happens while top is still positive, so that guard
      // would prevent the reveal from ever latching.)
      ([entry]) => setHeroPassed(!entry.isIntersecting),
      { rootMargin: '-40% 0px 0px 0px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30">
      {/* Persistent contact bar — reveals once the hero scrolls past so a
          recruiter can reach out from any point in the journey. */}
      <MapNameplate
        name={resume.name}
        title={resume.title}
        contacts={resume.contacts}
        onViewResume={() => setResumeOpen(true)}
        visible={heroPassed}
      />

      {/* Mobile: map pinned as a banner while you scroll the timeline. */}
      <div className="sticky top-0 z-0 h-[42vh] w-full lg:hidden">
        {/* Only the map tiles/journey dim (recede to context); MapNameplate stays full. */}
        <div className="h-full w-full" style={{ opacity: mapOpacity }}>
          <JourneyMap stops={orderedStops} activeId={activeId} progress={progress} hideProgress={hidePath} />
        </div>
      </div>

      <div className="relative lg:flex">
        {/* Desktop: map fixed to the left half, content scrolls on the right. */}
        <aside className="hidden lg:block lg:w-[55%]">
          <div className="sticky top-0 h-screen">
            <div className="h-full w-full" style={{ opacity: mapOpacity }}>
              <JourneyMap stops={orderedStops} activeId={activeId} progress={progress} hideProgress={hidePath} />
            </div>
          </div>
        </aside>

        <main className="relative z-10 min-h-screen w-full rounded-t-3xl bg-slate-950 px-6 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.6)] sm:px-10 lg:w-[45%] lg:rounded-none lg:px-12 lg:shadow-none">
          <Hero resume={resume} onViewResume={() => setResumeOpen(true)} />
          <div ref={heroSentinel} aria-hidden className="h-px w-full" />

          <section className="space-y-6 pb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Experience</h2>
            {orderedStops.map((stop, i) => {
              // Per-card focus from the same continuous signal (no active/inactive
              // branching → avoids flip artifacts). 1 centered, fades with distance.
              const cardFocus = Math.max(0, Math.min(1, 1 - Math.abs(progress - i) / FALLOFF))
              const shared = { index: i, active: activeId === stop.id, focus: cardFocus, register: register(stop.id) }
              return stop.kind === 'education' ? (
                <EducationCard key={stop.id} edu={stop} {...shared} />
              ) : (
                <TimelineCard key={stop.id} job={stop} {...shared} />
              )
            })}
          </section>

          <Closing resume={resume} />
        </main>
      </div>

      {/* Back-to-top — appears once the hero is past. Triggers `hidePath` so the
          journey line doesn't rewind while the page smooth-scrolls up. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/40 bg-slate-900/80 text-sky-300 shadow-lg shadow-sky-500/10 backdrop-blur transition-all duration-300 hover:border-sky-400/70 hover:bg-slate-800 hover:text-sky-200 ${
          heroPassed ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <FaChevronUp className="text-sm" aria-hidden />
      </button>

      <ResumeModal href={resumeHref} open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </div>
  )
}
