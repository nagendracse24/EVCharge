import { supabase } from '../db'
import { GooglePlacesService } from './googlePlaces'

export class StationImporter {
  private googlePlaces: GooglePlacesService

  constructor() {
    this.googlePlaces = new GooglePlacesService()
  }

  /**
   * Import stations from Google Places for a specific city
   */
  async importFromGooglePlaces(city: string): Promise<{
    imported: number
    duplicates: number
    errors: number
  }> {
    console.log(`\n🔍 Searching for EV stations in ${city}...`)

    try {
      // Search for stations
      const places = await this.googlePlaces.searchByCity(city, 'India')
      console.log(`   Found ${places.length} stations from Google Places`)

      let imported = 0
      let duplicates = 0
      let errors = 0

      for (const place of places) {
        try {
          // Get detailed information
          const details = await this.googlePlaces.getPlaceDetails(place.place_id)
          
          // Parse station data
          const stationData = this.googlePlaces.parseStationData(place, details || undefined)

          // Check if station already exists (by Google Place ID or coordinates)
          const { data: existing } = await supabase
            .from('stations')
            .select('id')
            .or(`google_place_id.eq.${place.place_id},and(latitude.eq.${stationData.latitude},longitude.eq.${stationData.longitude})`)
            .limit(1)
            .single()

          if (existing) {
            duplicates++
            continue
          }

          // Insert station
          const { data: station, error: stationError } = await supabase
            .from('stations')
            .insert(stationData)
            .select()
            .single()

          if (stationError || !station) {
            console.error(`   ❌ Failed to insert ${stationData.name}:`, stationError?.message)
            errors++
            continue
          }

          // Add default connectors based on network
          await this.addDefaultConnectors(station.id, stationData.network)

          // Add default pricing
          await this.addDefaultPricing(station.id, stationData.network)

          // Add default amenities based on parking type
          await this.addDefaultAmenities(station.id, stationData.parking_type)

          imported++
          console.log(`   ✅ Imported: ${stationData.name}`)

          // Rate limiting: wait 50ms between requests to stay within Google's limits
          await new Promise(resolve => setTimeout(resolve, 50))

        } catch (error: any) {
          console.error(`   ❌ Error importing station:`, error.message)
          errors++
        }
      }

      console.log(`\n📊 Import complete for ${city}:`)
      console.log(`   ✅ Imported: ${imported}`)
      console.log(`   ⚠️  Duplicates skipped: ${duplicates}`)
      console.log(`   ❌ Errors: ${errors}`)

      return { imported, duplicates, errors }

    } catch (error: any) {
      console.error(`❌ Failed to import from ${city}:`, error.message)
      throw error
    }
  }

  /**
   * Add default connectors based on network
   */
  private async addDefaultConnectors(stationId: string, network: string) {
    let connectors: Array<{
      station_id: string
      connector_type: string
      power_kw: number
      is_dc_fast: boolean
      count: number
      vehicle_type_supported: string
    }> = []

    // Network-specific connector configurations
    if (network === 'Tata Power') {
      connectors = [
        { station_id: stationId, connector_type: 'CCS2', power_kw: 60, is_dc_fast: true, count: 2, vehicle_type_supported: '4W' },
        { station_id: stationId, connector_type: 'Type 2', power_kw: 22, is_dc_fast: false, count: 2, vehicle_type_supported: '4W' },
      ]
    } else if (network === 'Statiq') {
      connectors = [
        { station_id: stationId, connector_type: 'CCS2', power_kw: 50, is_dc_fast: true, count: 2, vehicle_type_supported: '4W' },
        { station_id: stationId, connector_type: 'Type 2', power_kw: 7.4, is_dc_fast: false, count: 1, vehicle_type_supported: '4W' },
      ]
    } else if (network === 'ChargeZone') {
      connectors = [
        { station_id: stationId, connector_type: 'CCS2', power_kw: 60, is_dc_fast: true, count: 1, vehicle_type_supported: '4W' },
        { station_id: stationId, connector_type: 'Type 2', power_kw: 22, is_dc_fast: false, count: 1, vehicle_type_supported: '4W' },
      ]
    } else if (network === 'Ather Grid') {
      connectors = [
        { station_id: stationId, connector_type: 'Type 2', power_kw: 7.4, is_dc_fast: false, count: 1, vehicle_type_supported: '2W,4W' },
      ]
    } else {
      // Unknown network: add generic connectors
      connectors = [
        { station_id: stationId, connector_type: 'CCS2', power_kw: 50, is_dc_fast: true, count: 1, vehicle_type_supported: '4W' },
        { station_id: stationId, connector_type: 'Type 2', power_kw: 22, is_dc_fast: false, count: 1, vehicle_type_supported: '4W' },
      ]
    }

    if (connectors.length > 0) {
      await supabase.from('station_connectors').insert(connectors)
    }
  }

  /**
   * Add default pricing based on network
   */
  private async addDefaultPricing(stationId: string, network: string) {
    let pricing: Array<{
      station_id: string
      connector_type: string
      pricing_model: string
      price_value: number
    }> = []

    if (network === 'Tata Power') {
      pricing = [
        { station_id: stationId, connector_type: 'CCS2', pricing_model: 'per_kwh', price_value: 16.50 },
        { station_id: stationId, connector_type: 'Type 2', pricing_model: 'per_kwh', price_value: 14.00 },
      ]
    } else if (network === 'Statiq') {
      pricing = [
        { station_id: stationId, connector_type: 'CCS2', pricing_model: 'per_kwh', price_value: 18.00 },
        { station_id: stationId, connector_type: 'Type 2', pricing_model: 'per_kwh', price_value: 15.00 },
      ]
    } else if (network === 'ChargeZone') {
      pricing = [
        { station_id: stationId, connector_type: 'CCS2', pricing_model: 'per_kwh', price_value: 17.00 },
        { station_id: stationId, connector_type: 'Type 2', pricing_model: 'per_kwh', price_value: 14.50 },
      ]
    } else if (network === 'Ather Grid') {
      pricing = [
        { station_id: stationId, connector_type: 'Type 2', pricing_model: 'per_kwh', price_value: 12.00 },
      ]
    } else {
      pricing = [
        { station_id: stationId, connector_type: 'CCS2', pricing_model: 'per_kwh', price_value: 17.00 },
        { station_id: stationId, connector_type: 'Type 2', pricing_model: 'per_kwh', price_value: 15.00 },
      ]
    }

    if (pricing.length > 0) {
      await supabase.from('station_pricing').insert(pricing)
    }
  }

  /**
   * Add default amenities based on parking type
   */
  private async addDefaultAmenities(stationId: string, parkingType: string) {
    const isCovered = ['mall', 'office', 'hotel'].includes(parkingType)

    const amenities = {
      station_id: stationId,
      has_washroom: isCovered,
      has_food: parkingType === 'mall' || parkingType === 'hotel',
      has_coffee_tea: isCovered,
      has_wifi: isCovered,
      has_sitting_area: isCovered,
      has_shade: true,
      safety_rating: isCovered ? 4.5 : 3.5,
    }

    await supabase.from('station_amenities').insert(amenities)
  }

  /**
   * Import stations for multiple cities
   */
  async importMultipleCities(cities: string[]): Promise<void> {
    console.log(`\n🚀 Starting bulk import for ${cities.length} cities...\n`)

    const totalStats = {
      imported: 0,
      duplicates: 0,
      errors: 0,
    }

    for (const city of cities) {
      const stats = await this.importFromGooglePlaces(city)
      totalStats.imported += stats.imported
      totalStats.duplicates += stats.duplicates
      totalStats.errors += stats.errors

      // Wait 1 second between cities to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n🎉 ALL IMPORTS COMPLETE!`)
    console.log(`   Total imported: ${totalStats.imported}`)
    console.log(`   Total duplicates: ${totalStats.duplicates}`)
    console.log(`   Total errors: ${totalStats.errors}`)
  }
}



