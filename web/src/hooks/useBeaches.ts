import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Beach } from '../lib/types'
import { mockBeaches } from '../mocks/data'

const REFETCH_MS = 5 * 60 * 1000

export function useBeaches() {
  return useQuery({
    queryKey: ['beaches'],
    queryFn: async (): Promise<Beach[]> => {
      if (!isSupabaseConfigured || !supabase) return mockBeaches
      const { data, error } = await supabase.from('beaches_ui').select('*').order('display_order')
      if (error) throw error
      return data as Beach[]
    },
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  })
}
