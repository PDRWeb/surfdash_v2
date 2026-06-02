import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { QueryResult, StationPing } from '../lib/types'
import { mockStationPings } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useStationPings() {
  return useQuery({
    queryKey: ['station-pings'],
    queryFn: async (): Promise<QueryResult<StationPing[]>> => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: mockStationPings, source: 'mock' }
      }
      const { data, error } = await supabase.from('station_latest_ui').select('*')
      if (error) throw error
      return { data: (data as StationPing[]) ?? [], source: 'live' }
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  })
}
