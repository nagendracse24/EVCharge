'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useVehicles } from '@/hooks/useVehicles'
import { Vehicle } from '@/types/shared'

export function VehicleSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedVehicle, setSelectedVehicle } = useAppStore()
  const { data: vehiclesData, isLoading } = useVehicles()

  const vehicles = vehiclesData?.data || []

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 min-w-[200px] px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-all"
      >
        <div className="flex-1 text-left">
          {selectedVehicle ? (
            <>
              <div className="text-xs text-gray-400 font-medium">Vehicle</div>
              <div className="text-sm font-semibold truncate text-white">
                {selectedVehicle.brand} {selectedVehicle.model}
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold text-white">🚗 Select Vehicle</div>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - PROPERLY VISIBLE WITH DARK THEME */}
          <div className="absolute right-0 mt-2 w-[400px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden fade-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
              <h3 className="font-semibold text-white">Select Your Vehicle</h3>
              <p className="text-xs text-gray-400 mt-1">
                Get personalized compatibility & cost estimates
              </p>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto bg-gray-900">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No vehicles available
                </div>
              ) : (
                <div className="p-2">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleSelect(vehicle)}
                      className={`w-full text-left px-4 py-3 mb-2 rounded-lg transition-all border ${
                        selectedVehicle?.id === vehicle.id
                          ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          {vehicle.variant && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {vehicle.variant}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="font-mono text-gray-400">{vehicle.battery_capacity_kwh}kWh</span>
                            <span>•</span>
                            <span className="text-gray-400">{vehicle.dc_connector_type || vehicle.ac_connector_type}</span>
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700">
                          {vehicle.vehicle_type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedVehicle && (
              <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                <button
                  onClick={() => {
                    setSelectedVehicle(null)
                    setIsOpen(false)
                  }}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline font-medium"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


