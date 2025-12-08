import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: join(__dirname, '../apps/backend/.env') })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function addStations() {
  console.log('🚀 Adding 20 new stations to database...\n')

  try {
    // Read the SQL file
    const sqlFile = readFileSync(join(__dirname, '../database/add_more_stations.sql'), 'utf-8')
    
    // Split by statement and execute
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      if (statement.includes('SELECT')) {
        // Query statement
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.log('⚠️  Query:', statement.substring(0, 60) + '...')
          console.log('   Result:', data || 'N/A')
        }
      } else {
        // Modification statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error(`❌ Error: ${error.message}`)
          errorCount++
        } else {
          successCount++
        }
      }
    }

    console.log('\n✅ Complete!')
    console.log(`   Successful: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)

    // Verify count
    const { data: stations } = await supabase
      .from('stations')
      .select('id', { count: 'exact' })

    console.log(`\n📊 Total stations in database: ${stations?.length || 0}`)

    // Show by network
    const { data: networks } = await supabase
      .from('stations')
      .select('network')

    const networkCounts = networks?.reduce((acc: any, s: any) => {
      acc[s.network] = (acc[s.network] || 0) + 1
      return acc
    }, {})

    console.log('\n📈 Stations by network:')
    Object.entries(networkCounts || {}).forEach(([network, count]) => {
      console.log(`   ${network}: ${count}`)
    })

  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

addStations()







