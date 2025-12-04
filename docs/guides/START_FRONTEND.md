# 🌐 Start Frontend

## **Backend is Running ✅**
Port 3001 - Backend API

## **Now Start Frontend:**

### Open a NEW PowerShell Terminal

**Option 1: From Root Directory**
```bash
cd C:\Users\nagesing\OneDrive - Cisco\Desktop\EVTRANSIT
npm run dev:web
```

**Option 2: From Web Directory**
```bash
cd C:\Users\nagesing\OneDrive - Cisco\Desktop\EVTRANSIT\apps\web
npm run dev
```

### Expected Output:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
- Environments: .env.local

✓ Ready in 5s
✓ Compiled in 200ms
```

### Then Open Browser:
http://localhost:3000

---

## **After Frontend Starts:**

### Test Data Sync (Get 200+ Stations!)

Open a **THIRD terminal**:

```powershell
cd C:\Users\nagesing\OneDrive - Cisco\Desktop\EVTRANSIT

# Sync OpenChargeMap
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openchargemap" -Method POST

# Check stats
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | ConvertFrom-Json
```

---

## **Quick Summary:**

**Terminal 1** (apps/backend): ✅ Running backend on :3001
**Terminal 2** (NEW): Start frontend on :3000
**Terminal 3** (NEW): Run data sync commands



