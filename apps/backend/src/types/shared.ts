// Shared types for backend
// Extracted from @evcharge/shared to avoid monorepo issues in deployment

export enum VehicleType {
  TWO_WHEELER = '2W',
  FOUR_WHEELER = '4W',
}

export enum ConnectorType {
  TYPE2_AC = 'Type 2 AC',
  BHARAT_AC001 = 'Bharat AC001',
  CCS2 = 'CCS2',
  CHADEMO = 'CHAdeMO',
  BHARAT_DC001 = 'Bharat DC001',
  GBT_DC = 'GB/T DC',
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  vehicle_type: VehicleType;
  battery_capacity_kwh: number;
  ac_connector_type?: ConnectorType;
  ac_max_power_kw?: number;
  dc_connector_type?: ConnectorType;
  dc_max_power_kw?: number;
  efficiency_wh_per_km: number;
  image_url?: string;
  created_at: string;
}

export interface UserVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  nickname?: string;
  is_default: boolean;
  created_at: string;
  vehicle?: Vehicle;
}

export interface Station {
  id: string;
  name: string;
  network?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  is_24x7: boolean;
  parking_type?: string;
  source: string;
  trust_level: number;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StationConnector {
  id: string;
  station_id: string;
  connector_type: ConnectorType;
  power_kw: number;
  is_dc_fast: boolean;
  count: number;
  vehicle_type_supported: VehicleType;
  created_at: string;
}

export interface StationPricing {
  id: string;
  station_id: string;
  connector_type?: ConnectorType;
  pricing_model: string;
  price_value: number;
  parking_charges?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface StationAmenities {
  id: string;
  station_id: string;
  has_washroom: boolean;
  has_food: boolean;
  has_coffee_tea: boolean;
  has_wifi: boolean;
  has_sitting_area: boolean;
  has_shade: boolean;
  nearby_atm: boolean;
  safety_rating?: number;
  created_at: string;
}

export interface StationReview {
  id: string;
  station_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface StationWithDetails extends Station {
  connectors: StationConnector[];
  pricing: StationPricing[];
  amenities?: StationAmenities;
  reviews?: StationReview[];
  avg_rating?: number;
  total_reviews?: number;
  distance_km?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// Helper function for distance calculation
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

