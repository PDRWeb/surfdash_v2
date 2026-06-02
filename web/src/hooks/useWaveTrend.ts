import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { QueryResult, WaveTrendPoint } from '../lib/types'
import { mockWaveTrend } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useWaveTrend(stationId = '41113', hours = 24) {
  return useQuery({
    queryKey: ['wave-trend', stationId, hours],
    queryFn: async (): Promise<QueryResult<WaveTrendPoint[]>> => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: mockWaveTrend, source: 'mock' }
      }
      const since = new Date(Date.now() - hours * 3600000).toISOString()
      const { data, error } = await supabase
        .from('wave_trend_ui')
        .select('*')
        .eq('station_id', stationId)
        .gte('observed_at', since)
        .order('observed_at')
      if (error) throw error
      return { data: (data as WaveTrendPoint[]) ?? [], source: 'live' }
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  })
}
