import { config } from '../config'

interface PlaceResult {
  place_id: string
  name: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  vicinity?: string
  formatted_address?: string
  rating?: number
  user_ratings_total?: number
  business_status?: string
  opening_hours?: {
    open_now?: boolean
  }
}

interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
  }>
}

export class GooglePlacesService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/place'

  constructor() {
    this.apiKey = config.GOOGLE_PLACES_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️  Google Places API key not configured')
    }
  }

  /**
   * Search for EV charging stations near a location
   */
  async searchNearby(lat: number, lng: number, radius: number = 10000): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured')
    }

    const url = new URL(`${this.baseUrl}/nearbysearch/json`)
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', radius.toString())
    url.searchParams.set('type', 'electric_vehicle_charging_station')
    url.searchParams.set('key', this.apiKey)

    try {
      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.status === 'REQUEST_DENIED') {
        throw new Error(`Google Places API: ${data.error_message || 'Request denied'}`)
      }

      if (data.status === 'ZERO_RESULTS') {
        return []
      }

      return data.results || []
    } catch (error: any) {
      console.error('❌ Google Places API error:', error.message)
      throw error
    }
  }

  /**
   * Search for EV charging stations by city
   */
  async searchByCity(city: string, country: string = 'India'): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured')
    }

    // First, geocode the city to get coordinates
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    geocodeUrl.searchParams.set('address', `${city}, ${country}`)
    geocodeUrl.searchParams.set('key', this.apiKey)

    const geocodeResponse = await fetch(geocodeUrl.toString())
    const geocodeData = await geocodeResponse.json()

    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      throw new Error(`Could not geocode city: ${city}`)
    }

    const location = geocodeData.results[0].geometry.location

    // Then search for charging stations in a larger radius (25km)
    return this.searchNearby(location.lat, location.lng, 25000)
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured')
    }

    const url = new URL(`${this.baseUrl}/details/json`)
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,opening_hours,reviews')
    url.searchParams.set('key', this.apiKey)

    try {
      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.status !== 'OK') {
        console.error(`❌ Place details error for ${placeId}: ${data.status}`)
        return null
      }

      return data.result
    } catch (error: any) {
      console.error('❌ Place details error:', error.message)
      return null
    }
  }

  /**
   * Parse station data from Google Places result
   */
  parseStationData(place: PlaceResult, details?: PlaceDetails) {
    // Extract address components
    const address = details?.formatted_address || place.vicinity || place.formatted_address || ''
    const addressParts = address.split(',').map(p => p.trim())
    
    // Try to extract pincode
    const pincodeMatch = address.match(/\b\d{6}\b/)
    const pincode = pincodeMatch ? pincodeMatch[0] : null

    // Try to extract state (usually second-to-last in Indian addresses)
    const state = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : 'Karnataka'
    
    // City is often in the name or address
    let city = 'Bangalore'
    if (address.toLowerCase().includes('delhi') || address.toLowerCase().includes('new delhi')) {
      city = 'Delhi'
    } else if (address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('bengaluru')) {
      city = 'Bangalore'
    } else if (address.toLowerCase().includes('mumbai')) {
      city = 'Mumbai'
    } else if (address.toLowerCase().includes('pune')) {
      city = 'Pune'
    } else if (address.toLowerCase().includes('hyderabad')) {
      city = 'Hyderabad'
    }

    // Try to detect network from name
    let network = 'Unknown'
    const nameLower = place.name.toLowerCase()
    if (nameLower.includes('tata') || nameLower.includes('tata power')) {
      network = 'Tata Power'
    } else if (nameLower.includes('statiq')) {
      network = 'Statiq'
    } else if (nameLower.includes('chargezone') || nameLower.includes('charge zone')) {
      network = 'ChargeZone'
    } else if (nameLower.includes('ather')) {
      network = 'Ather Grid'
    } else if (nameLower.includes('jio') || nameLower.includes('jio-bp')) {
      network = 'Jio-BP'
    } else if (nameLower.includes('zeon')) {
      network = 'Zeon'
    }

    // Determine if 24x7 from opening hours
    const is24x7 = details?.opening_hours?.weekday_text
      ?.every(day => day.toLowerCase().includes('24 hours') || day.toLowerCase().includes('open 24'))
      || false

    // Try to determine parking type from name/address
    let parkingType: 'mall' | 'office' | 'street' | 'highway' | 'hotel' | 'fuel_station' | 'metro' = 'street'
    if (nameLower.includes('mall') || address.toLowerCase().includes('mall')) {
      parkingType = 'mall'
    } else if (nameLower.includes('tech park') || nameLower.includes('office')) {
      parkingType = 'office'
    } else if (nameLower.includes('highway') || nameLower.includes('expressway')) {
      parkingType = 'highway'
    } else if (nameLower.includes('hotel')) {
      parkingType = 'hotel'
    } else if (nameLower.includes('metro') || nameLower.includes('station')) {
      parkingType = 'metro'
    }

    return {
      name: place.name,
      network,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: addressParts[0] || address,
      city,
      state,
      pincode,
      is_24x7: is24x7,
      parking_type: parkingType,
      google_place_id: place.place_id,
      google_rating: details?.rating || place.rating,
      google_reviews_count: details?.user_ratings_total || place.user_ratings_total,
      source: 'google_places' as const,
    }
  }
}







