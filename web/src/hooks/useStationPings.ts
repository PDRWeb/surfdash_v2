import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { StationPing } from '../lib/types'
import { mockStationPings } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useStationPings() {
  return useQuery({
    queryKey: ['station-pings'],
    queryFn: async (): Promise<StationPing[]> => {
      if (!isSupabaseConfigured || !supabase) return mockStationPings
      const { data, error } = await supabase.from('station_latest_ui').select('*')
      if (error) throw error
      return (data as StationPing[]) ?? []
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  })
}
