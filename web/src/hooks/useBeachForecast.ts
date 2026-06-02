import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { BeachForecast, QueryResult } from '../lib/types'
import { getMockForecastForSlug } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useBeachForecast(slug: string) {
  return useQuery({
    queryKey: ['beach-forecast', slug],
    queryFn: async (): Promise<QueryResult<BeachForecast[]>> => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: getMockForecastForSlug(slug), source: 'mock' }
      }
      const { data, error } = await supabase
        .from('beach_forecast_ui')
        .select('*')
        .eq('slug', slug)
        .order('forecast_hour')
      if (error) throw error
      return { data: (data as BeachForecast[]) ?? [], source: 'live' }
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
    enabled: Boolean(slug),
  })
}
