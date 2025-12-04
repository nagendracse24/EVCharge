# 🗺️ Complete Data Sources Guide

## ✅ **Currently Implemented & Working**

### 1. **OpenChargeMap** ✅ LIVE
- **Status:** Working perfectly
- **API:** Free, requires key (you have one!)
- **Coverage:** 394 stations imported
- **Cities:** Bangalore (100), Delhi (70), Mumbai (6), Chennai (18), Kolkata (5)
- **Update:** Every 24 hours
- **Command to sync:**
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openchargemap" -Method POST -ContentType "application/json" -Body "{}"
  ```

### 2. **OpenStreetMap** ✅ NEW!
- **Status:** Just implemented, ready to test
- **API:** Completely FREE via Overpass API
- **Coverage:** Community-maintained data
- **Cities:** Same 5 major cities
- **Update:** Every 48 hours (less frequent due to rate limits)
- **Command to sync:**
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openstreetmap" -Method POST -ContentType "application/json" -Body "{}"
  ```

---

## 🔄 **Planned (Need Setup)**

### 3. **Google Places API** 📍
- **Status:** Waiting for API key
- **Cost:** Free up to 200 requests/day
- **Action:** You need to set up Google Cloud account
- **Guide:** See `GOOGLE_API_SETUP_GUIDE.md`

### 4. **PlugShare** 🔌
- **Status:** Need API registration
- **Cost:** Free tier available
- **Action:** Register at plugshare.com/api
- **Note:** Currently disabled in code

---

## ⏳ **Need Partnership/Contact**

### 5. **Statiq** 🔋
- **Status:** No public API
- **Action:** Contact Statiq for data sharing
- **Website:** statiq.in
- **Note:** 7,000+ stations, worth pursuing!

### 6. **Tata Power EZ Charge** ⚡
- **Status:** No public API
- **Action:** Contact Tata Power
- **Website:** tatapower.com/ezcharge
- **Note:** 5,500+ stations!

### 7. **Ather Grid** 🏍️
- **Status:** No public API
- **Action:** Contact Ather
- **Website:** atherenergy.com
- **Note:** Growing network

### 8. **Ola Electric** 🚗
- **Status:** No public API
- **Action:** Contact Ola
- **Note:** New entrant

---

## 📊 **Current Database Stats**

```
Total Stations: 404
├── OpenChargeMap: 394
└── Seed Data: 10

Total Connectors: 286
```

---

## 🚀 **How to Import More Data**

### Test OpenStreetMap (NEW!):

1. **Update the constraint in Supabase:**
   ```sql
   ALTER TABLE stations DROP CONSTRAINT IF EXISTS stations_source_check;
   ALTER TABLE stations ADD CONSTRAINT stations_source_check 
     CHECK (source IN (
       'seed', 'crowdsourced', 'cpo_api', 'government',
       'openchargemap', 'openstreetmap', 'google_places', 
       'plugshare', 'manual', 'statiq', 'ather', 'ola'
     ));
   ```

2. **Restart backend:**
   ```powershell
   cd apps/backend
   npm run dev
   ```

3. **Sync OpenStreetMap:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openstreetmap" -Method POST -ContentType "application/json" -Body "{}"
   ```

4. **Check stats:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | Select-Object -ExpandProperty Content
   ```

### Sync All Sources:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/all" -Method POST -ContentType "application/json" -Body "{}"
```

---

## 📋 **Priority Action Items**

1. ✅ **Done:** OpenChargeMap working
2. 🔄 **Next:** Test OpenStreetMap (just implemented!)
3. 📧 **Email:** Contact Statiq for partnership
4. 📧 **Email:** Contact Tata Power for data access
5. 💳 **Setup:** Google Places API (when ready)

---

## 🎯 **Expected Total Coverage**

If we get all sources:
- **OpenChargeMap:** ~500 stations (India)
- **OpenStreetMap:** ~300 stations (community data)
- **Statiq:** 7,000+ stations
- **Tata Power:** 5,500+ stations
- **Ather Grid:** ~1,000 stations
- **Google Places:** ~2,000 stations (unique)

**Potential Total:** **15,000+ charging stations!** 🚀

---

## 📝 **Notes**

- All free APIs are implemented and ready
- De-duplication logic automatically merges duplicate stations
- Trust scores vary by source (OpenChargeMap: 60, OSM: 55, Google: 70)
- Auto-sync runs in production mode only (to save resources in dev)

