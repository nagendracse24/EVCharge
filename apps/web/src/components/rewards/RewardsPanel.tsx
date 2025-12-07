'use client'

import { useRewardsProfile, useRewardsTransactions, useLeaderboard } from '@/hooks/useRewards'
import { Trophy, Star, Gift, TrendingUp, Medal, Zap } from 'lucide-react'
import { format } from 'date-fns'

export function RewardsPanel() {
  const { data: profileData, isLoading: profileLoading } = useRewardsProfile()
  const { data: transactionsData } = useRewardsTransactions()
  const { data: leaderboardData } = useLeaderboard()

  const profile = (profileData as any)?.data
  const transactions = (transactionsData as any)?.data || []
  const leaderboard = (leaderboardData as any)?.data || []

  if (profileLoading) {
    return <div className="glass-ultra rounded-xl p-6 h-96 animate-pulse bg-gray-800"></div>
  }

  const progressPercent = profile 
    ? ((profile.total_points % 100) / 100) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* User Level Card */}
      <div className="glass-ultra rounded-xl p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-400">Your Level</div>
                <div className="text-4xl font-bold text-yellow-400">
                  Level {profile?.current_level || 1}
                </div>
              </div>
            </div>
            <div className="text-gray-300 font-semibold">
              {profile?.total_points || 0} Points
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Referral Code</div>
            <div className="px-3 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30 font-mono text-yellow-300 font-bold">
              {profile?.referral_code || 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress to Level {(profile?.current_level || 1) + 1}</span>
            <span>{profile?.points_to_next_level || 100} points to go</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{profile?.total_sessions || 0}</div>
            <div className="text-xs text-gray-400">Sessions</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Star className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{profile?.current_streak_days || 0}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Gift className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{profile?.referrals_count || 0}</div>
            <div className="text-xs text-gray-400">Referrals</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-ultra rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Medal className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Top Chargers</h3>
        </div>

        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry: any, index: number) => (
            <div 
              key={entry.rank} 
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30' 
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="font-semibold text-white">{entry.username}</div>
                  <div className="text-xs text-gray-400">
                    {entry.total_sessions} sessions • {entry.total_carbon_saved_kg?.toFixed(0)} kg CO₂
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-400">{entry.total_points}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="glass-ultra rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Points</h3>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-300">{tx.description}</div>
                <div className={`font-bold ${tx.points_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.points_change > 0 ? '+' : ''}{tx.points_change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

