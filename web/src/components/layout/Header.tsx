interface HeaderProps {
  beachName?: string
}

export function Header({ beachName }: HeaderProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-sm">
          <span className="text-base font-extrabold text-on-surface">SurfDash</span>
          <span className="hidden md:inline text-on-surface-variant">|</span>
          <span className="hidden md:inline text-secondary font-semibold text-sm tracking-wide">
            Melbourne, FL
          </span>
        </div>
        <div className="flex items-center gap-md">
          {beachName && (
            <div className="flex items-center text-secondary font-semibold text-sm tracking-wide">
              <span className="material-symbols-outlined mr-1 text-lg">location_on</span>
              {beachName}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
