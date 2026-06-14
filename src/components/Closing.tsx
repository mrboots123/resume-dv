import { memo } from 'react'
import type { Resume } from '../data/resume'

export const Closing = memo(function Closing({ resume }: { resume: Resume }) {
  return (
    <section className="snap-start space-y-10 py-16">
      {/* Education now lives on the map as the journey's origin (see EducationCard),
          so it's no longer duplicated here — this section is just the sign-off. */}
      <footer className="border-t border-slate-800 pt-8">
        <p className="text-sm text-slate-400">That’s where it started.</p>
        <p className="mt-1 text-lg font-semibold text-white sm:text-xl">Let’s build what’s next.</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {resume.contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="text-sky-400 underline-offset-2 hover:underline"
            >
              {c.display}
            </a>
          ))}
        </div>
      </footer>
    </section>
  )
})
