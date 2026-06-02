const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true, disabled: false },
  { icon: 'explore', label: 'Live Map', active: false, disabled: true },
  { icon: 'tsunami', label: 'Trends', active: false, disabled: true },
  { icon: 'settings', label: 'Settings', active: false, disabled: true },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-2xl border-t border-outline-variant/10 md:hidden">
      <div className="flex justify-around items-center h-20 px-sm">
        {navItems.map((item) => (
          <button
            key={item.label}
            disabled={item.disabled}
            className={`flex flex-col items-center gap-xs px-md py-sm ${
              item.active
                ? 'bg-secondary-container text-on-secondary-container rounded-xl'
                : 'text-on-surface-variant'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings: '"FILL" 1' } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium tracking-wider">{item.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
