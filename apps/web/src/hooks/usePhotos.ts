import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

export function useStationPhotos(stationId: string) {
  return useQuery({
    queryKey: ['station-photos', stationId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/photos/station/${stationId}?limit=10`)
      if (!response.ok) throw new Error('Failed to fetch photos')
      return response.json()
    },
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      stationId: string
      file: File
    }) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      // Upload to Supabase Storage
      const fileExt = data.file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `station-photos/${data.stationId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('station-photos')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('station-photos')
        .getPublicUrl(filePath)

      // Create photo record
      const response = await fetch(`${API_URL}/api/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          station_id: data.stationId,
          photo_url: publicUrl,
          storage_path: filePath,
          file_size_bytes: data.file.size,
          mime_type: data.file.type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to upload photo')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['station-photos', variables.stationId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (photoId: string) => {
      const authHeader = await getAuthHeader()
      if (!authHeader) throw new Error('Authentication required')

      const response = await fetch(`${API_URL}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      })

      if (!response.ok) throw new Error('Failed to delete photo')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['station-photos'] })
    },
  })
}

