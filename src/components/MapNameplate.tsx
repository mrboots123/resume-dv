import { memo } from 'react'
import { FaRegEye } from 'react-icons/fa'
import type { ContactLink } from '../data/resume'
import { CONTACT_ICON } from './icons'

/**
 * Persistent contact bar that anchors to the top of the viewport once the hero
 * intro has scrolled away. Name is centered (in the viewport, not the column),
 * the contact icons sit on the right and are clickable — so a recruiter who has
 * "seen enough" can reach out from any scroll position without hunting.
 *
 * The real <h1> lives in Hero; the name here is a span (not a heading) so it
 * doesn't register as a second document heading.
 */
export const MapNameplate = memo(function MapNameplate({
  name,
  title,
  contacts,
  onViewResume,
  visible,
}: {
  name: string
  title: string
  contacts: ContactLink[]
  onViewResume: () => void
  visible: boolean
}) {
  return (
    <header
      aria-label="Contact"
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
    >
      <div className="relative flex h-14 items-center px-4 sm:px-6">
        {/* Centered identity — absolute so it centers on the viewport regardless
            of how wide the icon group is. */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center leading-tight">
          <span className="block text-base font-bold tracking-tight text-white sm:text-lg">{name}</span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-sky-400 sm:block">
            {title}
          </span>
        </div>

        {/* Contact actions, anchored right. */}
        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {contacts.map((c) => {
            const Icon = CONTACT_ICON[c.icon]
            return (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={c.label}
                title={c.label}
                className="rounded-full p-2 text-slate-300 outline-none transition hover:bg-white/10 hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Icon className="text-lg" aria-hidden />
              </a>
            )
          })}

          {/* Primary CTA — opens the résumé preview (download lives inside it). */}
          <button
            type="button"
            onClick={onViewResume}
            aria-label="View résumé"
            className="ml-1.5 flex items-center gap-1.5 rounded-full bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white outline-none transition hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <FaRegEye className="text-[0.8rem]" aria-hidden />
            <span>Resume</span>
          </button>
        </nav>
      </div>
    </header>
  )
})
