import { memo } from 'react'
import { motion } from 'motion/react'
import { FaRegEye } from 'react-icons/fa'
import type { Resume } from '../data/resume'
import { yearsOfExperience } from '../data/resume'
import { CONTACT_ICON } from './icons'

export const Hero = memo(function Hero({
  resume,
  onViewResume,
}: {
  resume: Resume
  onViewResume: () => void
}) {
  return (
    <header className="flex min-h-[60vh] snap-start flex-col justify-center py-16">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400"
      >
        {resume.title} · {resume.location}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mt-3 text-5xl font-bold tracking-tight text-white sm:text-6xl"
      >
        {resume.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mt-5 max-w-xl text-base leading-relaxed text-slate-300"
      >
        {resume.tagline.replace('{years}', String(yearsOfExperience()))}
      </motion.p>

      {/* Substance under the hook: years + domains, for instant credibility. */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="mt-3 max-w-xl text-sm text-slate-400"
      >
        {resume.experienceLine.replace('{years}', String(yearsOfExperience()))}
      </motion.p>

      {/* Core stack — one-line keyword summary so a skimmer gets the tech hit
          up front without reading every card. */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-slate-400"
      >
        <span className="font-semibold uppercase tracking-[0.18em] text-sky-400">Core</span>
        <span className="text-slate-200">{resume.coreStack.join(' · ')}</span>
      </motion.p>

      {/* Primary CTA — opens an inline preview (download lives inside it), so a
          recruiter can read the résumé without committing to a download. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.22 }}
        className="mt-8"
      >
        <button
          type="button"
          onClick={onViewResume}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 outline-none transition hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <FaRegEye className="text-sm" aria-hidden />
          <span>View resume</span>
        </button>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 flex flex-wrap gap-3"
      >
        {resume.contacts.map((c) => {
          const Icon = CONTACT_ICON[c.icon]
          return (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={c.label}
                className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-300 transition hover:border-sky-500 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Icon className="text-base" aria-hidden />
                <span>{c.display}</span>
              </a>
            </li>
          )
        })}
      </motion.ul>

    </header>
  )
})
