# 🔄 How to Restart Everything

## **Current Situation**
✅ Backend is running on port 3001 (PID 35416)
❌ Frontend failed with ENOWORKSPACES error
✅ **FIXED!** Updated package.json scripts

## **Steps to Restart:**

### 1. Stop Current Processes
In the terminal where `npm run dev` is running, press:
```
Ctrl + C
```

### 2. Start Everything Again
```bash
npm run dev
```

This will now work because I fixed the npm scripts to use `--prefix` instead of `cd`.

## **Expected Output:**

```
[0] 📡 Registered data source: Statiq
[0] 📡 Registered data source: Ather Grid
[0] 📡 Registered data source: Tata Power EZ Charge
[0] 📡 Registered data source: Ola Electric
[0] 📡 Registered data source: India Open Data Portal
[0] 📡 Registered data source: OpenChargeMap
[0] 🚀 Backend server running on http://localhost:3001
[0] 📊 Environment: development
[0] 💡 Data auto-sync disabled in development mode
[0] 💡 Use POST /api/admin/sync/all to manually sync data

[1] ▲ Next.js 14.0.4
[1] - Local: http://localhost:3000
[1] ✓ Ready in 5s
```

## **If Port 3001 Still Busy:**

If you get "EADDRINUSE" error, kill the process:

```powershell
# Kill the backend process
taskkill /PID 35416 /F

# Then run again
npm run dev
```

## **Test It's Working:**

Once both are running:

1. **Frontend**: http://localhost:3000
2. **Backend**: http://localhost:3001/health

## **Next: Test Data Aggregation!**

Once running, sync 200+ stations:

```powershell
# In a NEW terminal (keep the dev servers running)
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/openchargemap" -Method POST
```

This will fetch real charging stations from OpenChargeMap! 🚀



