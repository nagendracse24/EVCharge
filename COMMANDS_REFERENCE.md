# 🎯 EVCharge India - Command Reference

Quick reference for all available commands and scripts.

---

## 🚀 **Development Commands**

### **Start Backend** (Development)
```bash
cd apps/backend
npm run dev
```
- Runs on: http://localhost:3001
- Auto-restart on file changes
- Shows debug logs

### **Start Frontend** (Development)
```bash
cd apps/web
npm run dev
```
- Runs on: http://localhost:3000
- Hot reload enabled
- Opens browser automatically

### **Start Both** (Two terminals required)
```bash
# Terminal 1
cd apps/backend && npm run dev

# Terminal 2
cd apps/web && npm run dev
```

---

## 📦 **Installation Commands**

### **Install All Dependencies**
```bash
# From project root
npm install

# Or individually
cd apps/backend && npm install
cd apps/web && npm install
```

### **Update Dependencies**
```bash
# Check outdated packages
npm outdated

# Update all
npm update

# Update specific package
npm install package-name@latest
```

---

## 🗄️ **Database Commands**

### **Run Migrations**
Open Supabase SQL Editor and run:

```sql
-- 1. Payments
\i database/migrations/011_create_payments.sql

-- 2. Photos & Reviews
\i database/migrations/012_user_photos_and_reviews.sql

-- 3. Storage
\i database/migrations/013_setup_storage.sql
```

### **Data Quality Check**
```bash
cd apps/backend
npx tsx src/scripts/data-quality-check.ts
```

### **Fix Missing Data**
```bash
cd apps/backend
npx tsx src/scripts/fix-missing-data.ts
```

### **Import Government Data**
```bash
cd apps/backend
npx tsx src/scripts/import-government-data.ts
```

---

## 🧪 **Testing Commands**

### **Test Payment Flow**
1. Start both servers
2. Visit http://localhost:3000
3. Sign in
4. Book slot
5. Use test card: `4111 1111 1111 1111`

### **Test Photo Upload**
1. Sign in
2. Click station
3. Click "Add Photo"
4. Upload < 5MB image

### **Test Reviews**
1. Sign in
2. Click station
3. Click "Add Review"
4. Submit with rating

---

## 🚀 **Deployment Commands**

### **Deploy Backend to Railway**
```bash
# 1. Commit changes
git add .
git commit -m "Ready for deployment"
git push origin main

# Railway auto-deploys from GitHub
# No manual command needed
```

### **Deploy Frontend to Vercel**
```bash
# Option 1: Auto-deploy (recommended)
git push origin main
# Vercel auto-deploys

# Option 2: Manual deploy
cd apps/web
vercel --prod
```

### **Check Deployment Status**

**Railway**:
```bash
curl https://your-backend.railway.app/health
```

**Vercel**:
Visit: https://your-app.vercel.app

---

## 🔧 **Utility Commands**

### **Code Linting**
```bash
cd apps/backend
npm run lint

cd apps/web
npm run lint
```

### **Code Formatting**
```bash
cd apps/backend
npm run format

cd apps/web
npm run format
```

### **Type Checking**
```bash
cd apps/backend
npx tsc --noEmit

cd apps/web
npx tsc --noEmit
```

---

## 🐛 **Debug Commands**

### **Check Backend Logs** (Railway)
```bash
# Via Railway CLI
railway logs

# Or check Railway Dashboard → Deployments → Logs
```

### **Check Frontend Logs** (Vercel)
```bash
# Via Vercel CLI
vercel logs

# Or check Vercel Dashboard → Deployments → Function Logs
```

### **Check Database** (Supabase)
```sql
-- Check table row counts
SELECT 
  'stations' as table, COUNT(*) as rows FROM stations
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'slot_bookings', COUNT(*) FROM slot_bookings
UNION ALL
SELECT 'station_photos', COUNT(*) FROM station_photos
UNION ALL
SELECT 'station_reviews', COUNT(*) FROM station_reviews;

-- Check recent payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

-- Check recent bookings
SELECT * FROM slot_bookings ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 **Monitoring Commands**

### **Check API Health**
```bash
# Local
curl http://localhost:3001/health

# Production
curl https://your-backend.railway.app/health
```

### **Check Database Connection**
```bash
# Test Supabase connection
cd apps/backend
npx tsx -e "import { supabaseAdmin } from './src/db/supabase'; supabaseAdmin.from('stations').select('count').single().then(console.log)"
```

### **Check Payment Gateway**
```bash
# Test Razorpay connection
cd apps/backend
npx tsx -e "import { razorpay } from './src/services/razorpay'; razorpay.orders.create({ amount: 100, currency: 'INR' }).then(console.log)"
```

---

## 🔄 **Git Commands**

### **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add feature"
git push origin feature/your-feature-name
```

### **Merge to Main**
```bash
git checkout main
git merge feature/your-feature-name
git push origin main
```

### **Deploy Updates**
```bash
# Just push to main - auto-deploys!
git add .
git commit -m "Update features"
git push origin main
```

---

## 🧹 **Cleanup Commands**

### **Clear Node Modules**
```bash
# Backend
cd apps/backend
rm -rf node_modules
npm install

# Frontend
cd apps/web
rm -rf node_modules .next
npm install
```

### **Clear Build Caches**
```bash
cd apps/web
rm -rf .next
npm run dev
```

---

## 📱 **Production Commands**

### **Check Production Status**
```bash
# Backend health
curl https://evcharge-production.up.railway.app/health

# Frontend status
curl -I https://your-app.vercel.app

# Database stats
# Run in Supabase SQL Editor:
SELECT COUNT(*) FROM stations;
SELECT COUNT(*) FROM payments WHERE status = 'completed';
```

### **Emergency Rollback** (If needed)
```bash
# Railway: Redeploy previous version
# Go to Railway Dashboard → Deployments → Select previous → Redeploy

# Vercel: Rollback
# Go to Vercel Dashboard → Deployments → Select previous → Promote to Production
```

---

## 💡 **Useful Aliases** (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Quick start
alias evstart='cd apps/backend && npm run dev &  cd apps/web && npm run dev'

# Quick deploy
alias evdeploy='git add . && git commit -m "Deploy" && git push origin main'

# Quick test
alias evtest='cd apps/backend && npx tsx src/scripts/data-quality-check.ts'
```

---

## 🎓 **Learning Commands**

### **Explore Database Schema**
```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Describe a table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'stations';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'payments';
```

### **Test API Endpoints**
```bash
# Get stations
curl http://localhost:3001/api/stations

# Get station details
curl http://localhost:3001/api/stations/STATION_ID

# Create order (requires auth token)
curl -X POST http://localhost:3001/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"booking_id":"xxx","amount":100}'
```

---

## 🆘 **Emergency Commands**

### **If Backend Crashes**
```bash
# Check what's running on port 3001
# Windows:
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F

# Restart
cd apps/backend && npm run dev
```

### **If Frontend Breaks**
```bash
# Clear everything
cd apps/web
rm -rf .next node_modules
npm install
npm run dev
```

### **If Database Connection Fails**
```bash
# Verify env variables
cd apps/backend
cat .env | grep SUPABASE

# Test connection
npx tsx -e "console.log(process.env.SUPABASE_URL)"
```

---

## ✅ **QUICK REFERENCE**

| Task | Command |
|------|---------|
| Start backend | `cd apps/backend && npm run dev` |
| Start frontend | `cd apps/web && npm run dev` |
| Install deps | `npm install` |
| Deploy | `git push origin main` |
| Check health | `curl http://localhost:3001/health` |
| Test payment | Use test card `4111 1111 1111 1111` |
| View logs | Railway/Vercel Dashboard |

---

**Keep this handy! 📌**




