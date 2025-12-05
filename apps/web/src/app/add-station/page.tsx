'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AddStationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    network: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    is_24x7: false,
    parking_type: '',
    connectorType: 'CCS2',
    powerKw: '50',
    isDcFast: true,
    connectorCount: '2',
    vehicleType: 'BOTH',
    pricingModel: 'per_kwh',
    priceValue: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${API_URL}/api/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          network: formData.network || undefined,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode || undefined,
          is_24x7: formData.is_24x7,
          parking_type: formData.parking_type || undefined,
          connectors: [
            {
              connector_type: formData.connectorType,
              power_kw: parseFloat(formData.powerKw),
              is_dc_fast: formData.isDcFast,
              count: parseInt(formData.connectorCount),
              vehicle_type_supported: formData.vehicleType,
            },
          ],
          pricing: formData.priceValue
            ? [
                {
                  pricing_model: formData.pricingModel,
                  price_value: parseFloat(formData.priceValue),
                },
              ]
            : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to add station')
      }

      setSuccessMessage('Station added successfully! Thank you for contributing.')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add station')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8" data-theme="dark">
      {/* Optimized Particles - Only 8 */}
      <div className="particles-container">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`particle particle-${(i % 3) + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 50}%`,
              animationDelay: `${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map
          </button>

          <h1 className="text-4xl font-bold text-gradient mb-3">Add Charging Station</h1>
          <p className="text-gray-400">
            Help the community by adding a new charging station. Your contribution will be reviewed before going live.
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="glass-ultra border border-green-500/50 rounded-2xl p-4 mb-6 text-green-400">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="glass-ultra border border-red-500/50 rounded-2xl p-4 mb-6 text-red-400">
            ✗ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-ultra space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Basic Information</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Station Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="e.g., MG Road EV Hub"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Network (Optional)</label>
                <input
                  type="text"
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="e.g., Tata Power, Statiq, ChargeZone"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-bold text-lg mb-4">Location</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="12.9716"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="77.5946"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="Full address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="Karnataka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="560001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connector Details */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connector Details</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Connector Type *</label>
                  <select
                    value={formData.connectorType}
                    onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2 AC</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="GB/T">GB/T</option>
                    <option value="Bharat DC001">Bharat DC001</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Power (kW) *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.powerKw}
                    onChange={(e) => setFormData({ ...formData, powerKw: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Connectors *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.connectorCount}
                    onChange={(e) => setFormData({ ...formData, connectorCount: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="BOTH">2W & 4W</option>
                    <option value="2W">2-Wheeler Only</option>
                    <option value="4W">4-Wheeler Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDcFast"
                  checked={formData.isDcFast}
                  onChange={(e) => setFormData({ ...formData, isDcFast: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10"
                />
                <label htmlFor="isDcFast" className="text-sm">DC Fast Charging</label>
              </div>
            </div>
          </div>

          {/* Pricing (Optional) */}
          <div>
            <h3 className="font-bold text-lg mb-4">Pricing (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pricing Model</label>
                <select
                  value={formData.pricingModel}
                  onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="per_kwh">Per kWh</option>
                  <option value="per_minute">Per Minute</option>
                  <option value="flat_session">Flat Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.priceValue}
                  onChange={(e) => setFormData({ ...formData, priceValue: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="15.00"
                />
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div>
            <h3 className="font-bold text-lg mb-4">Other Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is247"
                  checked={formData.is_24x7}
                  onChange={(e) => setFormData({ ...formData, is_24x7: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10"
                />
                <label htmlFor="is247" className="text-sm">Open 24/7</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Parking Type</label>
                <input
                  type="text"
                  value={formData.parking_type}
                  onChange={(e) => setFormData({ ...formData, parking_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="e.g., Mall, Fuel Station, Highway, Office"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-ultra w-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Add Station'}
          </button>
        </form>
      </div>
    </div>
  )
}


