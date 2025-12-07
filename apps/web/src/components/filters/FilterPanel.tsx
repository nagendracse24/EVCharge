'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { ConnectorType } from '@/types/shared'

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useAppStore()

  const connectorTypes = [
    'CCS2',
    'Type 2 AC',
    'CHAdeMO',
    'Bharat AC001',
    'Bharat DC001',
    'GB/T DC',
  ]

  const networks = ['Tata Power', 'Statiq', 'ChargeZone', 'Ather Grid', 'JioBP']

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold gradient-text">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-xs text-gray-500 hover:text-purple-600 font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sort by
          </label>
          <select
            value={filters.sort_by || 'distance'}
            onChange={(e) => setFilters({ sort_by: e.target.value as any })}
            className="input-modern text-sm w-full"
          >
            <option value="distance">🎯 Nearest First</option>
            <option value="price">💰 Cheapest First</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="best">🏆 Best Overall</option>
          </select>
        </div>

        {/* Charger Speed - AETHER-INSPIRED CHIPS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⚡ Charger Speed
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ is_dc_fast: undefined })}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !filters.is_dc_fast
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Speeds
            </button>
            <button
              onClick={() => setFilters({ is_dc_fast: true })}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filters.is_dc_fast
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⚡ Fast Only (DC)
            </button>
          </div>
        </div>

        {/* Connector Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Connector Type
          </label>
          <select
            value={filters.connector_types?.[0] || ''}
            onChange={(e) =>
              setFilters({ connector_types: e.target.value ? [e.target.value as any] : undefined })
            }
            className="input-modern text-sm w-full"
          >
            <option value="">All Connectors</option>
            {connectorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Network */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Network
          </label>
          <select
            value={filters.networks?.[0] || ''}
            onChange={(e) => setFilters({ networks: e.target.value ? [e.target.value] : undefined })}
            className="input-modern text-sm w-full"
          >
            <option value="">All Networks</option>
            {networks.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}


