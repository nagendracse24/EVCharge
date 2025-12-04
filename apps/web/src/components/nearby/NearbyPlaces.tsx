'use client'

interface NearbyPlace {
  name: string
  type: string
  distance: string
  rating: number
  priceLevel: number
}

export function NearbyPlaces({ latitude, longitude }: { latitude: number; longitude: number }) {
  // Mock data - would use Google Places API in production
  const places: NearbyPlace[] = [
    { name: 'Cafe Coffee Day', type: 'Cafe', distance: '50m', rating: 4.2, priceLevel: 2 },
    { name: 'McDonald\'s', type: 'Fast Food', distance: '120m', rating: 4.0, priceLevel: 2 },
    { name: 'Subway', type: 'Restaurant', distance: '200m', rating: 4.3, priceLevel: 2 },
    { name: 'Starbucks', type: 'Cafe', distance: '250m', rating: 4.5, priceLevel: 3 },
    { name: 'Haldiram\'s', type: 'Restaurant', distance: '180m', rating: 4.1, priceLevel: 2 },
  ]

  const getTypeIcon = (type: string) => {
    if (type.includes('Cafe')) return '☕'
    if (type.includes('Restaurant') || type.includes('Food')) return '🍽️'
    return '🏪'
  }

  const getPriceIndicator = (level: number) => {
    return '₹'.repeat(level) + '₹'.repeat(3 - level).split('').map(() => '·').join('')
  }

  return (
    <div className="card-ultra p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Nearby While You Charge
      </h3>

      <p className="text-sm text-gray-400 mb-6">
        Make the most of your charging time - grab a coffee or meal nearby!
      </p>

      <div className="space-y-3">
        {places.map((place, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTypeIcon(place.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold group-hover:text-indigo-400 transition-colors">
                      {place.name}
                    </h4>
                    <div className="text-sm text-gray-400 mt-1">{place.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <span className="text-yellow-400">⭐</span>
                      <span>{place.rating}</span>
                    </div>
                    <div className="text-xs text-gray-400">{place.distance} away</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">{getPriceIndicator(place.priceLevel)}</span>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">
                    View on Maps →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Walking Time Calculator */}
      <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-indigo-400">Pro Tip</span>
        </div>
        <p className="text-sm text-gray-300">
          All these places are within 5 min walk. Perfect for a quick bite while your EV charges!
        </p>
      </div>
    </div>
  )
}



