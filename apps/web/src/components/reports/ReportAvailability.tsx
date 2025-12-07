'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface ReportAvailabilityProps {
  stationId: string
  stationName: string
  totalConnectors: number
  onClose: () => void
  onSuccess: () => void
}

export function ReportAvailability({ stationId, stationName, totalConnectors, onClose, onSuccess }: ReportAvailabilityProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<'available' | 'busy' | 'offline' | 'partially_available'>('available')
  const [availableCount, setAvailableCount] = useState(totalConnectors)
  const [waitTime, setWaitTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please sign in to report availability')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          user_id: user.id,
          status,
          available_count: parseInt(availableCount.toString()),
          total_count: totalConnectors,
          wait_time_minutes: waitTime ? parseInt(waitTime) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit report')

      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250]" onClick={onClose} />
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md animate-in shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Report Availability</h2>
              <p className="text-sm text-gray-400 mt-1">{stationName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Current Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('available')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      status === 'available'
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">✅</div>
                    <div className="font-medium">Available</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('busy')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      status === 'busy'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">⏳</div>
                    <div className="font-medium">Busy</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('partially_available')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      status === 'partially_available'
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">⚠️</div>
                    <div className="font-medium">Partial</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('offline')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      status === 'offline'
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">❌</div>
                    <div className="font-medium">Offline</div>
                  </button>
                </div>
              </div>

              {/* Available Count */}
              {status !== 'offline' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Available Chargers ({availableCount} of {totalConnectors})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={totalConnectors}
                    value={availableCount}
                    onChange={(e) => setAvailableCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Wait Time */}
              {(status === 'busy' || status === 'partially_available') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Wait Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={waitTime}
                    onChange={(e) => setWaitTime(e.target.value)}
                    placeholder="e.g., 15"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white
                      focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              {/* Info */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                <p className="text-sm text-indigo-300">
                  💡 Real-time reports help others plan their charging stops!
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-xl border border-gray-700 text-gray-300
                  hover:bg-gray-800 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600
                  hover:from-indigo-600 hover:to-purple-700 text-white font-semibold
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}




