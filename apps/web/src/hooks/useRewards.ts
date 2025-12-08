import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

export function useRewardsProfile() {
  return useQuery({
    queryKey: ['rewards-profile'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/rewards/profile`, {
        headers: { Authorization: authHeader },
      })
      if (!response.ok) throw new Error('Failed to fetch rewards')
      return response.json()
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useRewardsTransactions() {
  return useQuery({
    queryKey: ['rewards-transactions'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/rewards/transactions`, {
        headers: { Authorization: authHeader },
      })
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/rewards/leaderboard?limit=10`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useRedeemPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { points: number; reward_type: string; description?: string }) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to redeem points')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-profile'] })
      queryClient.invalidateQueries({ queryKey: ['rewards-transactions'] })
    },
  })
}




