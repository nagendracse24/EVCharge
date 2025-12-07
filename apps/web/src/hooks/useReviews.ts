import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

export function useStationReviews(stationId: string, sort: 'recent' | 'helpful' | 'rating' = 'recent') {
  return useQuery({
    queryKey: ['station-reviews', stationId, sort],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/reviews/station/${stationId}?sort=${sort}&limit=10`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      return response.json()
    },
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

export function useAddReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      station_id: string
      rating: number
      title?: string
      comment?: string
      cleanliness_rating?: number
      reliability_rating?: number
      value_rating?: number
    }) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to add review')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['station-reviews', variables.station_id] })
    },
  })
}

export function useVoteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      reviewId: string
      isHelpful: boolean
    }) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/reviews/${data.reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ is_helpful: data.isHelpful }),
      })

      if (!response.ok) throw new Error('Failed to vote')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['station-reviews'] })
    },
  })
}

