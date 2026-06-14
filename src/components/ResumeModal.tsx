import { memo, useEffect, useRef } from 'react'
import { FaDownload, FaTimes } from 'react-icons/fa'

/**
 * Résumé preview modal. Recruiters are (reasonably) wary of a bare "Download"
 * button, so the primary action opens an inline PDF preview here; downloading
 * is the secondary step once they've actually seen it.
 *
 * PDF-in-<iframe> is unreliable on mobile Safari (often blank), so a visible
 * "Open the PDF" fallback link is always shown beneath the frame.
 */
export const ResumeModal = memo(function ResumeModal({
  href,
  open,
  onClose,
}: {
  href: string
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      // Keep focus inside the dialog while it's open.
      const f = dialog.querySelectorAll<HTMLElement>('a[href],button,iframe,[tabindex]:not([tabindex="-1"])')
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // lock background scroll
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Résumé preview"
      onClick={onClose} // backdrop click closes
      className="fixed inset-0 z-[60] flex flex-col bg-slate-950/85 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()} // clicks inside shouldn't close
        className="mx-auto flex h-full w-full max-w-4xl flex-col"
      >
        <div className="flex items-center justify-between gap-3 pb-3">
          <h2 className="text-sm font-semibold tracking-tight text-white">Résumé</h2>
          <div className="flex items-center gap-2">
            <a
              href={href}
              download
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white outline-none transition hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <FaDownload className="text-[0.7rem]" aria-hidden />
              <span>Download</span>
            </a>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close résumé preview"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <FaTimes aria-hidden />
            </button>
          </div>
        </div>

        <iframe
          src={`${href}#view=FitH`}
          title="Résumé preview"
          className="min-h-0 w-full flex-1 rounded-lg border border-white/10 bg-white"
        />

        {/* Always-visible fallback — iframe PDF preview is flaky on mobile. */}
        <p className="pt-3 text-center text-xs text-slate-500">
          Can’t see it?{' '}
          <a href={href} target="_blank" rel="noreferrer" className="text-sky-400 underline-offset-2 hover:underline">
            Open the PDF in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  )
})
