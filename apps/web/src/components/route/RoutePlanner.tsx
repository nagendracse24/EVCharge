'use client'

import { useState } from 'react'
import { useVehicles } from '@/hooks/useVehicles'

interface RouteStop {
  id: string
  location: string
  battery_on_arrival: number
  charging_needed: boolean
  suggested_station?: {
    name: string
    cost: number
    time: number
  }
}

export function RoutePlanner() {
  const { data: vehicles } = useVehicles()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [startBattery, setStartBattery] = useState(80)
  const [route, setRoute] = useState<RouteStop[] | null>(null)
  const [calculating, setCalculating] = useState(false)

  const selectedVehicle = vehicles?.data.find(v => v.id === selectedVehicleId)

  const calculateRoute = async () => {
    setCalculating(true)
    
    // Simulate route calculation
    setTimeout(() => {
      // Mock route with charging stops
      const mockRoute: RouteStop[] = [
        {
          id: '1',
          location: origin,
          battery_on_arrival: startBattery,
          charging_needed: false,
        },
        {
          id: '2',
          location: 'Bangalore - Mysore Highway (150km)',
          battery_on_arrival: 45,
          charging_needed: true,
          suggested_station: {
            name: 'Tata Power - Nice Road',
            cost: 240,
            time: 35,
          },
        },
        {
          id: '3',
          location: destination,
          battery_on_arrival: 25,
          charging_needed: false,
        },
      ]
      
      setRoute(mockRoute)
      setCalculating(false)
    }, 1500)
  }

  return (
    <div className="card-ultra p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Route Planner with Charging Stops
      </h2>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Starting location..."
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination..."
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all"
          >
            <option value="">Select your EV...</option>
            {vehicles?.data.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} ({vehicle.battery_capacity_kwh}kWh)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Starting Battery: {startBattery}%
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={startBattery}
            onChange={(e) => setStartBattery(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={calculateRoute}
          disabled={!origin || !destination || !selectedVehicleId || calculating}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? 'Calculating Route...' : 'Plan Route with Charging Stops'}
        </button>
      </div>

      {/* Route Display */}
      {route && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommended charging stops for your journey
          </div>

          {route.map((stop, index) => (
            <div key={stop.id} className="relative">
              <div className={`p-4 rounded-xl border-2 ${
                stop.charging_needed 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      stop.charging_needed 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-indigo-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    {index < route.length - 1 && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 my-2" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{stop.location}</h3>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        stop.battery_on_arrival > 50 
                          ? 'bg-green-500/20 text-green-400'
                          : stop.battery_on_arrival > 30
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {stop.battery_on_arrival}% battery on arrival
                      </span>
                    </div>

                    {stop.charging_needed && stop.suggested_station && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-semibold">Recommended Charging Stop</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>📍 {stop.suggested_station.name}</div>
                          <div className="flex gap-4">
                            <span>💰 ₹{stop.suggested_station.cost}</span>
                            <span>⏱️ {stop.suggested_station.time} min</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h4 className="font-bold mb-2">Trip Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Total Charging Stops:</span>
                <div className="font-bold text-lg">1</div>
              </div>
              <div>
                <span className="text-gray-400">Total Charging Time:</span>
                <div className="font-bold text-lg">35 min</div>
              </div>
              <div>
                <span className="text-gray-400">Total Charging Cost:</span>
                <div className="font-bold text-lg text-green-400">₹240</div>
              </div>
              <div>
                <span className="text-gray-400">Arrival Battery:</span>
                <div className="font-bold text-lg">25%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



