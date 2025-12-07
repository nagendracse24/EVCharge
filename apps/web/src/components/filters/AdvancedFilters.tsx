'use client'

import { useState } from 'react'

interface AdvancedFiltersProps {
  onApply: (filters: FilterOptions) => void
  onReset: () => void
}

export interface FilterOptions {
  connector_types?: string[]
  is_dc_fast?: boolean
  networks?: string[]
  amenities?: string[]
  is_24x7?: boolean
  min_power?: number
}

export function AdvancedFilters({ onApply, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([])
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [isDcFast, setIsDcFast] = useState(false)
  const [is24x7, setIs24x7] = useState(false)
  const [minPower, setMinPower] = useState(0)

  const connectorTypes = ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T']
  const networks = ['Tata Power', 'Statiq', 'ChargeZone', 'Ather Grid', 'Jio-BP']
  const amenities = ['food', 'washroom', 'wifi', 'coffee', 'sitting_area']

  const toggleSelection = (array: string[], setArray: (val: string[]) => void, value: string) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value))
    } else {
      setArray([...array, value])
    }
  }

  const handleApply = () => {
    onApply({
      connector_types: selectedConnectors.length > 0 ? selectedConnectors : undefined,
      networks: selectedNetworks.length > 0 ? selectedNetworks : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      is_dc_fast: isDcFast || undefined,
      is_24x7: is24x7 || undefined,
      min_power: minPower > 0 ? minPower : undefined,
    })
    setIsOpen(false)
  }

  const handleReset = () => {
    setSelectedConnectors([])
    setSelectedNetworks([])
    setSelectedAmenities([])
    setIsDcFast(false)
    setIs24x7(false)
    setMinPower(0)
    onReset()
    setIsOpen(false)
  }

  const activeFiltersCount = 
    selectedConnectors.length + 
    selectedNetworks.length + 
    selectedAmenities.length +
    (isDcFast ? 1 : 0) +
    (is24x7 ? 1 : 0) +
    (minPower > 0 ? 1 : 0)

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl glass-ultra border border-white/10 hover:border-indigo-500 transition-all flex items-center gap-2 font-semibold text-sm sm:text-base"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Advanced Filters
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-y-auto glass-ultra border border-white/10 rounded-xl z-50 animate-in p-4">
            <h3 className="text-lg font-bold mb-4">Advanced Filters</h3>

            {/* Connector Types */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Connector Type</label>
              <div className="flex flex-wrap gap-2">
                {connectorTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleSelection(selectedConnectors, setSelectedConnectors, type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedConnectors.includes(type)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Networks */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Charging Network</label>
              <div className="flex flex-wrap gap-2">
                {networks.map(network => (
                  <button
                    key={network}
                    onClick={() => toggleSelection(selectedNetworks, setSelectedNetworks, network)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedNetworks.includes(network)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {network}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleSelection(selectedAmenities, setSelectedAmenities, amenity)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {amenity.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-sm">DC Fast Charging Only</span>
                <input
                  type="checkbox"
                  checked={isDcFast}
                  onChange={(e) => setIsDcFast(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-sm">Open 24/7</span>
                <input
                  type="checkbox"
                  checked={is24x7}
                  onChange={(e) => setIs24x7(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-500"
                />
              </label>
            </div>

            {/* Min Power */}
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-sm">
                Minimum Power: {minPower}kW
              </label>
              <input
                type="range"
                min="0"
                max="150"
                step="10"
                value={minPower}
                onChange={(e) => setMinPower(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 font-semibold transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}






