'use client'

interface QualityMetrics {
  reliability: number
  speed: number
  value: number
  experience: number
  overall: number
}

export function StationQualityScore({ stationId }: { stationId?: string }) {
  // Mock data - would calculate from actual user data
  const metrics: QualityMetrics = {
    reliability: 92,
    speed: 88,
    value: 75,
    experience: 85,
    overall: 85,
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Poor'
  }

  return (
    <div className="card-ultra p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Station Quality Score
      </h3>

      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(metrics.overall)}`}>
          {metrics.overall}
        </div>
        <div className="text-lg font-semibold text-gray-400">
          {getScoreLabel(metrics.overall)} Station
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Based on 156 user reports
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-4">
        {/* Reliability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reliability</span>
            <span className={`font-bold ${getScoreColor(metrics.reliability)}`}>
              {metrics.reliability}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${metrics.reliability}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Chargers working consistently
          </div>
        </div>

        {/* Speed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Charging Speed</span>
            <span className={`font-bold ${getScoreColor(metrics.speed)}`}>
              {metrics.speed}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{ width: `${metrics.speed}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Delivers advertised power
          </div>
        </div>

        {/* Value */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Value for Money</span>
            <span className={`font-bold ${getScoreColor(metrics.value)}`}>
              {metrics.value}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              style={{ width: `${metrics.value}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Competitive pricing
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">User Experience</span>
            <span className={`font-bold ${getScoreColor(metrics.experience)}`}>
              {metrics.experience}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${metrics.experience}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Amenities, cleanliness, safety
          </div>
        </div>
      </div>

      {/* Key Strengths */}
      <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <h4 className="font-bold text-green-400 mb-3">✨ Key Strengths</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Rarely out of service (95% uptime)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Fast charging speeds as advertised</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Clean facilities with good amenities</span>
          </li>
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <h4 className="font-bold text-yellow-400 mb-3">⚠️ Could Be Better</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-yellow-400">!</span>
            <span>Pricing slightly higher than nearby alternatives</span>
          </li>
        </ul>
      </div>
    </div>
  )
}









