# 🚀 Backend Action Plan - Start NOW!

## ✅ UI is Done! Now Let's Focus on Backend:

---

## 🎯 **STEP 1: Import Station Data (30 minutes)**

### Option A: Google Places API (BEST - 1000+ stations)

#### Get API Key:
1. Open: https://console.cloud.google.com
2. Click "Create Project"
3. Name: "EVCharge India"
4. Enable "Places API":
   - Go to "APIs & Services" → "Library"
   - Search "Places API"
   - Click "Enable"
5. Create credentials:
   - Go to "Credentials"
   - Click "+ CREATE CREDENTIALS"
   - Select "API key"
   - **Copy the key!**

#### Add to Project:
```powershell
# Open file: apps/backend/.env
# Add this line:
GOOGLE_PLACES_API_KEY=AIzaSy_your_key_here
```

#### Restart Backend:
```powershell
# Press Ctrl+C in backend terminal
# Then:
cd apps/backend
npm run dev
```

#### Test Import:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/google_places" -Method POST -ContentType "application/json" -Body "{}"
```

**Expected:** 1000+ stations imported! 🎉

---

### Option B: Manual Data Entry (Quick, 10 stations)

If you can't get API key right away, add more stations manually:

```sql
-- Run in Supabase SQL Editor
INSERT INTO stations (name, network, latitude, longitude, address, city, state, is_24x7, parking_type, source, trust_level, last_verified_at) VALUES
  ('Statiq - Orion Mall', 'Statiq', 13.0103, 77.5537, 'Brigade Gateway, Malleshwaram', 'Bangalore', 'Karnataka', true, 'mall_parking', 'manual', 80, NOW()),
  ('Ather Grid - HSR Layout', 'Ather', 12.9116, 77.6403, 'HSR Layout Sector 1', 'Bangalore', 'Karnataka', true, 'public_parking', 'manual', 80, NOW()),
  ('Tata Power - Electronic City', 'Tata Power', 12.8456, 77.6603, 'Electronic City Phase 1', 'Bangalore', 'Karnataka', true, 'office_parking', 'manual', 80, NOW());

-- Add connectors for each station
INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported) 
SELECT id, 'CCS2', 60, true, 2, '4W' FROM stations WHERE name LIKE 'Statiq - Orion%';
```

---

## 🎯 **STEP 2: Optimize Database (15 minutes)**

### Add Performance Indexes:

Create file: `database/migrations/add_performance_indexes.sql`

```sql
-- Geospatial index for fast location searches
CREATE INDEX IF NOT EXISTS idx_stations_location 
ON stations USING GIST (ST_MakePoint(longitude, latitude));

-- Search optimization
CREATE INDEX IF NOT EXISTS idx_stations_city ON stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_network ON stations(network);
CREATE INDEX IF NOT EXISTS idx_stations_is_24x7 ON stations(is_24x7);
CREATE INDEX IF NOT EXISTS idx_stations_source ON stations(source);

-- Connector indexes
CREATE INDEX IF NOT EXISTS idx_connectors_station_id ON station_connectors(station_id);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON station_connectors(connector_type);
CREATE INDEX IF NOT EXISTS idx_connectors_dc_fast ON station_connectors(is_dc_fast);
CREATE INDEX IF NOT EXISTS idx_connectors_power ON station_connectors(power_kw);

-- Pricing indexes
CREATE INDEX IF NOT EXISTS idx_pricing_station_id ON station_pricing(station_id);
CREATE INDEX IF NOT EXISTS idx_pricing_connector_type ON station_pricing(connector_type);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_station_id ON station_reviews(station_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON station_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON station_reviews(created_at DESC);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_station_date ON slot_bookings(station_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON slot_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON slot_bookings(status);
```

**Run this in Supabase SQL Editor!**

---

## 🎯 **STEP 3: Add API Pagination (20 minutes)**

### Update Stations Route:

File: `apps/backend/src/routes/stations.ts`

Find the `get('/api/stations/nearby')` endpoint and update:

```typescript
server.get('/nearby', async (request, reply) => {
  const { 
    lat, 
    lng, 
    radius_km = 10, 
    vehicle_id,
    sort_by = 'distance',
    page = 1,
    limit = 20  // NEW: Pagination
  } = request.query as any

  const offset = (Number(page) - 1) * Number(limit)

  try {
    // Get total count
    const { count } = await supabase
      .rpc('find_nearby_stations', {
        p_lat: Number(lat),
        p_lng: Number(lng),
        p_radius_m: Number(radius_km) * 1000,
      })
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data: stations, error } = await supabase
      .rpc('find_nearby_stations', {
        p_lat: Number(lat),
        p_lng: Number(lng),
        p_radius_m: Number(radius_km) * 1000,
      })
      .select(`
        *,
        connectors:station_connectors(*),
        pricing:station_pricing(*),
        amenities:station_amenities(*),
        reviews:station_reviews(rating)
      `)
      .range(offset, offset + Number(limit) - 1)

    if (error) throw error

    // Calculate average ratings
    const stationsWithRatings = stations.map(station => ({
      ...station,
      avg_rating: station.reviews.length > 0
        ? station.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / station.reviews.length
        : null
    }))

    return reply.send({
      data: stationsWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit)),
        has_next: offset + Number(limit) < (count || 0),
        has_prev: Number(page) > 1
      }
    })
  } catch (err: any) {
    server.log.error(err)
    return reply.code(500).send({ error: { message: err.message } })
  }
})
```

---

## 🎯 **STEP 4: Add Health Check (10 minutes)**

### Create Detailed Health Endpoint:

File: `apps/backend/src/routes/health.ts`

Add:

```typescript
server.get('/detailed', async (request, reply) => {
  const startTime = Date.now()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.NODE_ENV,
    version: '1.0.0',
    services: {
      database: 'unknown',
      api: 'healthy'
    },
    stats: {
      total_stations: 0,
      total_connectors: 0,
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  }

  // Check database connection
  try {
    const { data: stationCount, error: stationError } = await supabase
      .from('stations')
      .select('id', { count: 'exact', head: true })
    
    const { data: connectorCount, error: connectorError } = await supabase
      .from('station_connectors')
      .select('id', { count: 'exact', head: true })

    if (stationError || connectorError) {
      health.services.database = 'error'
      health.status = 'degraded'
    } else {
      health.services.database = 'healthy'
      health.stats.total_stations = stationCount || 0
      health.stats.total_connectors = connectorCount || 0
    }
  } catch (err) {
    health.services.database = 'error'
    health.status = 'unhealthy'
  }

  const responseTime = Date.now() - startTime
  reply.header('X-Response-Time', `${responseTime}ms`)
  
  return reply.send(health)
})
```

Test:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health/detailed" -Method GET | Select-Object -ExpandProperty Content
```

---

## 🎯 **STEP 5: Monitor & Test (Ongoing)**

### Check Database Stats:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | Select-Object -ExpandProperty Content
```

### Test Nearby Search:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/stations/nearby?lat=12.9716&lng=77.5946&radius_km=10&page=1&limit=20" -Method GET
```

### Check Health:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health/detailed" -Method GET
```

---

## 📊 **Priority Order:**

1. **DATA IMPORT** ⏰ Do this FIRST!
   - Get Google API key (30 min)
   - Import 1000+ stations
   - **Biggest impact!**

2. **DATABASE INDEXES** ⏰ Then this (15 min)
   - Run SQL migration
   - 5x faster queries

3. **PAGINATION** ⏰ Then this (20 min)
   - Update stations route
   - Handle large datasets

4. **MONITORING** ⏰ Finally (10 min)
   - Add health checks
   - Track performance

---

## 🔥 **Quick Wins (If Short on Time):**

### Can't get API key today?
**Do this instead:**

1. **Add 20 more stations manually** (30 minutes)
   - Copy `database/seed_data.sql` format
   - Add real Bangalore stations
   - Run in Supabase

2. **Add indexes** (15 minutes)
   - Big performance boost
   - No API key needed

3. **Test slot booking** (10 minutes)
   - Click station → Book Slot
   - Try the flow
   - Find any bugs

---

## 📋 **Checklist:**

### Today:
- [ ] Get Google Places API key
- [ ] Import station data (1000+)
- [ ] Add database indexes
- [ ] Test search performance

### This Week:
- [ ] Add pagination to APIs
- [ ] Implement caching
- [ ] Add error monitoring
- [ ] Optimize query performance

### Next Week:
- [ ] Real-time availability
- [ ] CPO integrations
- [ ] Advanced search
- [ ] Mobile app prep

---

## 🎯 **Start Command:**

```powershell
# Make sure backend is running:
cd apps/backend
npm run dev

# Then get that API key! 🚀
```

---

**Which step do you want to start with?**
1. Get Google API key (RECOMMENDED - biggest win!)
2. Add database indexes (quick performance boost)
3. Add more stations manually (if can't get API key now)
4. Test and fix current features

**Tell me and I'll guide you through it step by step!** 💪

