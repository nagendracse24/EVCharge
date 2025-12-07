// Quick test to verify Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✅ Set (${SUPABASE_ANON_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('OPENCHARGEMAP_API_KEY:', process.env.OPENCHARGEMAP_API_KEY ? '✅ Set' : '❌ Missing');
console.log('\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing required environment variables!');
  process.exit(1);
}

// Test admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('📡 Testing database connection...\n');
  
  try {
    // Test 1: Count stations
    const { data, error, count } = await supabaseAdmin
      .from('stations')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Database query failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Current stations in database: ${count}`);
    console.log('\n');
    
    // Test 2: Try inserting a test station
    console.log('🧪 Testing insert permission...\n');
    
    const testStation = {
      name: 'TEST STATION - DELETE ME',
      network: 'Test Network',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Address',
      city: 'Bangalore',
      state: 'Karnataka',
      is_24x7: true,
      parking_type: 'public',
      source: 'test',
      trust_level: 50,
      last_verified_at: new Date().toISOString(),
    };
    
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('stations')
      .insert(testStation)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('   Details:', insertError.details);
      console.log('\n⚠️  SERVICE ROLE KEY MIGHT BE WRONG!');
      return;
    }
    
    console.log('✅ Insert successful! Test station created.');
    console.log('   Station ID:', inserted.id);
    
    // Clean up - delete test station
    await supabaseAdmin.from('stations').delete().eq('id', inserted.id);
    console.log('✅ Test station deleted (cleanup)');
    console.log('\n🎉 All tests passed! Service role key is valid!\n');
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }
}

testConnection();


