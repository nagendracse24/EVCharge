'use client'

import { useChargingStats } from '@/hooks/useAnalytics'
import { Leaf, TreePine, Car, Droplets } from 'lucide-react'

export function CarbonSavings() {
  const { data, isLoading } = useChargingStats()
  const stats = data?.data

  if (isLoading) {
    return <div className="glass-ultra rounded-xl p-6 h-64 animate-pulse bg-gray-800"></div>
  }

  const carbonSaved = stats?.total_carbon_saved_kg || 0
  const treesEquivalent = (carbonSaved / 21 * 365).toFixed(1)
  const petrolSaved = (stats?.total_energy_kwh || 0) / 0.15 / 15 // Assuming 15 km/l
  const moneySavedVsPetrol = petrolSaved * 100 // ₹100/liter

  return (
    <div className="glass-ultra rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-500/20">
          <Leaf className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Environmental Impact</h2>
          <p className="text-sm text-gray-400">Your contribution to a cleaner planet</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <Leaf className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-3xl font-bold text-green-400 mb-1">{carbonSaved.toFixed(1)} kg</div>
          <div className="text-sm text-gray-400">CO₂ Saved</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
          <TreePine className="w-8 h-8 text-emerald-400 mb-2" />
          <div className="text-3xl font-bold text-emerald-400 mb-1">{treesEquivalent}</div>
          <div className="text-sm text-gray-400">Trees/Year Equivalent</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Petrol Saved</span>
          </div>
          <span className="font-bold text-blue-400">{petrolSaved.toFixed(1)} L</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">Money Saved vs Petrol</span>
          </div>
          <span className="font-bold text-purple-400">₹{moneySavedVsPetrol.toFixed(0)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
        <p className="text-xs text-green-300">
          🌍 By choosing electric, you're helping reduce air pollution and combat climate change.
          Keep charging green!
        </p>
      </div>
    </div>
  )
}

