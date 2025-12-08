import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

// Get user's favorites
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) return { data: [] }

      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: authHeader },
      })
      if (!response.ok) throw new Error('Failed to fetch favorites')
      return response.json()
    },
  })
}

// Check if station is favorited
export function useIsFavorite(stationId: string | null) {
  return useQuery({
    queryKey: ['favorite-check', stationId],
    queryFn: async () => {
      if (!stationId) return { data: { is_favorite: false } }
      
      const authHeader = await getAuthHeader()
      if (!authHeader) return { data: { is_favorite: false } }

      const response = await fetch(`${API_URL}/api/favorites/check/${stationId}`, {
        headers: { Authorization: authHeader },
      })
      return response.json()
    },
    enabled: !!stationId,
  })
}

// Add to favorites
export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stationId: string) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ station_id: stationId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to add favorite')
      }

      return response.json()
    },
    onSuccess: (_, stationId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', stationId] })
    },
  })
}

// Remove from favorites
export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stationId: string) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/favorites/${stationId}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      })

      if (!response.ok) throw new Error('Failed to remove favorite')
      return response.json()
    },
    onSuccess: (_, stationId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', stationId] })
    },
  })
}







