'use client'

import { useAuth } from '@/context/AuthContext'
import { useVehicles } from '@/hooks/useVehicles'
import { useAppStore } from '@/store/appStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const { data: vehicles } = useVehicles()
  const { selectedVehicle, setSelectedVehicle } = useAppStore()
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="card-ultra p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-2xl font-bold text-indigo-400">0</div>
              <div className="text-sm text-gray-400 mt-1">Favorite Stations</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-400 mt-1">Reviews Written</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-sm text-gray-400 mt-1">Stations Added</div>
            </div>
          </div>
        </div>

        {/* My Vehicle */}
        <div className="card-ultra p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">My Vehicle</h2>
          {selectedVehicle ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{selectedVehicle.brand} {selectedVehicle.model}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {selectedVehicle.battery_capacity_kwh}kWh • {selectedVehicle.vehicle_type}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Connectors: {selectedVehicle.ac_connector_type}
                  {selectedVehicle.dc_connector_type && `, ${selectedVehicle.dc_connector_type}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-4xl mb-3">🚗</div>
              <div className="text-gray-400 mb-4">No vehicle selected</div>
              <a
                href="/"
                className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold transition-all"
              >
                Select Vehicle
              </a>
            </div>
          )}
        </div>

        {/* Available Vehicles */}
        <div className="card-ultra p-6">
          <h2 className="text-xl font-bold mb-4">Change Vehicle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {vehicles?.data.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`text-left p-4 rounded-xl transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? 'bg-indigo-500/20 border-2 border-indigo-500'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold">{vehicle.brand} {vehicle.model}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {vehicle.battery_capacity_kwh}kWh • {vehicle.vehicle_type}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-ultra p-6 mt-6 border-red-500/20">
          <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to sign out?')) {
                await signOut()
                router.push('/')
              }
            }}
            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-semibold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}






