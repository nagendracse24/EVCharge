/**
 * Quick API Tester
 * Run this to test if any public APIs work
 */

const APIs_TO_TEST = [
  // Statiq
  'https://api.statiq.in/stations',
  'https://api.statiq.in/v1/stations',
  'https://api.statiq.in/v2/charging-stations',
  'https://app.statiq.in/api/stations',
  'https://statiq.in/api/v1/stations',
  
  // Ather
  'https://api.atherenergy.com/charging-stations',
  'https://api.atherenergy.com/v1/grid/stations',
  'https://atherenergy.com/api/grid-stations',
  'https://grid.atherenergy.com/api/stations',
  
  // Tata Power
  'https://ezcharge.tatapower.com/api/stations',
  'https://api.ezcharge.tatapower.com/v1/stations',
  'https://ezcharge.tatapower.com/api/v1/charging-points',
]

async function testAPI(url: string) {
  try {
    console.log(`\n🔍 Testing: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const text = await response.text()
      console.log(`   ✅ SUCCESS! Got ${text.length} bytes`)
      console.log(`   Preview: ${text.substring(0, 200)}...`)
      
      try {
        const json = JSON.parse(text)
        console.log(`   ✅ Valid JSON with ${Object.keys(json).length} keys`)
        console.log(`   Keys: ${Object.keys(json).join(', ')}`)
      } catch {
        console.log(`   ⚠️  Response is not JSON`)
      }
      
      return { url, success: true, status: response.status }
    } else {
      console.log(`   ❌ Failed: ${response.statusText}`)
      return { url, success: false, status: response.status }
    }
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`)
    return { url, success: false, error: err.message }
  }
}

async function testAllAPIs() {
  console.log('🚀 Testing Public APIs...')
  console.log('='.repeat(60))
  
  const results = []
  
  for (const url of APIs_TO_TEST) {
    const result = await testAPI(url)
    results.push(result)
    
    // Rate limiting - be respectful
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  
  const successful = results.filter(r => r.success)
  
  if (successful.length > 0) {
    console.log(`\n✅ Found ${successful.length} working endpoints:`)
    successful.forEach(r => console.log(`   - ${r.url}`))
  } else {
    console.log('\n⚠️  No working endpoints found')
    console.log('   Next steps:')
    console.log('   1. Use HTTP Toolkit to inspect mobile apps')
    console.log('   2. Check browser DevTools on their websites')
    console.log('   3. Contact them for official API access')
  }
}

// Run it!
testAllAPIs()
