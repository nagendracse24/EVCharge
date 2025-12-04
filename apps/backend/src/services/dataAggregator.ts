/**
 * Data Aggregator Service
 * 
 * Fetches and aggregates EV charging station data from multiple sources:
 * - Google Places API
 * - CPO APIs (Statiq, Ather, Tata Power, Ola, etc.)
 * - Open Government Data
 * - Crowdsourced data
 * 
 * Features:
 * - Auto-sync every 12/24 hours
 * - De-duplication
 * - Data quality scoring
 * - Incremental updates
 */

import { supabaseAdmin } from '../db/supabase'
import { config } from '../config'

export interface DataSource {
  id: string
  name: string
  type: 'api' | 'scraper' | 'static' | 'crowdsourced'
  fetch: () => Promise<StationData[]>
  enabled: boolean
  sync_interval_hours: number
}

export interface StationData {
  external_id?: string
  source: string
  name: string
  network: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  pincode?: string
  is_24x7: boolean
  parking_type?: string
  connectors: ConnectorData[]
  pricing: PricingData[]
  amenities?: AmenityData
  trust_level: number
  last_verified_at: string
}

interface ConnectorData {
  connector_type: string
  power_kw: number
  is_dc_fast: boolean
  count: number
  vehicle_type_supported: string
}

interface PricingData {
  connector_type: string
  pricing_model: string
  price_value: number
  parking_charges?: number
  remarks?: string
}

interface AmenityData {
  has_washroom?: boolean
  has_food?: boolean
  has_coffee_tea?: boolean
  has_wifi?: boolean
  has_sitting_area?: boolean
  has_shade?: boolean
  nearby_atm?: boolean
  safety_rating?: number
}

class DataAggregatorService {
  private sources: Map<string, DataSource> = new Map()
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.registerSources()
  }

  private registerSources() {
    // Google Places API (when available)
    if (config.GOOGLE_PLACES_API_KEY) {
      this.registerSource({
        id: 'google_places',
        name: 'Google Places API',
        type: 'api',
        fetch: this.fetchFromGooglePlaces.bind(this),
        enabled: true,
        sync_interval_hours: 24,
      })
    }

    // Statiq API (public endpoint)
    this.registerSource({
      id: 'statiq',
      name: 'Statiq',
      type: 'api',
      fetch: this.fetchFromStatiq.bind(this),
      enabled: true,
      sync_interval_hours: 12,
    })

    // Ather Grid (public data)
    this.registerSource({
      id: 'ather',
      name: 'Ather Grid',
      type: 'api',
      fetch: this.fetchFromAther.bind(this),
      enabled: true,
      sync_interval_hours: 12,
    })

    // Tata Power EZ Charge (public locations)
    this.registerSource({
      id: 'tata_power',
      name: 'Tata Power EZ Charge',
      type: 'api',
      fetch: this.fetchFromTataPower.bind(this),
      enabled: true,
      sync_interval_hours: 24,
    })

    // Ola Electric
    this.registerSource({
      id: 'ola',
      name: 'Ola Electric',
      type: 'api',
      fetch: this.fetchFromOla.bind(this),
      enabled: true,
      sync_interval_hours: 24,
    })

    // Government Open Data Portal
    this.registerSource({
      id: 'gov_india',
      name: 'India Open Data Portal',
      type: 'static',
      fetch: this.fetchFromGovData.bind(this),
      enabled: true,
      sync_interval_hours: 168, // Weekly
    })

    // OpenChargeMap
    this.registerSource({
      id: 'openchargemap',
      name: 'OpenChargeMap',
      type: 'api',
      fetch: this.fetchFromOpenChargeMap.bind(this),
      enabled: true,
      sync_interval_hours: 24,
    })

    // OpenStreetMap (via Overpass API)
    this.registerSource({
      id: 'openstreetmap',
      name: 'OpenStreetMap',
      type: 'api',
      fetch: this.fetchFromOpenStreetMap.bind(this),
      enabled: true,
      sync_interval_hours: 48, // Less frequent
    })

    // PlugShare (if we get API key later)
    // Commenting out for now as it requires registration
    // this.registerSource({
    //   id: 'plugshare',
    //   name: 'PlugShare',
    //   type: 'api',
    //   fetch: this.fetchFromPlugShare.bind(this),
    //   enabled: false,
    //   sync_interval_hours: 24,
    // })
  }

  registerSource(source: DataSource) {
    this.sources.set(source.id, source)
    console.log(`📡 Registered data source: ${source.name}`)
  }

  /**
   * Start automatic syncing for all enabled sources
   */
  startAutoSync() {
    console.log('🔄 Starting auto-sync for all data sources...')
    
    for (const [sourceId, source] of this.sources.entries()) {
      if (!source.enabled) continue

      // Initial sync
      this.syncSource(sourceId).catch(err => {
        console.error(`❌ Initial sync failed for ${source.name}:`, err.message)
      })

      // Schedule periodic sync
      const intervalMs = source.sync_interval_hours * 60 * 60 * 1000
      const interval = setInterval(() => {
        this.syncSource(sourceId).catch(err => {
          console.error(`❌ Scheduled sync failed for ${source.name}:`, err.message)
        })
      }, intervalMs)

      this.syncIntervals.set(sourceId, interval)
      console.log(`⏰ Scheduled ${source.name} sync every ${source.sync_interval_hours}h`)
    }
  }

  /**
   * Stop all auto-sync intervals
   */
  stopAutoSync() {
    console.log('🛑 Stopping auto-sync...')
    for (const interval of this.syncIntervals.values()) {
      clearInterval(interval)
    }
    this.syncIntervals.clear()
  }

  /**
   * Manually trigger sync for a specific source
   */
  async syncSource(sourceId: string): Promise<{ inserted: number; updated: number; errors: number }> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }

    console.log(`🔄 Syncing ${source.name}...`)
    const startTime = Date.now()

    try {
      const stations = await source.fetch()
      console.log(`📥 Fetched ${stations.length} stations from ${source.name}`)

      let inserted = 0
      let updated = 0
      let errors = 0

      for (const station of stations) {
        try {
          const result = await this.upsertStation(station)
          if (result.isNew) inserted++
          else updated++
        } catch (err: any) {
          console.error(`❌ Failed to upsert station ${station.name}:`, err.message)
          errors++
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ ${source.name} sync complete in ${duration}s: ${inserted} new, ${updated} updated, ${errors} errors`)

      // Log sync result
      await this.logSyncResult(sourceId, { inserted, updated, errors, duration: parseFloat(duration) })

      return { inserted, updated, errors }
    } catch (err: any) {
      console.error(`❌ Sync failed for ${source.name}:`, err.message)
      throw err
    }
  }

  /**
   * Sync all enabled sources
   */
  async syncAll(): Promise<void> {
    console.log('🔄 Syncing all data sources...')
    
    for (const sourceId of this.sources.keys()) {
      try {
        await this.syncSource(sourceId)
      } catch (err: any) {
        console.error(`❌ Failed to sync ${sourceId}:`, err.message)
      }
    }

    console.log('✅ All sources synced')
  }

  /**
   * Upsert station with de-duplication
   */
  private async upsertStation(data: StationData): Promise<{ isNew: boolean; stationId: string }> {
    // Check for duplicates based on location proximity + name similarity
    const { data: existing } = await supabaseAdmin.rpc('find_nearby_stations', {
      p_lat: data.latitude,
      p_lng: data.longitude,
      p_radius_m: 50, // 50 meters
    })

    let stationId: string
    let isNew = false

    if (existing && existing.length > 0) {
      // Check if any existing station has similar name
      const duplicate = existing.find((s: any) => 
        this.isSimilarName(s.name, data.name)
      )

      if (duplicate) {
        // Update existing station
        stationId = duplicate.id
        await this.updateStation(stationId, data)
      } else {
        // Insert new station
        stationId = await this.insertStation(data)
        isNew = true
      }
    } else {
      // Insert new station
      stationId = await this.insertStation(data)
      isNew = true
    }

    return { isNew, stationId }
  }

  private async insertStation(data: StationData): Promise<string> {
    // Insert station
    const { data: station, error: stationError } = await supabaseAdmin
      .from('stations')
      .insert({
        name: data.name,
        network: data.network,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        is_24x7: data.is_24x7,
        parking_type: data.parking_type,
        source: data.source,
        trust_level: data.trust_level,
        last_verified_at: data.last_verified_at,
      })
      .select('id')
      .single()

    if (stationError) throw stationError

    const stationId = station.id

    // Insert connectors
    if (data.connectors.length > 0) {
      const connectors = data.connectors.map(c => ({
        station_id: stationId,
        connector_type: c.connector_type,
        power_kw: c.power_kw,
        is_dc_fast: c.is_dc_fast,
        count: c.count,
        vehicle_type_supported: c.vehicle_type_supported,
      }))

      await supabaseAdmin.from('station_connectors').insert(connectors)
    }

    // Insert pricing
    if (data.pricing.length > 0) {
      const pricing = data.pricing.map(p => ({
        station_id: stationId,
        connector_type: p.connector_type,
        pricing_model: p.pricing_model,
        price_value: p.price_value,
        parking_charges: p.parking_charges,
        remarks: p.remarks,
      }))

      await supabaseAdmin.from('station_pricing').insert(pricing)
    }

    // Insert amenities
    if (data.amenities) {
      await supabaseAdmin.from('station_amenities').insert({
        station_id: stationId,
        ...data.amenities,
      })
    }

    return stationId
  }

  private async updateStation(stationId: string, data: StationData): Promise<void> {
    // Update station metadata
    await supabaseAdmin
      .from('stations')
      .update({
        name: data.name,
        network: data.network,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        is_24x7: data.is_24x7,
        parking_type: data.parking_type,
        trust_level: Math.max(data.trust_level, 50), // Don't downgrade existing trust
        last_verified_at: data.last_verified_at,
      })
      .eq('id', stationId)

    // Update connectors (delete old, insert new)
    await supabaseAdmin.from('station_connectors').delete().eq('station_id', stationId)
    if (data.connectors.length > 0) {
      const connectors = data.connectors.map(c => ({
        station_id: stationId,
        connector_type: c.connector_type,
        power_kw: c.power_kw,
        is_dc_fast: c.is_dc_fast,
        count: c.count,
        vehicle_type_supported: c.vehicle_type_supported,
      }))
      await supabaseAdmin.from('station_connectors').insert(connectors)
    }

    // Update pricing
    await supabaseAdmin.from('station_pricing').delete().eq('station_id', stationId)
    if (data.pricing.length > 0) {
      const pricing = data.pricing.map(p => ({
        station_id: stationId,
        connector_type: p.connector_type,
        pricing_model: p.pricing_model,
        price_value: p.price_value,
        parking_charges: p.parking_charges,
        remarks: p.remarks,
      }))
      await supabaseAdmin.from('station_pricing').insert(pricing)
    }

    // Update amenities
    await supabaseAdmin.from('station_amenities').delete().eq('station_id', stationId)
    if (data.amenities) {
      await supabaseAdmin.from('station_amenities').insert({
        station_id: stationId,
        ...data.amenities,
      })
    }
  }

  private isSimilarName(name1: string, name2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const n1 = normalize(name1)
    const n2 = normalize(name2)
    
    // Exact match after normalization
    if (n1 === n2) return true
    
    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true
    
    // Levenshtein distance < 3
    const distance = this.levenshteinDistance(n1, n2)
    return distance < 3
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  private async logSyncResult(sourceId: string, result: any) {
    try {
      await supabaseAdmin.from('data_sync_logs').insert({
        source_id: sourceId,
        inserted_count: result.inserted,
        updated_count: result.updated,
        error_count: result.errors,
        duration_seconds: result.duration,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to log sync result:', err)
    }
  }

  // ===== DATA SOURCE IMPLEMENTATIONS =====

  private async fetchFromGooglePlaces(): Promise<StationData[]> {
    // Placeholder - implement when Google API key is available
    console.log('⏩ Skipping Google Places (API key not configured)')
    return []
  }

  private async fetchFromStatiq(): Promise<StationData[]> {
    // Statiq has a public map widget that can be scraped
    // For now, return placeholder data
    console.log('⏩ Fetching from Statiq...')
    
    // TODO: Implement actual Statiq API/scraper
    // Their website: https://www.statiq.in/
    // They have 7000+ stations
    
    return []
  }

  private async fetchFromAther(): Promise<StationData[]> {
    // Ather Grid locations
    console.log('⏩ Fetching from Ather Grid...')
    
    // TODO: Implement Ather API/scraper
    // Their website: https://www.atherenergy.com/charging
    
    return []
  }

  private async fetchFromTataPower(): Promise<StationData[]> {
    // Tata Power EZ Charge
    console.log('⏩ Fetching from Tata Power...')
    
    // TODO: Implement Tata Power API/scraper
    // Their website: https://www.tatapowerezcharge.com/
    
    return []
  }

  private async fetchFromOla(): Promise<StationData[]> {
    // Ola Electric hyperchargers
    console.log('⏩ Fetching from Ola Electric...')
    
    // TODO: Implement Ola API/scraper
    // Their website: https://www.olaelectric.com/
    
    return []
  }

  private async fetchFromGovData(): Promise<StationData[]> {
    // India Open Data Portal
    console.log('⏩ Fetching from Government Open Data...')
    
    // TODO: Implement gov data fetcher
    // Portal: https://data.gov.in/
    
    return []
  }

  private async fetchFromOpenChargeMap(): Promise<StationData[]> {
    // OpenChargeMap has a free API
    console.log('⏩ Fetching from OpenChargeMap...')
    
    try {
      // OpenChargeMap API (free, no key needed)
      const cities = [
        { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
        { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
        { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
        { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
      ]

      const allStations: StationData[] = []

      for (const city of cities) {
        console.log(`📍 Fetching ${city.name}...`)
        
        // Add API key if available
        const apiKey = config.OPENCHARGEMAP_API_KEY || ''
        const keyParam = apiKey ? `&key=${apiKey}` : ''
        const url = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&latitude=${city.lat}&longitude=${city.lng}&distance=50&maxresults=100&compact=true&verbose=false${keyParam}`
        
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'EVChargeIndia/1.0 (contact@evcharge.in)',
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          })
          console.log(`📡 ${city.name} response status: ${response.status}`)
          
          if (!response.ok) {
            console.log(`⚠️  ${city.name} returned ${response.status}, skipping`)
            continue
          }

          const data = await response.json()
          console.log(`📥 ${city.name} returned ${data.length} stations`)

        for (const poi of data) {
          if (!poi.AddressInfo) continue

          const station: StationData = {
            external_id: `ocm_${poi.ID}`,
            source: 'openchargemap',
            name: poi.AddressInfo.Title || 'Unknown Station',
            network: poi.OperatorInfo?.Title || 'Independent',
            latitude: poi.AddressInfo.Latitude,
            longitude: poi.AddressInfo.Longitude,
            address: poi.AddressInfo.AddressLine1 || '',
            city: poi.AddressInfo.Town || city.name,
            state: poi.AddressInfo.StateOrProvince || '',
            pincode: poi.AddressInfo.Postcode,
            is_24x7: poi.StatusType?.IsOperational || false,
            parking_type: poi.AddressInfo.AccessComments || 'public',
            connectors: [],
            pricing: [],
            trust_level: 60,
            last_verified_at: new Date().toISOString(),
          }

          // Parse connectors
          if (poi.Connections) {
            for (const conn of poi.Connections) {
              const powerKw = conn.PowerKW || 7.4
              station.connectors.push({
                connector_type: conn.ConnectionType?.Title || 'Type 2',
                power_kw: powerKw,
                is_dc_fast: powerKw >= 50,
                count: conn.Quantity || 1,
                vehicle_type_supported: '4W',
              })

              // Add pricing (estimate)
              station.pricing.push({
                connector_type: conn.ConnectionType?.Title || 'Type 2',
                pricing_model: 'per_kwh',
                price_value: powerKw >= 50 ? 18 : 12, // Estimate
              })
            }
          }

          allStations.push(station)
        }

        console.log(`✅ ${city.name}: Processed ${allStations.length} total stations so far`)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (cityErr: any) {
          console.error(`❌ Failed to fetch ${city.name}:`, cityErr.message)
        }
      }

      console.log(`✅ Fetched ${allStations.length} stations from OpenChargeMap across all cities`)
      return allStations
    } catch (err: any) {
      console.error('❌ OpenChargeMap fetch failed:', err.message)
      console.error('Stack:', err.stack)
      return []
    }
  }

  private async fetchFromOpenStreetMap(): Promise<StationData[]> {
    // OpenStreetMap via Overpass API (completely free!)
    console.log('⏩ Fetching from OpenStreetMap...')
    
    try {
      const cities = [
        { lat: 12.9716, lng: 77.5946, name: 'Bangalore', radius: 50000 }, // 50km
        { lat: 28.7041, lng: 77.1025, name: 'Delhi', radius: 50000 },
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai', radius: 50000 },
        { lat: 13.0827, lng: 80.2707, name: 'Chennai', radius: 50000 },
        { lat: 22.5726, lng: 88.3639, name: 'Kolkata', radius: 50000 },
      ]

      const allStations: StationData[] = []

      for (const city of cities) {
        console.log(`📍 Fetching ${city.name} from OSM...`)
        
        // Overpass QL query for charging stations
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="charging_station"](around:${city.radius},${city.lat},${city.lng});
            way["amenity"="charging_station"](around:${city.radius},${city.lat},${city.lng});
          );
          out body;
        `
        
        try {
          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'EVChargeIndia/1.0',
            },
            body: `data=${encodeURIComponent(query)}`
          })

          console.log(`📡 ${city.name} OSM response: ${response.status}`)
          
          if (!response.ok) {
            console.log(`⚠️  ${city.name} OSM returned ${response.status}, skipping`)
            continue
          }

          const data = await response.json()
          const elements = data.elements || []
          console.log(`📥 ${city.name} OSM returned ${elements.length} charging points`)

          for (const element of elements) {
            const tags = element.tags || {}
            
            // Skip if no coordinates
            if (!element.lat || !element.lon) continue

            // Extract operator/network
            const operator = tags.operator || tags.brand || tags.network || 'Independent'
            const name = tags.name || `${operator} Charging Station`

            // Determine connector types
            const connectors: ConnectorData[] = []
            const socketTypes = ['socket:type2', 'socket:ccs', 'socket:chademo', 'socket:type2_combo']
            
            for (const socketType of socketTypes) {
              const count = parseInt(tags[socketType]) || 0
              if (count > 0) {
                const connectorType = this.mapOSMSocketType(socketType)
                const power = parseFloat(tags[`${socketType}:output`]) || 7.4
                
                connectors.push({
                  connector_type: connectorType,
                  power_kw: power,
                  is_dc_fast: power >= 50,
                  count: count,
                  vehicle_type_supported: '4W',
                })
              }
            }

            // Default connector if none specified
            if (connectors.length === 0) {
              const capacity = parseFloat(tags.capacity) || 1
              connectors.push({
                connector_type: 'Type 2',
                power_kw: 7.4,
                is_dc_fast: false,
                count: capacity,
                vehicle_type_supported: '4W',
              })
            }

            const station: StationData = {
              external_id: `osm_${element.type}_${element.id}`,
              source: 'openstreetmap',
              name: name,
              network: operator,
              latitude: element.lat,
              longitude: element.lon,
              address: tags['addr:street'] || tags.address || '',
              city: tags['addr:city'] || city.name,
              state: tags['addr:state'] || '',
              pincode: tags['addr:postcode'],
              is_24x7: tags.opening_hours === '24/7' || tags.access === '24/7',
              parking_type: tags.parking || tags.access || 'public',
              connectors: connectors,
              pricing: connectors.map(c => ({
                connector_type: c.connector_type,
                pricing_model: 'per_kwh' as const,
                price_value: c.is_dc_fast ? 18 : 12,
              })),
              trust_level: 55, // OSM is community-maintained
              last_verified_at: new Date().toISOString(),
            }

            allStations.push(station)
          }

          console.log(`✅ ${city.name} OSM: Processed ${allStations.length} total stations so far`)
          
          // Rate limiting - OSM Overpass has strict limits
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (cityErr: any) {
          console.error(`❌ Failed to fetch ${city.name} from OSM:`, cityErr.message)
        }
      }

      console.log(`✅ Fetched ${allStations.length} stations from OpenStreetMap`)
      return allStations
    } catch (err: any) {
      console.error('❌ OpenStreetMap fetch failed:', err.message)
      return []
    }
  }

  private mapOSMSocketType(socketType: string): string {
    const mapping: { [key: string]: string } = {
      'socket:type2': 'Type 2',
      'socket:ccs': 'CCS2',
      'socket:chademo': 'CHAdeMO',
      'socket:type2_combo': 'CCS2',
    }
    return mapping[socketType] || 'Type 2'
  }
}

// Singleton instance
export const dataAggregator = new DataAggregatorService()

