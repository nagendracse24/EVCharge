import { RewardsPanel } from '@/components/rewards/RewardsPanel'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Trophy } from 'lucide-react'

export default function RewardsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent py-10 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-gradient">Rewards & Leaderboard</h1>
            </div>
            <p className="text-gray-400">Earn points, level up, and compete with other EV drivers</p>
          </div>

          {/* Content */}
          <RewardsPanel />
        </div>
      </div>
    </AuthGuard>
  )
}

