'use client'

interface DarkPattern {
  type: 'overpriced' | 'hidden_fees' | 'misleading' | 'bait_switch'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
}

export function DarkPatternsDetector({ stationId }: { stationId: string }) {
  // Mock analysis - would use ML in production
  const patterns: DarkPattern[] = [
    {
      type: 'overpriced',
      severity: 'medium',
      title: '⚠️ Above Market Rate',
      description: 'This station charges ₹18/kWh, which is ₹3.50 above the area average (₹14.50/kWh).',
    },
  ]

  const trustScore = 75 // Out of 100

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500/10 border-red-500/20 text-red-400'
    if (severity === 'medium') return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  }

  return (
    <div className="card-ultra p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Trust & Transparency Score
      </h3>

      {/* Trust Score */}
      <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Overall Trust Score</span>
          <span className={`text-4xl font-bold ${
            trustScore >= 80 ? 'text-green-400' : trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {trustScore}
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              trustScore >= 80 ? 'bg-green-500' : trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {trustScore >= 80 
            ? 'Highly trustworthy - transparent pricing'
            : trustScore >= 60
            ? 'Generally trustworthy - some concerns'
            : 'Use caution - multiple issues reported'
          }
        </div>
      </div>

      {/* Detected Issues */}
      {patterns.length > 0 ? (
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-sm text-gray-400">Detected Issues</h4>
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${getSeverityColor(pattern.severity)}`}
            >
              <h5 className="font-bold mb-2">{pattern.title}</h5>
              <p className="text-sm opacity-90">{pattern.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No issues detected - this station looks trustworthy!
          </div>
        </div>
      )}

      {/* Price Comparison */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Price Context
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">This Station:</span>
            <span className="font-bold">₹18.00/kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Area Average:</span>
            <span className="font-bold text-yellow-400">₹14.50/kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network Average (Statiq):</span>
            <span className="font-bold text-green-400">₹15.00/kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cheapest Nearby:</span>
            <span className="font-bold text-green-400">₹12.00/kWh (Ather Grid)</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <h4 className="font-bold text-indigo-400 mb-2">💡 Our Recommendation</h4>
        <p className="text-sm text-gray-300">
          Consider <span className="font-bold text-white">Tata Power - Indiranagar</span> (2.3km away) 
          at <span className="font-bold text-green-400">₹14/kWh</span> to save 
          <span className="font-bold text-green-400"> ₹4/kWh</span>.
        </p>
      </div>
    </div>
  )
}



