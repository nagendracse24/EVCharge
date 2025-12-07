'use client'

export function BusyHoursIndicator({ stationId }: { stationId?: string }) {
  // Mock data - would come from analytics in production
  const busyHours = [
    { hour: 0, label: '12 AM', busy: 10 },
    { hour: 1, label: '1 AM', busy: 5 },
    { hour: 2, label: '2 AM', busy: 3 },
    { hour: 3, label: '3 AM', busy: 2 },
    { hour: 4, label: '4 AM', busy: 5 },
    { hour: 5, label: '5 AM', busy: 15 },
    { hour: 6, label: '6 AM', busy: 35 },
    { hour: 7, label: '7 AM', busy: 55 },
    { hour: 8, label: '8 AM', busy: 75 },
    { hour: 9, label: '9 AM', busy: 85 },
    { hour: 10, label: '10 AM', busy: 70 },
    { hour: 11, label: '11 AM', busy: 60 },
    { hour: 12, label: '12 PM', busy: 65 },
    { hour: 13, label: '1 PM', busy: 70 },
    { hour: 14, label: '2 PM', busy: 55 },
    { hour: 15, label: '3 PM', busy: 45 },
    { hour: 16, label: '4 PM', busy: 50 },
    { hour: 17, label: '5 PM', busy: 65 },
    { hour: 18, label: '6 PM', busy: 80 },
    { hour: 19, label: '7 PM', busy: 90 },
    { hour: 20, label: '8 PM', busy: 70 },
    { hour: 21, label: '9 PM', busy: 50 },
    { hour: 22, label: '10 PM', busy: 35 },
    { hour: 23, label: '11 PM', busy: 20 },
  ]

  const currentHour = new Date().getHours()
  const currentBusyness = busyHours[currentHour].busy

  const getBusynessLevel = (busy: number) => {
    if (busy < 30) return { label: 'Usually not busy', color: 'text-green-400', bg: 'bg-green-500' }
    if (busy < 60) return { label: 'Usually a little busy', color: 'text-yellow-400', bg: 'bg-yellow-500' }
    return { label: 'Usually very busy', color: 'text-red-400', bg: 'bg-red-500' }
  }

  const current = getBusynessLevel(currentBusyness)

  return (
    <div className="card-ultra p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Popular Times
      </h3>

      {/* Current Status */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Right now ({busyHours[currentHour].label})</span>
          <span className={`font-bold ${current.color}`}>{current.label}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${current.bg}`}
            style={{ width: `${currentBusyness}%` }}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 mb-4">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {busyHours.map((item) => (
            <div
              key={item.hour}
              className="relative flex-1 group cursor-pointer"
            >
              <div
                className={`w-full rounded-t transition-all ${
                  item.hour === currentHour
                    ? 'bg-indigo-500'
                    : item.busy < 30
                    ? 'bg-green-500/40 hover:bg-green-500/60'
                    : item.busy < 60
                    ? 'bg-yellow-500/40 hover:bg-yellow-500/60'
                    : 'bg-red-500/40 hover:bg-red-500/60'
                }`}
                style={{ height: `${item.busy}%` }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="glass-ultra px-3 py-2 rounded-lg whitespace-nowrap text-sm border border-white/10">
                  <div className="font-bold">{item.label}</div>
                  <div className="text-gray-400">{item.busy}% busy</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>

      {/* Best Times */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
          <span className="text-green-400 font-bold">✓</span>
          <span className="text-gray-300">Best times: 2 AM - 6 AM, 2 PM - 4 PM</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
          <span className="text-red-400 font-bold">⚠</span>
          <span className="text-gray-300">Avoid: 8 AM - 10 AM, 7 PM - 8 PM</span>
        </div>
      </div>
    </div>
  )
}






