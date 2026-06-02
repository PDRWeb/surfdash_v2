interface SidebarProps {
  selectedSlug: string
  onSelectBeach: (slug: string) => void
  beaches: { slug: string; name: string }[]
}

export function Sidebar({ selectedSlug, onSelectBeach, beaches }: SidebarProps) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-outline-variant flex-col py-lg px-md z-50 bg-surface">
      <div className="mb-xl px-md">
        <h1 className="text-xl font-bold text-secondary-container">surfdash</h1>
        <p className="text-on-surface-variant text-sm font-semibold tracking-wide">Real-Time Wave Data</p>
      </div>
      <nav className="flex-1 space-y-xs">
        <div className="flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-md py-sm">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-semibold tracking-wide">Dashboard</span>
        </div>
        {beaches.map((beach) => (
          <button
            key={beach.slug}
            onClick={() => onSelectBeach(beach.slug)}
            className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors text-left ${
              selectedSlug === beach.slug
                ? 'bg-surface-container-high text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">beach_access</span>
            <span className="text-sm font-semibold tracking-wide">{beach.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
