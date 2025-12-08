# 🔴 Railway Backend Keeps Stopping - FIX

## Problem Diagnosis

Your backend stops after git push because:
1. ❌ Wrong working directory in railway.json
2. ❌ Dependencies not properly installed
3. ❌ Missing NODE_ENV=production
4. ❌ Healthcheck might be timing out

## ✅ Solution Applied

### 1. Updated `railway.json`:
```json
{
  "build": {
    "buildCommand": "npm install && cd apps/backend && npm install",
    "rootDirectory": "/"
  },
  "deploy": {
    "startCommand": "cd apps/backend && NODE_ENV=production npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 2. Check Railway Environment Variables

**Go to Railway Dashboard → Your Project → Variables**

**Required Variables:**
```env
NODE_ENV=production
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENCHARGEMAP_API_KEY=your_key
API_PORT=3001
```

**Make sure ALL are set!**

### 3. Push and Redeploy

```bash
git add railway.json
git commit -m "Fix Railway deployment config"
git push
```

**Railway will auto-redeploy in 2-3 minutes.**

### 4. Monitor Logs

**In Railway Dashboard:**
1. Go to Deployments tab
2. Click latest deployment
3. Watch the logs in real-time
4. Look for errors

### 5. Common Issues & Solutions

**Issue: "Cannot find module 'tsx'"**
```bash
# Fix: tsx is in devDependencies, move it to dependencies
# OR: Use node dist/index.js instead
```

**Issue: "ECONNREFUSED database"**
```bash
# Fix: Check DATABASE_URL is correct
# Format: postgresql://user:pass@host:port/db
```

**Issue: "Port already in use"**
```bash
# Fix: Railway auto-assigns PORT, use process.env.PORT
# Update apps/backend/src/config.ts
```

**Issue: "Healthcheck timeout"**
```bash
# Fix: Increase timeout to 300s (done in railway.json)
# Make sure /health endpoint responds quickly
```

### 6. If Still Failing

**Check these in order:**

1. **Verify all environment variables are set**
   ```bash
   # In Railway dashboard, Variables tab
   # Every variable should have a value
   ```

2. **Check build logs for errors**
   ```bash
   # Railway Dashboard → Deployments → Build tab
   # Look for npm install failures
   ```

3. **Check runtime logs**
   ```bash
   # Railway Dashboard → Deployments → Deploy tab
   # Look for startup errors
   ```

4. **Test locally first**
   ```bash
   cd apps/backend
   NODE_ENV=production npm start
   # Should start without errors
   ```

### 7. Alternative Fix (If Above Doesn't Work)

**Use simplified railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm --prefix apps/backend start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 8. Best Practice (Production Ready)

**Update apps/backend/package.json:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

**Then in railway.json:**
```json
{
  "build": {
    "buildCommand": "cd apps/backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd apps/backend && npm start"
  }
}
```

---

## 🎯 Quick Test After Fix

**1. Check if backend is running:**
```bash
curl https://evcharge-production.up.railway.app/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

**2. Check stations API:**
```bash
curl "https://evcharge-production.up.railway.app/api/stations/nearby?lat=12.9716&lng=77.5946&radius_km=10"
# Should return station data
```

**3. If both work:** ✅ Fixed!

**4. If still failing:** Check Railway logs and send me the error message.

---

## 📞 Need Help?

Send me:
1. Railway deployment logs (last 50 lines)
2. Environment variables list (names only, not values)
3. Error message from Railway dashboard





