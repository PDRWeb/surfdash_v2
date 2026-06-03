import { useEffect, useState } from 'react'

const SHOW_AFTER_PX = 400

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-2xl border-t border-outline-variant/10 md:hidden">
      <div className="flex justify-center items-center h-16 px-sm">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-sm bg-secondary-container text-on-secondary-container rounded-xl px-lg py-sm"
        >
          <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
          <span className="text-sm font-semibold tracking-wide">BACK TO TOP</span>
        </button>
      </div>
    </nav>
  )
}
