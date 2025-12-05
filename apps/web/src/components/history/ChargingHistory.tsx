'use client'

import { useState } from 'react'

interface ChargingSession {
  id: string
  station_name: string
  date: string
  energy_kwh: number
  cost: number
  duration_min: number
  from_percent: number
  to_percent: number
}

export function ChargingHistory() {
  // Mock data - would come from database in production
  const [sessions] = useState<ChargingSession[]>([
    {
      id: '1',
      station_name: 'Tata Power - UB City Mall',
      date: '2025-12-01',
      energy_kwh: 35.5,
      cost: 586,
      duration_min: 42,
      from_percent: 20,
      to_percent: 80,
    },
    {
      id: '2',
      station_name: 'Statiq - Orion Mall',
      date: '2025-11-28',
      energy_kwh: 28.2,
      cost: 508,
      duration_min: 38,
      from_percent: 25,
      to_percent: 75,
    },
    {
      id: '3',
      station_name: 'ChargeZone - Phoenix Marketcity',
      date: '2025-11-25',
      energy_kwh: 42.0,
      cost: 714,
      duration_min: 55,
      from_percent: 15,
      to_percent: 85,
    },
  ])

  const totalEnergy = sessions.reduce((sum, s) => sum + s.energy_kwh, 0)
  const totalCost = sessions.reduce((sum, s) => sum + s.cost, 0)
  const totalSessions = sessions.length
  const avgCostPerKwh = totalCost / totalEnergy

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-ultra p-5">
          <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-indigo-400">{totalSessions}</div>
        </div>
        
        <div className="card-ultra p-5">
          <div className="text-sm text-gray-400 mb-1">Total Energy</div>
          <div className="text-3xl font-bold text-green-400">{totalEnergy.toFixed(1)} kWh</div>
        </div>
        
        <div className="card-ultra p-5">
          <div className="text-sm text-gray-400 mb-1">Total Cost</div>
          <div className="text-3xl font-bold text-purple-400">₹{totalCost}</div>
        </div>
        
        <div className="card-ultra p-5">
          <div className="text-sm text-gray-400 mb-1">Avg Cost/kWh</div>
          <div className="text-3xl font-bold text-yellow-400">₹{avgCostPerKwh.toFixed(2)}</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card-ultra p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Charging Sessions
        </h3>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg mb-1">{session.station_name}</h4>
                  <div className="text-sm text-gray-400">
                    {new Date(session.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">₹{session.cost}</div>
                  <div className="text-xs text-gray-400">{session.duration_min} min</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Energy</div>
                  <div className="font-semibold">{session.energy_kwh} kWh</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Battery</div>
                  <div className="font-semibold">
                    {session.from_percent}% → {session.to_percent}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Rate</div>
                  <div className="font-semibold">
                    ₹{(session.cost / session.energy_kwh).toFixed(2)}/kWh
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-green-500"
                    style={{ width: `${session.to_percent - session.from_percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            No charging sessions yet
            <div className="text-sm mt-2">Your charging history will appear here</div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card-ultra p-6">
        <h3 className="text-xl font-bold mb-4">💡 Charging Insights</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
            <span className="text-green-400">✓</span>
            <div>
              <span className="font-semibold">Most Used: </span>
              <span className="text-gray-300">Tata Power stations (60% of sessions)</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
            <span className="text-blue-400">💡</span>
            <div>
              <span className="font-semibold">Best Value: </span>
              <span className="text-gray-300">Ather Grid at ₹12/kWh (save ₹4.50/kWh)</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10">
            <span className="text-purple-400">⚡</span>
            <div>
              <span className="font-semibold">Fastest: </span>
              <span className="text-gray-300">ChargeZone averages 38 min per session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





