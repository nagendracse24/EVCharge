'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface CheckInButtonProps {
  stationId: string
  stationName: string
  onCheckIn?: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function CheckInButton({ stationId, stationName, onCheckIn }: CheckInButtonProps) {
  const { user } = useAuth()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckIn = async () => {
    if (!user) {
      setError('Please sign in to check in')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession())
      
      if (!session) {
        setError('Please sign in first')
        return
      }

      const response = await fetch(`${API_URL}/api/realtime/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          station_id: stationId,
          status: 'arrived',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check in')
      }

      setIsCheckedIn(true)
      onCheckIn?.()
      
      // Show success message
      setTimeout(() => {
        setError('')
      }, 3000)
    } catch (err: any) {
      console.error('Check-in error:', err)
      setError(err.message || 'Failed to check in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user) return

    setLoading(true)
    try {
      // TODO: Implement check-out API call
      setIsCheckedIn(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-2">
      {!isCheckedIn ? (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 
            hover:from-green-600 hover:to-emerald-600 text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-lg shadow-green-500/30
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Check In at {stationName}
            </>
          )}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-center">
            ✓ Checked in at {stationName}
          </div>
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 
              text-red-400 font-medium transition-all"
          >
            Check Out
          </button>
        </div>
      )}

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}


