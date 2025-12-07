'use client'

import { useState } from 'react'
import { useStationPhotos, useUploadPhoto, useDeletePhoto } from '@/hooks/usePhotos'
import { useAuth } from '@/context/AuthContext'
import { Camera, X, Upload, Trash2, AlertCircle } from 'lucide-react'

interface PhotoGalleryProps {
  stationId: string
}

export function PhotoGallery({ stationId }: PhotoGalleryProps) {
  const { user } = useAuth()
  const { data, isLoading } = useStationPhotos(stationId)
  const uploadPhoto = useUploadPhoto()
  const deletePhoto = useDeletePhoto()
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const photos = (data as any)?.data || []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      await uploadPhoto.mutateAsync({ stationId, file })
      alert('Photo uploaded successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    
    try {
      await deletePhoto.mutateAsync(photoId)
    } catch (error: any) {
      alert(error.message || 'Failed to delete photo')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-32"></div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">Photos ({photos.length})</h3>
        </div>

        {user && (
          <label className="cursor-pointer px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Add Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700">
          <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No photos yet</p>
          {user && (
            <p className="text-gray-500 text-xs mt-1">Be the first to add a photo!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo: any) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedPhoto(photo.photo_url)}
            >
              <img
                src={photo.photo_url}
                alt="Station photo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Delete button for own photos */}
              {user && photo.user_id === user.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(photo.id)
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <img
            src={selectedPhoto}
            alt="Station photo"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

