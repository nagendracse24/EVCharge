'use client'

import { useEffect, useState } from 'react'

interface LiveStatusBadgeProps {
  stationId: string
  compact?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type StationStatus = 'available' | 'occupied' | 'offline' | 'unknown'

export function LiveStatusBadge({ stationId, compact = false }: LiveStatusBadgeProps) {
  const [status, setStatus] = useState<StationStatus>('unknown')
  const [activeCheckins, setActiveCheckins] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [stationId])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/realtime/status/${stationId}`)
      const { data } = await response.json()

      if (data?.aggregation) {
        // Determine overall status
        const { available_count, occupied_count, offline_count, total_connectors, active_checkins } = data.aggregation
        
        setActiveCheckins(active_checkins || 0)

        if (offline_count > 0) {
          setStatus('offline')
        } else if (available_count > 0) {
          setStatus('available')
        } else if (occupied_count > 0) {
          setStatus('occupied')
        } else {
          setStatus('unknown')
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-gray-400">Loading...</span>
      </div>
    )
  }

  const statusConfig = {
    available: {
      color: 'bg-green-500',
      text: 'Available',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      icon: '●',
    },
    occupied: {
      color: 'bg-yellow-500',
      text: 'Busy',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      icon: '●',
    },
    offline: {
      color: 'bg-red-500',
      text: 'Offline',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      icon: '●',
    },
    unknown: {
      color: 'bg-gray-500',
      text: 'Unknown',
      textColor: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      icon: '●',
    },
  }

  const config = statusConfig[status]

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 ${config.color} rounded-full animate-pulse`} />
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <div className={`w-2.5 h-2.5 ${config.color} rounded-full animate-pulse`} />
      <span className={`text-sm font-semibold ${config.textColor}`}>
        {config.text}
      </span>
      {activeCheckins > 0 && (
        <span className={`text-xs ${config.textColor} opacity-75`}>
          • {activeCheckins} {activeCheckins === 1 ? 'person' : 'people'} here
        </span>
      )}
    </div>
  )
}


