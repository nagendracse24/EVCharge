import { useState, useEffect } from 'react'

interface RecentSearch {
  id: string
  query: string
  timestamp: number
}

const MAX_RECENT_SEARCHES = 10
const STORAGE_KEY = 'evcharge_recent_searches'

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recent searches', e)
      }
    }
  }, [])

  const addSearch = (query: string) => {
    if (!query.trim()) return

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
    }

    setRecentSearches((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase())
      
      // Add new search at beginning
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      
      return updated
    })
  }

  const removeSearch = (id: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const clearAll = () => {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearAll,
  }
}




