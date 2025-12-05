'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Zap, CreditCard, Info, CheckCircle2 } from 'lucide-react'

interface SlotBookingProps {
  stationId: string
  stationName: string
  connectors: Array<{
    id: string
    connector_type: string
    power_kw: number
    is_dc_fast: boolean
  }>
  onClose: () => void
}

interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
}

export default function SlotBooking({ stationId, stationName, connectors, onClose }: SlotBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedConnector, setSelectedConnector] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState<number>(0)

  // Initialize with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    if (connectors.length > 0) {
      setSelectedConnector(connectors[0].id)
    }
  }, [connectors])

  // Fetch available slots when date or connector changes
  useEffect(() => {
    if (selectedDate && selectedConnector) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedConnector, duration])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${API_URL}/api/bookings/slots/available?station_id=${stationId}&connector_id=${selectedConnector}&date=${selectedDate}&duration_minutes=${duration}`
      )
      const result = await response.json()
      setAvailableSlots(result.data || [])
    } catch (error) {
      console.error('Failed to fetch slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedSlot) return

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token here when available
        },
        body: JSON.stringify({
          station_id: stationId,
          connector_id: selectedConnector,
          booking_date: selectedDate,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          duration_minutes: duration,
          estimated_cost: estimatedCost,
        }),
      })

      if (response.ok) {
        setBookingSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate estimated cost
  useEffect(() => {
    if (selectedConnector) {
      const connector = connectors.find((c) => c.id === selectedConnector)
      if (connector) {
        const pricePerKwh = connector.is_dc_fast ? 18 : 12
        const estimatedKwh = (connector.power_kw * duration) / 60
        setEstimatedCost(estimatedKwh * pricePerKwh)
      }
    }
  }, [selectedConnector, duration, connectors])

  // Generate next 7 days for date picker
  const getNext7Days = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      })
    }
    return days
  }

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90">
        <div className="bg-gray-900 rounded-2xl p-8 border-2 border-green-500 text-center max-w-md mx-4 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-gray-300">
            Your slot at {stationName} has been reserved.
          </p>
          <p className="text-sm text-gray-400 mt-2">You'll receive a confirmation email shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Book Charging Slot</h2>
              <p className="text-sm text-gray-400 mt-1">{stationName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Calendar className="w-4 h-4" />
              Select Date
            </label>
            <div className="grid grid-cols-7 gap-2">
              {getNext7Days().map((day) => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDate(day.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedDate === day.value
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connector Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Zap className="w-4 h-4" />
              Select Connector
            </label>
            <div className="grid grid-cols-2 gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => setSelectedConnector(connector.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedConnector === connector.id
                      ? 'bg-indigo-500/20 border border-indigo-500 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{connector.connector_type}</div>
                  <div className="text-xs mt-1">
                    {connector.power_kw} kW • {connector.is_dc_fast ? 'DC Fast' : 'AC'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Clock className="w-4 h-4" />
              Charging Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    duration === mins
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">Available Time Slots</label>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading slots...</div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => slot.is_available && setSelectedSlot(slot)}
                    disabled={!slot.is_available}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      selectedSlot?.start_time === slot.start_time
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : slot.is_available
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                        : 'bg-white/5 text-gray-600 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.start_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cost Estimate */}
          {selectedSlot && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Estimated Cost</span>
                <span className="text-2xl font-bold text-white">₹{estimatedCost.toFixed(0)}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Actual cost may vary based on actual energy consumed. Payment due after charging session.
                </span>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          {selectedSlot && (
            <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="text-white font-medium">{new Date(selectedDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="text-white font-medium">
                  {selectedSlot.start_time.slice(0, 5)} - {selectedSlot.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white font-medium">{duration} minutes</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-indigo-500/30"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



