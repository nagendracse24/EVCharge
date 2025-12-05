'use client'

export function BatteryHealthTips() {
  const tips = [
    {
      icon: '🔋',
      title: 'Optimal Charging Range',
      description: 'Keep battery between 20-80% for daily use. This maximizes battery lifespan.',
      impact: 'High Impact',
      color: 'green',
    },
    {
      icon: '⚡',
      title: 'Limit DC Fast Charging',
      description: 'Use DC fast charging sparingly. Regular use can degrade battery faster.',
      impact: 'Medium Impact',
      color: 'yellow',
    },
    {
      icon: '🌡️',
      title: 'Temperature Matters',
      description: 'Avoid charging in extreme heat (>35°C). Park in shade when possible.',
      impact: 'High Impact',
      color: 'green',
    },
    {
      icon: '🚗',
      title: 'Slow Charging Benefits',
      description: 'Use AC slow charging overnight. Gentler on battery than DC fast charging.',
      impact: 'Medium Impact',
      color: 'yellow',
    },
    {
      icon: '📉',
      title: 'Avoid Deep Discharge',
      description: 'Don\'t regularly drain below 10%. Plan charging stops in advance.',
      impact: 'High Impact',
      color: 'green',
    },
    {
      icon: '🔌',
      title: 'Unplug When Full',
      description: 'Don\'t leave car plugged in after reaching 100%. Prevent overcharging.',
      impact: 'Low Impact',
      color: 'blue',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500/10 border-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className="card-ultra p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
          💚
        </div>
        <div>
          <h2 className="text-2xl font-bold">Battery Health Tips</h2>
          <p className="text-sm text-gray-400">Maximize your EV battery lifespan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{tip.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{tip.description}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getColorClasses(tip.color)}`}>
                  {tip.impact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Battery Health Score */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Your Battery Health Score</span>
          <span className="text-3xl font-bold text-green-400">85/100</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }} />
        </div>
        <p className="text-sm text-gray-400">
          Good! You're following 5 out of 6 recommended practices. 
          Try to limit DC fast charging to improve further.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-indigo-400">45%</div>
          <div className="text-xs text-gray-400 mt-1">DC Fast Usage</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-green-400">82%</div>
          <div className="text-xs text-gray-400 mt-1">Optimal Range</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-purple-400">12</div>
          <div className="text-xs text-gray-400 mt-1">Sessions/Month</div>
        </div>
      </div>
    </div>
  )
}





