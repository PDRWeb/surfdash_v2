const STATUS_DESCRIPTIONS: Record<string, string> = {
  FLAT: 'Nearshore and offshore waves are below 1 ft. Minimal surf expected.',
  BUILDING:
    'Offshore swell is running larger than nearshore waves. Local surf may improve as swell pushes in.',
  'WIND CHOP':
    'Nearshore waves are up but wind is strong, creating messy, disorganized surf.',
  'HEAVY SWELL': 'Large nearshore waves with a long-period swell. Powerful surf — use caution.',
  'CLEAN SWELL': 'Organized swell with light wind. Favorable shape for riding.',
  'BLOWN OUT': 'Strong onshore wind is breaking up wave faces. Conditions are messy.',
  ACTIVE: 'Moderate, mixed conditions. Worth checking wind direction and tide timing.',
  EPIC: 'Outstanding surf score across wave size, period, and wind.',
  EXCELLENT: 'Very favorable conditions with solid size and manageable wind.',
  GOOD: 'Surfable conditions with reasonable size and wind.',
  FAIR: 'Marginal surf — size or wind may limit quality.',
  POOR: 'Weak or unfavorable conditions for most surfers.',
}

export function statusDescription(label: string | null | undefined): string {
  if (!label) return STATUS_DESCRIPTIONS.ACTIVE
  const key = label.toUpperCase()
  return STATUS_DESCRIPTIONS[key] ?? `Current conditions: ${label}.`
}
