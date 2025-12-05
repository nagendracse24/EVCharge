'use client'

import { useRecentSearches } from '@/hooks/useRecentSearches'

interface RecentSearchesProps {
  onSelect: (query: string) => void
  onClose: () => void
}

export function RecentSearches({ onSelect, onClose }: RecentSearchesProps) {
  const { recentSearches, removeSearch, clearAll } = useRecentSearches()

  if (recentSearches.length === 0) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 top-full mt-2 w-full max-w-xl bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl">
        <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">Recent Searches</h3>
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {recentSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between hover:bg-gray-800 transition-colors group"
            >
              <button
                onClick={() => {
                  onSelect(search.query)
                  onClose()
                }}
                className="flex-1 text-left px-4 py-2.5 flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-white">{search.query}</span>
              </button>
              <button
                onClick={() => removeSearch(search.id)}
                className="px-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}





