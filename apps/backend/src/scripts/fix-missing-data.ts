import { supabaseAdmin } from '../db/supabase'

/**
 * Fix Missing Station Data
 * Automatically fills in missing information with estimated/default values
 */

async function fixMissingData() {
  console.log('🔧 Starting data cleanup...\n')

  let fixed = 0

  // 1. Fix missing network names (use 'Unknown' or infer from nearby stations)
  console.log('1️⃣ Fixing missing network names...')
  const { data: noNetwork } = await supabaseAdmin
    .from('stations')
    .select('*')
    .is('network', null)

  for (const station of noNetwork || []) {
    await supabaseAdmin
      .from('stations')
      .update({ network: 'Independent' })
      .eq('id', station.id)
    
    console.log(`   ✅ ${station.name}: Set network to 'Independent'`)
    fixed++
  }

  // 2. Fix missing is_24x7 flags (assume false if unknown)
  console.log('\n2️⃣ Fixing missing 24/7 flags...')
  const { data: no24x7 } = await supabaseAdmin
    .from('stations')
    .select('*')
    .is('is_24x7', null)

  for (const station of no24x7 || []) {
    await supabaseAdmin
      .from('stations')
      .update({ is_24x7: false })
      .eq('id', station.id)
    
    fixed++
  }
  console.log(`   ✅ Fixed ${no24x7?.length || 0} stations`)

  // 3. Add default pricing for stations without pricing
  console.log('\n3️⃣ Adding default pricing...')
  const { data: stations } = await supabaseAdmin
    .from('stations')
    .select(`
      id, 
      name,
      network,
      pricing:station_pricing(count),
      connectors:connectors(is_dc_fast)
    `)

  for (const station of stations || []) {
    if (!station.pricing || station.pricing.length === 0) {
      const hasDC = station.connectors?.some((c: any) => c.is_dc_fast)
      const defaultPrice = hasDC ? 18 : 12

      await supabaseAdmin
        .from('station_pricing')
        .insert({
          station_id: station.id,
          pricing_model: 'per_kwh',
          price_value: defaultPrice,
        })

      console.log(`   ✅ ${station.name}: Added ₹${defaultPrice}/kWh pricing`)
      fixed++
    }
  }

  // 4. Add default connectors for stations without any
  console.log('\n4️⃣ Adding default connectors...')
  const { data: noConnectors } = await supabaseAdmin
    .from('stations')
    .select(`
      id,
      name,
      connectors:connectors(count)
    `)

  for (const station of noConnectors || []) {
    if (!station.connectors || station.connectors.length === 0) {
      // Add a basic Type 2 AC connector
      await supabaseAdmin
        .from('connectors')
        .insert({
          station_id: station.id,
          connector_type: 'Type 2 AC',
          power_kw: 7.4,
          is_dc_fast: false,
          vehicle_type_supported: 'all',
        })

      console.log(`   ✅ ${station.name}: Added default Type 2 connector`)
      fixed++
    }
  }

  // 5. Fix missing parking_type
  console.log('\n5️⃣ Fixing parking types...')
  const { data: noParking } = await supabaseAdmin
    .from('stations')
    .select('*')
    .is('parking_type', null)

  for (const station of noParking || []) {
    const parkingType = station.name.toLowerCase().includes('mall') || 
                       station.name.toLowerCase().includes('hotel') 
                       ? 'paid' : 'free'
    
    await supabaseAdmin
      .from('stations')
      .update({ parking_type: parkingType })
      .eq('id', station.id)
    
    fixed++
  }
  console.log(`   ✅ Fixed ${noParking?.length || 0} stations`)

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ DATA CLEANUP COMPLETE')
  console.log('='.repeat(50))
  console.log(`Total fixes applied: ${fixed}`)
  console.log('='.repeat(50))
}

// Run cleanup
fixMissingData()
  .then(() => {
    console.log('\n🎉 All data fixed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

