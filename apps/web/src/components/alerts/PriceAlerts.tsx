'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface PriceAlert {
  id: string
  station_name: string
  current_price: number
  target_price: number
  is_active: boolean
}

export function PriceAlerts() {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [stationName, setStationName] = useState('')
  const [targetPrice, setTargetPrice] = useState('')

  // Mock alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      station_name: 'Tata Power - UB City',
      current_price: 16.50,
      target_price: 15.00,
      is_active: true,
    },
    {
      id: '2',
      station_name: 'Statiq - Orion Mall',
      current_price: 18.00,
      target_price: 16.00,
      is_active: true,
    },
  ])

  const addAlert = () => {
    if (!stationName || !targetPrice) return

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      station_name: stationName,
      current_price: 17.00,
      target_price: parseFloat(targetPrice),
      is_active: true,
    }

    setAlerts([...alerts, newAlert])
    setStationName('')
    setTargetPrice('')
    setShowCreateForm(false)
  }

  if (!user) {
    return (
      <div className="card-ultra p-8 text-center">
        <div className="text-4xl mb-3">🔔</div>
        <h3 className="text-xl font-bold mb-2">Price Alerts</h3>
        <p className="text-gray-400 mb-4">Sign in to set price alerts for your favorite stations</p>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card-ultra p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Price Alerts
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-sm transition-all"
          >
            + New Alert
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-semibold mb-3">Create Price Alert</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Station name..."
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm"
              />
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Target price (₹/kWh)..."
                step="0.50"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={addAlert}
                  className="flex-1 h-10 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold text-sm transition-all"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map((alert) => {
            const priceDrop = alert.current_price - alert.target_price
            const isTriggered = alert.current_price <= alert.target_price

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isTriggered
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{alert.station_name}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current: </span>
                        <span className="font-semibold">₹{alert.current_price.toFixed(2)}/kWh</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Target: </span>
                        <span className="font-semibold text-green-400">₹{alert.target_price.toFixed(2)}/kWh</span>
                      </div>
                    </div>
                    
                    {isTriggered && (
                      <div className="mt-2 flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Price alert triggered! Save ₹{priceDrop.toFixed(2)}/kWh
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {alerts.length === 0 && !showCreateForm && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            No active price alerts
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="card-ultra p-6">
        <h4 className="font-bold mb-3">How Price Alerts Work</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400">1.</span>
            <span>Set your target price for any station</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400">2.</span>
            <span>We monitor prices daily (via network APIs + user reports)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400">3.</span>
            <span>Get notified when price drops to or below your target</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400">4.</span>
            <span>Save money by charging at the right time!</span>
          </div>
        </div>
      </div>
    </div>
  )
}









