#!/usr/bin/env tsx

import { StationImporter } from '../services/stationImporter'

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║   🚗⚡ EV Charging Station Importer from Google Places   ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  const importer = new StationImporter()

  // Get cities from command line or use defaults
  const cities = process.argv.slice(2)
  
  if (cities.length === 0) {
    console.log('\n📍 No cities specified. Using defaults: Bangalore, Delhi')
    console.log('   (Use: npm run import-stations Bangalore Mumbai Pune)')
    cities.push('Bangalore', 'Delhi')
  }

  try {
    await importer.importMultipleCities(cities)
    console.log('\n✅ Import successful!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message)
    process.exit(1)
  }
}

main()




