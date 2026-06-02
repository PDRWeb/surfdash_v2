interface BeachPickerProps {
  beaches: { slug: string; name: string }[]
  selectedSlug: string
  onSelect: (slug: string) => void
}

export function BeachPicker({ beaches, selectedSlug, onSelect }: BeachPickerProps) {
  return (
    <div className="flex overflow-x-auto gap-sm no-scrollbar pb-sm md:hidden">
      {beaches.map((beach) => (
        <button
          key={beach.slug}
          onClick={() => onSelect(beach.slug)}
          className={`shrink-0 px-md py-sm rounded-full text-sm font-semibold tracking-wide transition-colors ${
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
