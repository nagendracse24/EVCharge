import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

export function useChargingHistory() {
  return useQuery({
    queryKey: ['charging-history'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/analytics/history`, {
        headers: { Authorization: authHeader },
      })
      if (!response.ok) throw new Error('Failed to fetch history')
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useChargingStats() {
  return useQuery({
    queryKey: ['charging-stats'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/analytics/stats`, {
        headers: { Authorization: authHeader },
      })
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCarbonCalculator() {
  return {
    calculate: async (params: { energy_kwh?: number; distance_km?: number }) => {
      const response = await fetch(`${API_URL}/api/analytics/carbon-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Failed to calculate')
      return response.json()
    }
  }
}




