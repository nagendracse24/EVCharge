// Shared types for EVCharge India
// Copied from packages/shared for deployment compatibility

export interface Station {
  id: string
  name: string
  network?: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  pincode?: string
  is_24x7: boolean
  parking_type?: string
  source: string
  trust_level: number
  last_verified_at?: string
  distance_km?: number
  created_at: string
  updated_at: string
}

export interface StationConnector {
  id: string
  station_id: string
  connector_type: string
  power_kw: number
  is_dc_fast: boolean
  count: number
  vehicle_type_supported: string
  created_at: string
}

export interface StationPricing {
  id: string
  station_id: string
  connector_type?: string
  pricing_model: string
  price_value: number
  parking_charges?: number
  remarks?: string
  created_at: string
  updated_at: string
}

export interface StationAmenities {
  id: string
  station_id: string
  has_washroom: boolean
  has_food: boolean
  has_coffee_tea: boolean
  has_wifi: boolean
  has_sitting_area: boolean
  has_shade: boolean
  nearby_atm: boolean
  safety_rating?: number
  created_at: string
}

export interface StationReview {
  id: string
  station_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface StationWithDetails extends Station {
  connectors: StationConnector[]
  pricing: StationPricing[]
  amenities?: StationAmenities
  reviews?: StationReview[]
  review_count?: number
  avg_rating?: number
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  variant?: string
  vehicle_type: string
  battery_capacity_kwh: number
  ac_connector_type?: string
  ac_max_power_kw?: number
  dc_connector_type?: string
  dc_max_power_kw?: number
  efficiency_wh_per_km: number
  image_url?: string
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  meta?: any
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

