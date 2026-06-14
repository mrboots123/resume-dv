import { memo } from 'react'
import type { EducationItem } from '../data/resume'
import { asset } from '../data/resume'

/**
 * The alma-mater stop — the journey's origin, NOT a job. Deliberately minimal:
 * no bordered card, no index, no bullets/stack — just where it began. It still
 * registers with the scroll tracker (so the map can mark the origin), and dims
 * with `focus` like the other stops, but stays visually quiet so it never reads
 * as another role. `index`/`active` are accepted (App spreads them to every
 * stop) but unused here.
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
    <article id={`stop-${edu.id}`} ref={register} className="snap-center py-8">
      <div style={{ opacity: 0.4 + 0.6 * focus }} className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/90 p-1.5">
          <img src={asset(edu.logo)} alt={`${edu.school} logo`} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Alma mater</p>
          <p className="mt-0.5 text-sm font-semibold text-white">{edu.school}</p>
          <p className="text-sm text-slate-400">
            {edu.degree} · {edu.year}
          </p>
        </div>
      </div>
    </article>
  )
})
