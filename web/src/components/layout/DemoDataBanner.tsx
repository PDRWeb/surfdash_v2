interface DemoDataBannerProps {
  sections: string[]
}

export function DemoDataBanner({ sections }: DemoDataBannerProps) {
  if (sections.length === 0) return null

  return (
    <div
      role="status"
      className="bg-tertiary-container/20 border border-outline-variant/40 rounded-xl px-md py-sm flex gap-sm items-start"
    >
      <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">info</span>
      <div>
        <p className="text-sm font-semibold text-on-surface">Demo data</p>
        <p className="text-xs text-on-surface-variant mt-xs">
          Showing sample data for {sections.join(', ')}. Live pipeline data is not available yet.
        </p>
      </div>
    </div>
  )
}
