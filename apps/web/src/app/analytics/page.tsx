import { ChargingDashboard } from '@/components/analytics/ChargingDashboard'
import { CarbonSavings } from '@/components/analytics/CarbonSavings'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent py-10 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-gradient">Your Analytics</h1>
            </div>
            <p className="text-gray-400">Track your charging sessions, costs, and environmental impact</p>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChargingDashboard />
            </div>
            <div>
              <CarbonSavings />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}




