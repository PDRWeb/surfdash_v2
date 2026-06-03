import { useEffect, useRef, useState } from 'react'
import { statusDescription } from '../../lib/statusLabels'

interface StatusInfoTooltipProps {
  label: string
}

export function StatusInfoTooltip({ label }: StatusInfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <span ref={rootRef} className="relative inline-flex group shrink-0">
      <button
        type="button"
        aria-label={`About ${label} status`}
        aria-expanded={open}
        className="text-on-surface-variant hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-sm"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="material-symbols-outlined text-base leading-none">info</span>
      </button>
      <span
        role="tooltip"
        className={`absolute left-0 top-full z-[600] mt-1 w-56 rounded-lg border border-outline-variant/40 bg-surface-container-high px-sm py-xs text-xs leading-relaxed text-on-surface-variant shadow-lg ${
          open ? 'block' : 'hidden md:group-hover:block'
        }`}
      >
        {statusDescription(label)}
      </span>
    </span>
  )
}
