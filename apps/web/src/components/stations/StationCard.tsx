'use client'

import { StationWithDetails } from '@/types/shared'

interface StationCardProps {
  station: StationWithDetails
  onClick?: () => void
}

export function StationCard({ station, onClick }: StationCardProps) {
  const priceInfo = station.pricing[0]
  const hasDCFast = station.connectors.some((c) => c.is_dc_fast)

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border-2 border-gray-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 cursor-pointer mx-3 my-2 p-4 rounded-xl group transition-all"
    >
      {/* Compact Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold mb-0.5 group-hover:text-gradient transition-all truncate">
            {station.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {station.distance_km !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {station.distance_km.toFixed(1)}km
              </span>
            )}
            {station.avg_rating && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  ⭐ {station.avg_rating.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Compact Compatibility Badge */}
        {station.compatibility_status && (
          <div
            className={`px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ml-2 ${
              station.compatibility_status === 'compatible'
                ? 'bg-green-500/20 text-green-400'
                : station.compatibility_status === 'partial'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {station.compatibility_status === 'compatible' ? '✓' : station.compatibility_status === 'partial' ? '◐' : '✗'}
          </div>
        )}
      </div>

      {/* Compact Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {hasDCFast && (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-400">
            ⚡ DC Fast
          </span>
        )}
        {station.is_24x7 && (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-400">
            24/7
          </span>
        )}
        {station.network && (
          <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 truncate max-w-[120px]">
            {station.network}
          </span>
        )}
      </div>

      {/* Compact Pricing */}
      {priceInfo && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <div className="text-xs text-gray-500">
              {priceInfo.pricing_model === 'per_kwh' ? 'Per kWh' : 'Per min'}
            </div>
            <div className="text-lg font-bold">₹{priceInfo.price_value.toFixed(2)}</div>
          </div>
          {station.estimated_cost !== undefined && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Est. charge</div>
              <div className="text-base font-bold text-gradient">
                ₹{Math.round(station.estimated_cost)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


