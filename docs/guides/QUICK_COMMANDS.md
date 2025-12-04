# ⚡ Quick Commands Cheat Sheet

## **Start Development**

```bash
# From root directory: C:\Users\nagesing\OneDrive - Cisco\Desktop\EVTRANSIT

# Start everything at once
npm run dev

# OR start individually:
npm run dev:backend    # Backend API on :3001
npm run dev:web        # Web app on :3000
```

---

## **Data Aggregation** 📊

### Sync Data from OpenChargeMap (FREE - No API Key!)
```powershell
# Fetch 200-500 stations from OpenChargeMap
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openchargemap" -Method POST
```

### Sync ALL Sources
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/all" -Method POST
```

### Check Database Stats
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### View Sync Status
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/status" -Method GET | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## **Test APIs** 🔧

### Get Nearby Stations
```powershell
# Bangalore
Invoke-WebRequest -Uri "http://localhost:3001/api/stations/nearby?lat=12.9716&lng=77.5946&radius_km=10" -Method GET

# Delhi  
Invoke-WebRequest -Uri "http://localhost:3001/api/stations/nearby?lat=28.7041&lng=77.1025&radius_km=10" -Method GET
```

### Get All Vehicles
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/vehicles" -Method GET | ConvertFrom-Json
```

### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
```

---

## **Database Operations** 🗄️

### Run Migration in Supabase
```
1. Go to: https://supabase.com/dashboard/project/sjycysfueahyxdflbsky/editor
2. Click "SQL Editor" → "New Query"
3. Copy contents from: database/migrations/add_data_sync_logs.sql
4. Click "Run"
```

### Check Station Count
```sql
-- Run in Supabase SQL Editor
SELECT 
  source,
  COUNT(*) as count,
  AVG(trust_level) as avg_trust
FROM stations
GROUP BY source
ORDER BY count DESC;
```

---

## **Git Operations** 📦

### Commit & Push
```bash
git add .
git commit -m "feat: your message here"
git push origin main
```

### Check Status
```bash
git status
git log --oneline -5
```

---

## **Mobile App** 📱 (After Setup)

### Create Mobile App
```bash
npx create-expo-app@latest apps/mobile --template blank-typescript
cd apps/mobile
```

### Install Dependencies
```bash
npm install expo-router expo-location react-native-maps @tanstack/react-query @supabase/supabase-js
```

### Start Expo
```bash
cd apps/mobile
npm start

# Then press:
# 'a' - Android emulator
# 'i' - iOS simulator  
# Scan QR - Real device
```

---

## **Build & Deploy** 🚀

### Build Web App
```bash
cd apps/web
npm run build
```

### Build Mobile App
```bash
cd apps/mobile
eas build --platform android
eas build --platform ios
```

### Deploy Backend
```bash
# Will provide Railway/Render commands later
```

---

## **Troubleshooting** 🔧

### Port Already in Use
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Clear Node Modules
```bash
# If things are broken
rm -rf node_modules package-lock.json
npm install
```

### Restart Everything
```bash
# Stop all (Ctrl+C)
# Then:
npm run dev
```

---

## **Quick Stats** 📊

### Backend Status
```powershell
(Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats").Content | ConvertFrom-Json | Format-List
```

### Stations by City
```powershell
# Will show station distribution
Invoke-WebRequest -Uri "http://localhost:3001/api/stations/nearby?lat=12.9716&lng=77.5946&radius_km=50" | ConvertFrom-Json | Select-Object -ExpandProperty data | Group-Object city
```

---

## **Development URLs** 🌐

- **Web**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/health
- **Supabase**: https://supabase.com/dashboard/project/sjycysfueahyxdflbsky

---

**Save this file for quick reference! ⭐**



