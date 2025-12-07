'use client'

import { useState } from 'react'
import { useVehicles } from '@/hooks/useVehicles'
import { StationPricing } from '@/types/shared'

interface ChargingCalculatorProps {
  stationPricing?: StationPricing[]
}

export function ChargingCalculator({ stationPricing }: ChargingCalculatorProps) {
  const { data: vehicles } = useVehicles()
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [fromPercent, setFromPercent] = useState(20)
  const [toPercent, setToPercent] = useState(80)

  const selectedVehicle = vehicles?.data.find(v => v.id === selectedVehicleId)
  
  let estimatedCost = 0
  let estimatedTime = 0
  let energyNeeded = 0

  if (selectedVehicle && stationPricing && stationPricing.length > 0) {
    const chargePercent = (toPercent - fromPercent) / 100
    energyNeeded = selectedVehicle.battery_capacity_kwh * chargePercent
    
    const pricing = stationPricing[0]
    if (pricing.pricing_model === 'per_kwh') {
      estimatedCost = energyNeeded * pricing.price_value
    } else if (pricing.pricing_model === 'per_minute') {
      // Estimate time first (assuming 50kW average)
      estimatedTime = (energyNeeded / 50) * 60
      estimatedCost = estimatedTime * pricing.price_value
    }

    // Calculate time if not already done
    if (estimatedTime === 0) {
      // Assume DC fast charging at 50kW average
      estimatedTime = (energyNeeded / 50) * 60
    }
  }

  return (
    <div className="card-ultra p-6">
      <h3 className="text-xl font-bold mb-4 text-white">⚡ Charging Cost Calculator</h3>

      {/* Vehicle Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-white">Select Vehicle</label>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-indigo-500 focus:outline-none transition-all"
        >
          <option value="" className="bg-gray-800 text-white">Choose your EV...</option>
          {vehicles?.data.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id} className="bg-gray-800 text-white">
              {vehicle.brand} {vehicle.model} ({vehicle.battery_capacity_kwh}kWh)
            </option>
          ))}
        </select>
      </div>

      {/* Battery Range Sliders */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">From: {fromPercent}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={fromPercent}
            onChange={(e) => setFromPercent(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-white">To: {toPercent}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={toPercent}
            onChange={(e) => setToPercent(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      {/* Results */}
      {selectedVehicle && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-sm text-gray-400 mb-1">Energy Required</div>
            <div className="text-2xl font-bold text-indigo-400">{energyNeeded.toFixed(2)} kWh</div>
          </div>

          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-sm text-gray-400 mb-1">Estimated Cost</div>
            <div className="text-3xl font-bold text-green-400">₹{estimatedCost.toFixed(2)}</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-sm text-gray-400 mb-1">Estimated Time</div>
            <div className="text-2xl font-bold text-purple-400">
              {estimatedTime < 60 
                ? `${Math.round(estimatedTime)} min`
                : `${Math.floor(estimatedTime / 60)}h ${Math.round(estimatedTime % 60)}m`
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">Assuming DC fast charging</div>
          </div>
        </div>
      )}

      {!selectedVehicle && (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select your vehicle to calculate charging cost
        </div>
      )}
    </div>
  )
}





