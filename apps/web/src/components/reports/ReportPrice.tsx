'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface ReportPriceProps {
  stationId: string
  stationName: string
  connectorTypes: string[]
  onClose: () => void
  onSuccess: () => void
}

export function ReportPrice({ stationId, stationName, connectorTypes, onClose, onSuccess }: ReportPriceProps) {
  const { user } = useAuth()
  const [connectorType, setConnectorType] = useState(connectorTypes[0] || 'Type 2')
  const [pricePerKwh, setPricePerKwh] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please sign in to report prices')
      return
    }

    if (!pricePerKwh || parseFloat(pricePerKwh) <= 0) {
      setError('Please enter a valid price')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          user_id: user.id,
          connector_type: connectorType,
          price_per_kwh: parseFloat(pricePerKwh),
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
              <h2 className="text-xl font-bold text-white">Report Current Price</h2>
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
              {/* Connector Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connector Type
                </label>
                <select
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white
                    focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {connectorTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per kWh (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                  placeholder="e.g., 15.50"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white
                    focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Info */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                <p className="text-sm text-indigo-300">
                  💡 Your report helps other EV drivers! Accurate reports earn you reputation points.
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




