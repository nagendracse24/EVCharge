'use client'

import { useState } from 'react'
import { useStations } from '@/hooks/useStations'
import { useUserLocation } from '@/hooks/useUserLocation'
import { StationWithDetails } from '@evcharge/shared'

export function StationComparison() {
  const { location } = useUserLocation()
  const { data: stations } = useStations({
    lat: location?.latitude || 12.9716,
    lng: location?.longitude || 77.5946,
    radius_km: 10,
  })

  const [selectedStations, setSelectedStations] = useState<string[]>([])

  const toggleStation = (stationId: string) => {
    if (selectedStations.includes(stationId)) {
      setSelectedStations(selectedStations.filter(id => id !== stationId))
    } else if (selectedStations.length < 3) {
      setSelectedStations([...selectedStations, stationId])
    }
  }

  const comparisonStations = stations?.data.filter(s => 
    selectedStations.includes(s.id)
  ) || []

  return (
    <div className="space-y-6">
      <div className="card-ultra p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Compare Stations (Select up to 3)
        </h2>

        {/* Station Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {stations?.data.slice(0, 9).map((station) => (
            <button
              key={station.id}
              onClick={() => toggleStation(station.id)}
              disabled={!selectedStations.includes(station.id) && selectedStations.length >= 3}
              className={`text-left p-4 rounded-xl transition-all ${
                selectedStations.includes(station.id)
                  ? 'bg-indigo-500/20 border-2 border-indigo-500'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-semibold truncate">{station.name}</div>
              <div className="text-sm text-gray-400 mt-1">{station.network}</div>
            </button>
          ))}
        </div>

        {selectedStations.length < 2 && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Select at least 2 stations to compare
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {comparisonStations.length >= 2 && (
        <div className="card-ultra p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 font-semibold">Feature</th>
                {comparisonStations.map((station) => (
                  <th key={station.id} className="text-left p-3 font-semibold">
                    <div className="truncate max-w-[200px]">{station.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Network</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">{station.network}</td>
                ))}
              </tr>
              
              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Distance</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.distance_km ? `${station.distance_km.toFixed(1)} km` : 'N/A'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Price (DC Fast)</td>
                {comparisonStations.map((station) => {
                  const dcPrice = station.pricing.find(p => p.connector_type === 'CCS2')
                  return (
                    <td key={station.id} className="p-3 font-bold text-green-400">
                      {dcPrice ? `₹${dcPrice.price_value}/kWh` : 'N/A'}
                    </td>
                  )
                })}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">DC Fast Charging</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.connectors.some(c => c.is_dc_fast) ? '✅ Yes' : '❌ No'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Max Power</td>
                {comparisonStations.map((station) => {
                  const maxPower = Math.max(...station.connectors.map(c => c.power_kw))
                  return (
                    <td key={station.id} className="p-3 font-bold">
                      {maxPower} kW
                    </td>
                  )
                })}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">24/7 Open</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.is_24x7 ? '✅ Yes' : '❌ No'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Food Available</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.amenities?.has_food ? '✅ Yes' : '❌ No'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">Washroom</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.amenities?.has_washroom ? '✅ Yes' : '❌ No'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="p-3 text-gray-400">WiFi</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.amenities?.has_wifi ? '✅ Yes' : '❌ No'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-gray-400">Rating</td>
                {comparisonStations.map((station) => (
                  <td key={station.id} className="p-3">
                    {station.avg_rating ? (
                      <span className="flex items-center gap-1">
                        ⭐ {station.avg_rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-500">No ratings</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Best Choice Indicator */}
          <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-green-400">Best Overall Choice</span>
            </div>
            <div className="text-sm text-gray-300">
              Based on price, distance, amenities, and ratings:
              <span className="font-bold text-white ml-2">
                {comparisonStations[0]?.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



