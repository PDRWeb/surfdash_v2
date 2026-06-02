import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { BeachForecast } from '../lib/types'
import { mockForecast } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useBeachForecast(slug: string) {
  return useQuery({
    queryKey: ['beach-forecast', slug],
    queryFn: async (): Promise<BeachForecast[]> => {
      if (!isSupabaseConfigured || !supabase) return mockForecast
      const { data, error } = await supabase
        .from('beach_forecast_ui')
        .select('*')
        .eq('slug', slug)
        .order('forecast_hour')
      if (error) throw error
      return (data as BeachForecast[]) ?? []
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
    enabled: Boolean(slug),
  })
}
