import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Beach, QueryResult } from '../lib/types'
import { mockBeaches } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useBeaches() {
  return useQuery({
    queryKey: ['beaches'],
    queryFn: async (): Promise<QueryResult<Beach[]>> => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: mockBeaches, source: 'mock' }
      }
      const { data, error } = await supabase.from('beaches_ui').select('*').order('display_order')
      if (error) throw error
      return { data: data as Beach[], source: 'live' }
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  })
}
