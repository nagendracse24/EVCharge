'use client'

import { StationWithDetails } from '@/types/shared'
import { StationCard } from './StationCard'
import { GroupedStationCard } from './GroupedStationCard'

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

interface StationListProps {
  stations: (StationWithDetails | GroupedStation)[]
  isLoading?: boolean
  onStationClick?: (stationId: string) => void
}

export function StationList({ stations, isLoading, onStationClick }: StationListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-ultra shimmer h-40" />
        ))}
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No stations found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search</p>
        </div>
      </div>
    )
  }

  // Helper to check if station is grouped
  const isGroupedStation = (station: any): station is GroupedStation => {
    return 'networks' in station && Array.isArray(station.networks)
  }

  return (
    <div>
      {stations.map((station) => {
        if (isGroupedStation(station)) {
          return (
            <GroupedStationCard
              key={station.id}
              station={station}
              onStationClick={onStationClick || (() => {})}
            />
          )
        }
        
        return (
          <StationCard
            key={station.id}
            station={station as StationWithDetails}
            onClick={() => onStationClick?.(station.id)}
          />
        )
      })}
    </div>
  )
}


