'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-ultra" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen w-full">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      </div>

      {/* Header */}
      <div className="sticky top-0 glass-ultra border-b border-white/10 px-6 py-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">EVCharge India</span>
          </a>
          <button
            onClick={() => router.back()}
            className="h-10 px-4 rounded-xl glass-ultra hover:bg-white/5 transition-all"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">⭐ Favorite Stations</h1>
        <p className="text-gray-400 mb-8">Quick access to your saved charging stations</p>

        {/* Empty State */}
        <div className="card-ultra p-16 text-center">
          <div className="text-7xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-gray-400 mb-6">
            Start adding your favorite charging stations for quick access
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold transition-all"
          >
            Browse Stations
          </a>
        </div>
      </div>
    </div>
  )
}









