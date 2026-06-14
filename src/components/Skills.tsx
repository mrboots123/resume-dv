import { memo } from 'react'
import type { Resume } from '../data/resume'

/**
 * Flat, scannable skills block. The cards tell the story; this is the keyword
 * surface a recruiter Ctrl-Fs for ("PostgreSQL", "Next.js") to confirm fit.
 * Grouped by category, plain text — deliberately easy to skim, not animated.
 */
export const Skills = memo(function Skills({ resume }: { resume: Resume }) {
  return (
    <section className="snap-start py-12">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Skills</h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {resume.skills.map((group) => (
          <div key={group.category}>
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{group.category}</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
})
