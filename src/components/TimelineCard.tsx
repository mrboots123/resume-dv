import { memo, useCallback, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Job } from '../data/resume'
import { asset } from '../data/resume'
import { TECH } from './icons'

export const TimelineCard = memo(function TimelineCard({
  job,
  index,
  active,
  focus,
  register,
}: {
  job: Job
  index: number
  active: boolean
  // Attention-handoff focus: 1 when this card is centered, → 0 with distance.
  // Drives only an inner-wrapper opacity (compositor-cheap), leaving the
  // article's own entrance/spotlight opacity untouched.
  focus: number
  register: (el: HTMLElement | null) => void
}) {
  // Drive a "spotlight" swell off this card's own position in the viewport.
  // useScroll/useTransform write straight to the DOM (no React re-render per
  // frame), so it composes with the memo above and stays smooth.
  const cardRef = useRef<HTMLElement | null>(null)
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      cardRef.current = el
      register(el) // also feed the parent's active-on-scroll tracker
    },
    [register],
  )
  // 0 when the card enters at the bottom → 0.5 when its center hits the
  // viewport center → 1 when it exits the top.
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] })
  // Grow above normal only within a narrow band around dead-center; snap back
  // to normal (scale 1) as soon as it drifts up or down. Others dim slightly so
  // the focused card owns the space.
  const scale = useTransform(scrollYProgress, [0.34, 0.5, 0.66], [1, 1.06, 1])
  const opacity = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.45, 1, 0.45])
  // Reduced motion: drop the scroll-driven scale swell (the moving part); the
  // opacity focus stays since a cross-fade isn't motion.
  const reduce = useReducedMotion()

  // One flat row — front-end techs lit and listed first, back-end & infra grayed
  // after. Color carries the pitch: "front-end specialist, full-stack capable."
  // Stable sort keeps each group's original order.
  const isFrontend = (key: string) => TECH[key]?.category === 'Frontend'
  const stack = [...job.stack].sort((a, b) => (isFrontend(a) ? 0 : 1) - (isFrontend(b) ? 0 : 1))

  return (
    <motion.article
      id={`stop-${job.id}`}
      ref={setRef}
      data-active={active}
      style={{ scale: reduce ? 1 : scale, opacity, transformOrigin: 'center' }}
      className={`group relative snap-center rounded-2xl border p-5 transition-colors duration-500 will-change-transform sm:p-6 ${
        active
          ? 'border-sky-500/60 bg-slate-900/80 shadow-[0_0_40px_-12px_rgba(56,189,248,0.5)]'
          : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      {/* Inner content carries the attention-handoff focus opacity. Kept separate
          from the article so framer-motion's entrance/spotlight opacity (on the
          article) is never overridden. Opacity-only → compositor-cheap, no transition
          (driven per-frame from progress). Centered card → 1.0, neighbors at rest → ~0.35. */}
      <div style={{ opacity: 0.35 + 0.65 * focus }}>
      {/* Period rail marker */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-500 ${
            active ? 'bg-sky-400 ring-4 ring-sky-400/20' : 'bg-slate-600'
          }`}
        />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{job.period}</span>
        <span className="ml-auto text-xs text-slate-400">{job.city}</span>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/95 p-2">
          <img src={asset(job.logo)} alt={`${job.company} logo`} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{job.role}</h3>
          <p className="text-sm font-medium text-sky-400">{job.company}</p>
          {job.scope && job.scope.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {job.scope.map((tag) => (
                <li
                  key={tag}
                  className="flex items-center rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="ml-auto text-3xl font-bold tabular-nums text-slate-700">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Headline (lighter summary line, subordinate to the role) + deliverables */}
      <div className="mt-4">
        <p className="text-[15px] font-medium text-slate-200">{job.headline}</p>
        <ul className="mt-2 space-y-1.5">
          {job.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-slate-300">
              <span aria-hidden className="mt-px shrink-0 text-sky-500/70">▸</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {job.selfRef && (
          <p className="mt-3 flex gap-2 text-sm italic leading-relaxed text-sky-300/90">
            <span aria-hidden className="not-italic text-sky-400/80">↳</span>
            <span>{job.selfRef}</span>
          </p>
        )}
      </div>

      {/* Stack — one flat row, defining techs emphasized. */}
      <ul className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
        {stack.map((key) => {
          const tech = TECH[key]
          if (!tech) return null
          const { Icon, label } = tech
          return (
            <li
              key={key}
              className={
                isFrontend(key)
                  ? 'flex items-center gap-1.5 rounded-md border border-sky-400/50 bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-200'
                  : 'flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-800/50 px-2 py-1 text-xs text-slate-400'
              }
            >
              <Icon className="text-sm" aria-hidden />
              {label}
            </li>
          )
        })}
      </ul>
      </div>
    </motion.article>
  )
})
