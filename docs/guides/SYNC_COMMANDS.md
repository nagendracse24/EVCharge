# 📊 Data Sync Commands (PowerShell)

## **Current Status**
✅ Backend running
✅ You have: **10 stations** (seed data)
🎯 Goal: Add **200-500 more** from OpenChargeMap!

---

## **Correct Commands for PowerShell:**

### 1. Sync OpenChargeMap (This Will Take 1-2 Minutes!)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openchargemap" -Method POST -ContentType "application/json" -Body "{}" | Select-Object -ExpandProperty Content
```

### 2. Check Stats (See How Many Stations You Have)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Check Sync Status (See Sync History)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/status" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 4. Sync ALL Sources (OpenChargeMap + Others)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/all" -Method POST -ContentType "application/json" -Body "{}" | Select-Object -ExpandProperty Content
```

---

## **Expected Results:**

### Before Sync:
```json
{
  "total_stations": 10,
  "stations_by_source": {
    "seed": 10
  }
}
```

### After Sync (1-2 minutes):
```json
{
  "total_stations": 260,
  "stations_by_source": {
    "seed": 10,
    "openchargemap": 250
  }
}
```

---

## **What Happens During Sync:**

1. **Fetches stations** from OpenChargeMap for 5 cities:
   - Bangalore (50-100 stations)
   - Delhi (50-100 stations)
   - Mumbai (50-100 stations)
   - Chennai (30-50 stations)
   - Kolkata (30-50 stations)

2. **De-duplicates** - No duplicate stations

3. **Adds connectors & pricing** for each station

4. **Indexes for fast search**

---

## **Watch Backend Logs:**

While sync is running, watch the backend terminal. You'll see:
```
⏩ Fetching from OpenChargeMap...
✅ Fetched 245 stations from OpenChargeMap
🔄 Syncing OpenChargeMap...
✅ OpenChargeMap sync complete in 45.23s: 245 new, 0 updated, 0 errors
```

---

## **After Sync:**

1. **Refresh your web app**: http://localhost:3000
2. **You should see 200+ stations** on the map!
3. **Test filters** - More stations = better testing!

---

## **Troubleshooting:**

### If you get errors:
- Make sure backend is running
- Check internet connection
- Try syncing one city at a time (coming soon)

### If no stations added:
- Check backend terminal for error logs
- OpenChargeMap might be rate-limiting
- Try again in a few minutes



