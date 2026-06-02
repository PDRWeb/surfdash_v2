import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { BeachStatus } from '../lib/types'
import { getMockStatusForSlug } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useBeachStatus(slug: string) {
  return useQuery({
    queryKey: ['beach-status', slug],
    queryFn: async (): Promise<BeachStatus> => {
      if (!isSupabaseConfigured || !supabase) return getMockStatusForSlug(slug)
      const { data, error } = await supabase
        .from('beach_status_ui')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      if (!data) return getMockStatusForSlug(slug)
      return data as BeachStatus
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
    enabled: Boolean(slug),
  })
}
