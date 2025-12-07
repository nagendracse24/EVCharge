'use client'

import { useChargingStats, useChargingHistory } from '@/hooks/useAnalytics'
import { Zap, DollarSign, Leaf, Clock, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export function ChargingDashboard() {
  const { data: statsData, isLoading: statsLoading } = useChargingStats()
  const { data: historyData, isLoading: historyLoading } = useChargingHistory()

  const stats = (statsData as any)?.data
  const history = (historyData as any)?.data || []

  if (statsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="glass-ultra p-6 rounded-xl hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Total Energy"
          value={`${(stats?.total_energy_kwh || 0).toFixed(1)} kWh`}
          subtext={`${stats?.total_sessions || 0} sessions`}
          color="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`₹${(stats?.total_cost || 0).toFixed(0)}`}
          subtext={`₹${(stats?.average_cost_per_session || 0).toFixed(0)}/session`}
          color="blue"
        />
        <StatCard
          icon={Leaf}
          label="Carbon Saved"
          value={`${(stats?.total_carbon_saved_kg || 0).toFixed(1)} kg`}
          subtext={`${((stats?.total_carbon_saved_kg || 0) / 21 * 365).toFixed(1)} trees/year`}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Total Time"
          value={`${Math.floor((stats?.total_duration_minutes || 0) / 60)}h ${(stats?.total_duration_minutes || 0) % 60}m`}
          subtext="charging time"
          color="purple"
        />
      </div>

      {/* Recent History */}
      <div className="glass-ultra rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Charging History</h2>
          </div>
          <div className="text-sm text-gray-400">Last 50 sessions</div>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Zap className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>No charging history yet</p>
            <p className="text-sm mt-1">Book your first slot to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session: any) => (
              <div key={session.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{session.station?.name}</div>
                    <div className="text-sm text-gray-400">{session.station?.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">₹{session.cost_paid?.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{session.energy_delivered_kwh?.toFixed(1)} kWh</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(session.start_time), 'dd MMM yyyy, hh:mm a')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.duration_minutes} mins
                  </span>
                  {session.carbon_saved_kg && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Leaf className="w-3 h-3" />
                      {session.carbon_saved_kg.toFixed(1)} kg CO₂
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

