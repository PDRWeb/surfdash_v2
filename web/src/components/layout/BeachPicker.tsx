interface BeachPickerProps {
  beaches: { slug: string; name: string }[]
  selectedSlug: string
  onSelect: (slug: string) => void
}

export function BeachPicker({ beaches, selectedSlug, onSelect }: BeachPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-xs md:hidden">
      {beaches.map((beach) => (
        <button
          key={beach.slug}
          onClick={() => onSelect(beach.slug)}
          className={`px-sm py-xs rounded-lg text-xs font-semibold tracking-wide text-center transition-colors ${
            selectedSlug === beach.slug
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {beach.name}
        </button>
      ))}
    </div>
  )
}
