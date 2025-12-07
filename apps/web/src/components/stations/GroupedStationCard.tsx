'use client'

import { useState } from 'react'
import { MapPin, Zap, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react'

interface GroupedStation {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  city?: string
  is_24x7?: boolean
  distance_km?: number
  avg_rating?: number
  networks: Array<{
    network: string
    stationId: string
    connectors: any[]
    pricing: any[]
    station: any
  }>
  totalConnectors: number
}

interface GroupedStationCardProps {
  station: GroupedStation
  onStationClick: (stationId: string) => void
}

export function GroupedStationCard({ station, onStationClick }: GroupedStationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)

  const handleNetworkSelect = (networkData: any) => {
    setSelectedNetwork(networkData.network)
    onStationClick(networkData.stationId) // Open detail panel for selected network's station
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group relative overflow-visible">
      {/* Hover Tooltip - FIXED VERSION */}
      <div 
        className="absolute left-0 right-0 top-full mt-3 opacity-0 group-hover:opacity-100 pointer-events-none z-[100] transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="mx-4 bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-white/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-white" />
            <div className="text-sm text-white font-black uppercase tracking-wide">Networks Here</div>
          </div>
          <div className="space-y-2">
            {station.networks.map((net, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white/25 backdrop-blur-sm rounded-lg">
                <span className="text-base font-bold text-white">{net.network}</span>
                <span className="text-sm text-white font-semibold">{net.connectors.length} ports</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white mb-1 truncate">
              {station.name}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{station.address}</span>
            </div>

            {/* Networks Badge with Preview */}
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg group/network relative"
                title={`Networks: ${station.networks.map(n => n.network).join(', ')}`}
              >
                <Zap className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-300">
                  {station.networks.length} Network{station.networks.length > 1 ? 's' : ''}
                </span>
                
                {/* Hover Tooltip - Show Network Names */}
                <div className="absolute left-0 top-full mt-2 hidden group-hover/network:block z-50 w-max max-w-xs pointer-events-none">
                  <div className="bg-gray-900 border-2 border-indigo-500/50 rounded-lg p-3 shadow-2xl shadow-black/50">
                    <div className="text-xs text-white mb-2 font-bold">Available Networks:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {station.networks.map((net, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-600 text-white rounded-md text-xs font-semibold border border-indigo-500">
                          {net.network}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-xs font-medium text-green-300">
                  {station.totalConnectors} Connector{station.totalConnectors > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right side info */}
          <div className="flex flex-col items-end gap-2">
            {station.distance_km !== undefined && (
              <div className="text-xs font-medium text-indigo-400">
                {station.distance_km < 1 
                  ? `${Math.round(station.distance_km * 1000)}m` 
                  : `${station.distance_km.toFixed(1)}km`}
              </div>
            )}
            
            {station.avg_rating && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <span>{station.avg_rating.toFixed(1)}</span>
              </div>
            )}

            {station.is_24x7 && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <Clock className="w-3 h-3" />
                <span>24/7</span>
              </div>
            )}

            {/* Expand/Collapse Icon */}
            <button className="text-gray-400 hover:text-white transition-colors mt-1">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Network Selection */}
      {expanded && (
        <div className="border-t border-gray-700 bg-gray-900/70 p-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            Select Network:
          </p>
          
          <div className="space-y-2">
            {station.networks.map((networkData, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  handleNetworkSelect(networkData)
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedNetwork === networkData.network
                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    {networkData.network}
                  </span>
                  <span className="text-xs text-gray-400">
                    {networkData.connectors.length} connector{networkData.connectors.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Connector Types */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {networkData.connectors.map((conn: any, connIdx: number) => (
                    <span
                      key={connIdx}
                      className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded"
                    >
                      {conn.connector_type} ({conn.power_kw}kW)
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                {networkData.pricing.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    ₹{networkData.pricing[0].price_value}/
                    {networkData.pricing[0].pricing_model === 'per_kwh' ? 'kWh' : 'min'}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

