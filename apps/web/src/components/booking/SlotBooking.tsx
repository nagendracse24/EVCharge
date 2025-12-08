'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Zap, CreditCard, CheckCircle2, AlertTriangle, X, Car, Info } from 'lucide-react'
import { StationConnector, Vehicle } from '@/types/shared'
import { useAppStore } from '@/store/appStore'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useVehicles } from '@/hooks/useVehicles'

interface SlotBookingProps {
  stationId: string
  stationName: string
  network?: string
  networks?: Array<{ network: string; connectors: StationConnector[] }> // For grouped stations
  connectors: StationConnector[]
  onClose: () => void
}

interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
}

export default function SlotBooking({ stationId, stationName, network, networks, connectors, onClose }: SlotBookingProps) {
  const { selectedVehicle, setSelectedVehicle } = useAppStore()
  const { data: vehiclesData } = useVehicles()
  const vehicles = vehiclesData?.data || []
  const { initiatePayment, loading: paymentLoading } = useRazorpay()
  
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedConnector, setSelectedConnector] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  
  // Get connectors to display (from selected network or all)
  const displayConnectors = selectedNetwork && networks
    ? networks.find(n => n.network === selectedNetwork)?.connectors || []
    : connectors

  // Filter ONLY compatible connectors
  const compatibleConnectors = selectedVehicle
    ? displayConnectors.filter(connector => {
        // Check exact match: Type 2 DC != Type 2 AC
        if (connector.is_dc_fast) {
          return connector.connector_type === selectedVehicle.dc_connector_type
        } else {
          return connector.connector_type === selectedVehicle.ac_connector_type
        }
      })
    : displayConnectors

  // Initialize with today's date and auto-select first compatible connector
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    
    if (compatibleConnectors.length > 0) {
      setSelectedConnector(compatibleConnectors[0].id)
    } else {
      setSelectedConnector('')
    }
  }, [compatibleConnectors.length])
  
  // Auto-select first network if grouped
  useEffect(() => {
    if (networks && networks.length > 0 && !selectedNetwork) {
      setSelectedNetwork(networks[0].network)
    }
  }, [networks])

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
      // Get auth token
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please sign in to book a slot')
        setLoading(false)
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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
        const result = await response.json()
        setBookingId(result.data.id)
        setShowPayment(true) // Show payment screen instead of success
      } else {
        const error = await response.json()
        alert(error.error || 'Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = () => {
    if (!bookingId || estimatedCost <= 0) return

    // Check if Razorpay is configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      // Show option to skip payment for testing
      if (confirm('⚠️ Razorpay not configured.\n\nSkip payment and mark booking as complete for testing?')) {
        setShowPayment(false)
        setBookingSuccess(true)
        return
      }
      return
    }

    initiatePayment({
      bookingId,
      amount: estimatedCost,
      onSuccess: (paymentId) => {
        console.log('Payment successful:', paymentId)
        setShowPayment(false)
        setBookingSuccess(true)
      },
      onFailure: (error) => {
        console.error('Payment failed:', error)
        alert(`Payment failed: ${error}`)
      },
    })
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

  // Show payment screen after booking created
  if (showPayment) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
        <div className="bg-gray-900 rounded-2xl p-8 border-2 border-indigo-500 text-center max-w-md mx-4 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Complete Payment</h3>
          
          {/* Booking Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4 text-left space-y-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Location</div>
              <div className="text-sm text-white font-semibold">{stationName}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400 mb-1">Network</div>
              <div className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-md text-xs inline-block">
                {selectedNetwork || network || 'Station'}
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Duration:</span>
                <span className="text-sm text-white font-semibold">{duration} minutes</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-400">Amount to Pay:</span>
                <span className="text-2xl text-green-400 font-bold">₹{estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mb-6">
            🔒 Secure payment powered by Razorpay<br />
            Supports UPI, Cards, Wallets & Net Banking
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowPayment(false)}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-700"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
        <div className="bg-gray-900 rounded-2xl p-8 border-2 border-green-500 text-center max-w-md mx-4 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Payment Successful! 🎉</h3>
          
          {/* Booking Details */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4 text-left">
            <div className="text-sm text-gray-400 mb-1">Location:</div>
            <div className="text-white font-semibold mb-3">{stationName}</div>
            
            <div className="text-sm text-gray-400 mb-1">Charging Network:</div>
            <div className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg inline-block">
              {selectedNetwork || network || 'Station'}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-green-400 font-bold">₹{estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            ✅ Booking confirmed! You'll receive a confirmation email shortly. Please arrive on time for your slot.
          </p>
          
          <div className="mt-6 flex gap-3">
            <a
              href="/payments"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              View Receipt
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Done
            </button>
          </div>
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
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white mb-2">Book Charging Slot</h2>
              <p className="text-sm text-gray-400 mb-2">{stationName}</p>
              
              {/* PROMINENT NETWORK BADGE */}
              {(selectedNetwork || network) && (
                <div className="flex items-center gap-2 bg-indigo-600/20 border-2 border-indigo-500 rounded-lg px-4 py-2 inline-flex">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wide">Charging Network</div>
                    <div className="text-lg font-bold text-white">{selectedNetwork || network || 'Station'}</div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Selector - NEW! */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Car className="w-4 h-4" />
              Your Vehicle
            </label>
            <select
              value={selectedVehicle?.id || ''}
              onChange={(e) => {
                const vehicle = vehicles.find(v => v.id === e.target.value)
                setSelectedVehicle(vehicle || null)
              }}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:outline-none transition-all text-white"
            >
              <option value="">Select your EV...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} {vehicle.variant ? `- ${vehicle.variant}` : ''}
                </option>
              ))}
            </select>
            {!selectedVehicle && (
              <p className="mt-2 text-xs text-yellow-400">
                💡 Select your vehicle to see only compatible connectors
              </p>
            )}
          </div>

          {/* Network Selector - For grouped stations */}
          {networks && networks.length > 1 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Zap className="w-4 h-4" />
                Charging Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                {networks.map((net) => (
                  <button
                    key={net.network}
                    onClick={() => setSelectedNetwork(net.network)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      selectedNetwork === net.network
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{net.network}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {net.connectors.length} connector{net.connectors.length > 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Show message if no compatible connectors */}
          {selectedVehicle && compatibleConnectors.length === 0 && (
            <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-red-400 mb-1">No Compatible Connectors</div>
                <div className="text-xs text-red-300">
                  This station doesn't have connectors compatible with your {selectedVehicle.brand} {selectedVehicle.model}.
                  Your vehicle needs: {selectedVehicle.dc_connector_type} (DC) or {selectedVehicle.ac_connector_type} (AC).
                </div>
              </div>
            </div>
          )}
          
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

          {/* Connector Selection - ONLY SHOW COMPATIBLE */}
          {compatibleConnectors.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Zap className="w-4 h-4" />
                Select Connector
                {selectedVehicle && (
                  <span className="text-xs text-emerald-400 font-normal ml-2">
                    ✓ Compatible with your {selectedVehicle.brand} {selectedVehicle.model}
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {compatibleConnectors.map((connector) => {
                  const isSelected = selectedConnector === connector.id
                  const currentNetwork = selectedNetwork || network || 'Station'
                  
                  return (
                    <button
                      key={connector.id}
                      onClick={() => setSelectedConnector(connector.id)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-600 border-2 border-emerald-500 text-white shadow-lg'
                          : 'bg-gray-800 border border-emerald-500/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-0.5">Network: {currentNetwork}</div>
                      <div className="font-semibold">{connector.connector_type}</div>
                      <div className="text-xs mt-1 opacity-80">
                        {connector.power_kw} kW • {connector.is_dc_fast ? 'DC Fast' : 'AC'}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-white absolute top-2 right-2" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Clock className="w-4 h-4" />
              Charging Duration
            </label>
            
            {/* Preset Duration Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
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
            
            {/* Custom Duration Input */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Or enter custom:</span>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white
                  focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                  w-32 text-center"
                placeholder="Minutes"
              />
              <span className="text-sm text-gray-400">minutes</span>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">Duration: 15-480 minutes (8 hours max)</p>
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
              disabled={!selectedSlot || !selectedDate || !selectedConnector || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 
                hover:from-indigo-600 hover:to-purple-600 
                disabled:opacity-50 disabled:cursor-not-allowed 
                text-white font-semibold transition-all shadow-lg shadow-indigo-500/30
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Confirm Booking • ₹{estimatedCost.toFixed(0)}
                </>
              )}
            </button>
          </div>
          
          {/* Validation Messages */}
          {!selectedDate && (
            <p className="text-sm text-yellow-400 text-center">⚠️ Please select a date</p>
          )}
          {!selectedConnector && selectedDate && (
            <p className="text-sm text-yellow-400 text-center">⚠️ Please select a connector type</p>
          )}
          {!selectedSlot && selectedConnector && (
            <p className="text-sm text-yellow-400 text-center">⚠️ Please select a time slot</p>
          )}
        </div>
      </div>
    </div>
  )
}



