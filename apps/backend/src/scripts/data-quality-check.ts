import { supabaseAdmin } from '../db/supabase'

/**
 * Data Quality Check Script
 * Identifies and reports data quality issues in the stations database
 */

async function checkDataQuality() {
  console.log('🔍 Starting data quality check...\n')

  // 1. Check for missing critical fields
  const { data: missingData } = await supabaseAdmin
    .from('stations')
    .select('id, name, latitude, longitude, network, address')
    .or('name.is.null,latitude.is.null,longitude.is.null,network.is.null,address.is.null')

  console.log(`📍 Stations with missing critical fields: ${missingData?.length || 0}`)
  if (missingData && missingData.length > 0) {
    console.log('   Issues found:')
    missingData.slice(0, 5).forEach(s => {
      const missing = []
      if (!s.name) missing.push('name')
      if (!s.latitude) missing.push('latitude')
      if (!s.longitude) missing.push('longitude')
      if (!s.network) missing.push('network')
      if (!s.address) missing.push('address')
      console.log(`   - ${s.id}: Missing ${missing.join(', ')}`)
    })
  }

  // 2. Check for stations without connectors
  const { data: noConnectors } = await supabaseAdmin
    .from('stations')
    .select(`
      id, 
      name,
      connectors:connectors(count)
    `)

  const stationsWithoutConnectors = noConnectors?.filter(s => 
    !s.connectors || s.connectors.length === 0
  ) || []

  console.log(`\n⚡ Stations without connectors: ${stationsWithoutConnectors.length}`)
  if (stationsWithoutConnectors.length > 0) {
    stationsWithoutConnectors.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name} (${s.id})`)
    })
  }

  // 3. Check for duplicate stations (same name and close coordinates)
  const { data: allStations } = await supabaseAdmin
    .from('stations')
    .select('id, name, latitude, longitude, network')

  const duplicates: any[] = []
  if (allStations) {
    for (let i = 0; i < allStations.length; i++) {
      for (let j = i + 1; j < allStations.length; j++) {
        const s1 = allStations[i]
        const s2 = allStations[j]
        
        // Check if same name and within 100m
        const distance = Math.sqrt(
          Math.pow((s1.latitude - s2.latitude) * 111000, 2) +
          Math.pow((s1.longitude - s2.longitude) * 111000, 2)
        )
        
        if (s1.name === s2.name && distance < 100) {
          duplicates.push({ s1, s2, distance: Math.round(distance) })
        }
      }
    }
  }

  console.log(`\n🔄 Potential duplicate stations: ${duplicates.length}`)
  if (duplicates.length > 0) {
    duplicates.slice(0, 5).forEach(d => {
      console.log(`   - ${d.s1.name}: ${d.s1.network} vs ${d.s2.network} (${d.distance}m apart)`)
    })
  }

  // 4. Check for missing pricing information
  const { data: noPricing } = await supabaseAdmin
    .from('stations')
    .select(`
      id, 
      name,
      pricing:station_pricing(count)
    `)

  const stationsWithoutPricing = noPricing?.filter(s => 
    !s.pricing || s.pricing.length === 0
  ) || []

  console.log(`\n💰 Stations without pricing: ${stationsWithoutPricing.length}`)
  if (stationsWithoutPricing.length > 0) {
    stationsWithoutPricing.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name} (${s.id})`)
    })
  }

  // 5. Check for invalid coordinates (outside India)
  const INDIA_BOUNDS = {
    minLat: 6.5,
    maxLat: 35.5,
    minLng: 68.0,
    maxLng: 97.5,
  }

  const { data: invalidCoords } = await supabaseAdmin
    .from('stations')
    .select('id, name, latitude, longitude')
    .or(`latitude.lt.${INDIA_BOUNDS.minLat},latitude.gt.${INDIA_BOUNDS.maxLat},longitude.lt.${INDIA_BOUNDS.minLng},longitude.gt.${INDIA_BOUNDS.maxLng}`)

  console.log(`\n🌍 Stations with invalid coordinates: ${invalidCoords?.length || 0}`)
  if (invalidCoords && invalidCoords.length > 0) {
    invalidCoords.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name}: (${s.latitude}, ${s.longitude})`)
    })
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total issues found:`)
  console.log(`  - Missing fields: ${missingData?.length || 0}`)
  console.log(`  - No connectors: ${stationsWithoutConnectors.length}`)
  console.log(`  - Potential duplicates: ${duplicates.length}`)
  console.log(`  - No pricing: ${stationsWithoutPricing.length}`)
  console.log(`  - Invalid coords: ${invalidCoords?.length || 0}`)
  console.log('='.repeat(50))
}

// Run the check
checkDataQuality()
  .then(() => {
    console.log('\n✅ Data quality check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })




