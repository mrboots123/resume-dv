import { memo } from 'react'
import { FaGraduationCap } from 'react-icons/fa'
import type { EducationItem } from '../data/resume'
import { asset } from '../data/resume'

/**
 * The alma-mater stop — the journey's ORIGIN, not a job. It now shares the job
 * cards' visual language (same bordered tile, logo treatment, sky-accented
 * sub-line) so it reads as polished, not unfinished — but stays distinct: an
 * "Education" eyebrow + graduation-cap mark instead of an index number, and no
 * stack chips or deliverables. It registers with the scroll tracker (so the map
 * can mark the origin) and dims with `focus` like every other stop.
 * `index`/`active` are accepted (App spreads them to every stop) but unused.
 */
export const EducationCard = memo(function EducationCard({
  edu,
  focus,
  register,
}: {
  edu: EducationItem
  index: number
  active: boolean
  focus: number
  register: (el: HTMLElement | null) => void
}) {
  return (
    <article id={`stop-${edu.id}`} ref={register} className="snap-center py-4">
      <div style={{ opacity: 0.4 + 0.6 * focus }}>
        {/* Origin eyebrow — the sky dot mirrors the job cards' period rail, tying
            this to the same timeline while the label marks it as the start. */}
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">Education</span>
          <span className="ml-auto text-xs text-slate-400">{edu.city}</span>
        </div>

        <div className="mt-3 flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/95 p-2">
            <img src={asset(edu.logo)} alt={`${edu.school} logo`} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white">{edu.school}</h3>
            <p className="text-sm font-medium text-sky-400">{edu.degree}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Class of {edu.year}</p>
          </div>
          <FaGraduationCap aria-hidden className="ml-auto shrink-0 text-2xl text-slate-700" />
        </div>
      </div>
    </article>
  )
})
