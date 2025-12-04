# 🚀 Deploy to Production - Complete Guide

**Frontend:** Vercel  
**Backend:** Render  
**Database:** Supabase (already set up!)

---

## ⚡ **Quick Deploy (15 minutes)**

### Part 1: Deploy Backend to Render (5 min)

1. **Go to:** https://dashboard.render.com

2. **Click:** "New +" → "Web Service"

3. **Connect GitHub:**
   - Connect your GitHub account
   - Select your repository

4. **Configure:**
   ```
   Name: evcharge-backend
   Region: Singapore (closest to India)
   Branch: main
   Root Directory: apps/backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   ```
   NODE_ENV=production
   API_PORT=10000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENCHARGEMAP_API_KEY=893bcfaf-0a05-4e01-9adf-e4410876b351
   ```

6. **Select Plan:** Free (or paid if you want)

7. **Click:** "Create Web Service"

8. **Copy the URL:** `https://evcharge-backend.onrender.com`

---

### Part 2: Deploy Frontend to Vercel (5 min)

1. **Go to:** https://vercel.com/new

2. **Import Git Repository:**
   - Connect GitHub
   - Select your repo
   - Click "Import"

3. **Configure:**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://evcharge-backend.onrender.com
   ```

5. **Click:** "Deploy"

6. **Your URL:** `https://evcharge-india.vercel.app`

---

### Part 3: Configure CORS (2 min)

Update `apps/backend/src/index.ts`:

```typescript
await server.register(cors, {
  origin: config.NODE_ENV === 'production'
    ? ['https://evcharge-india.vercel.app'] // Your Vercel URL
    : true,
  credentials: true,
});
```

Push to GitHub, Render will auto-redeploy!

---

### Part 4: Enable Data Sync (3 min)

Once backend is deployed, trigger initial sync:

```bash
curl -X POST https://evcharge-backend.onrender.com/api/admin/sync/all \
  -H "Content-Type: application/json" \
  -d "{}"
```

This will import all 598 stations to production!

---

## ✅ **Verification Checklist**

### Backend Health Check
```bash
curl https://evcharge-backend.onrender.com/health
```
Should return: `{"status":"ok"}`

### Frontend Check
Visit: `https://evcharge-india.vercel.app`
Should show your app!

### API Connection
Open frontend → Should load 598 stations from backend

---

## 🔧 **Post-Deployment Setup**

### 1. Custom Domain (Optional)

**Vercel:**
- Go to Project Settings → Domains
- Add: `evcharge.in` or `www.evcharge.in`
- Follow DNS instructions

**Render:**
- Go to Settings → Custom Domain
- Add: `api.evcharge.in`
- Update Vercel env: `NEXT_PUBLIC_API_URL=https://api.evcharge.in`

### 2. Enable Auto-Sync

On Render:
- Go to Settings → Cron Jobs
- Add: `0 0 * * *` (daily at midnight)
- Command: `curl -X POST http://localhost:10000/api/admin/sync/all`

Or use external cron: https://cron-job.org

### 3. Monitoring

**Render:**
- Built-in logs and metrics
- Set up alerts for downtime

**Vercel:**
- Analytics built-in
- Speed insights available

### 4. SEO Setup

Update `apps/web/src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'EVCharge India - Find Best EV Charging Stations',
  description: 'Compare prices, check compatibility, and discover 600+ EV charging stations across India.',
  metadataBase: new URL('https://evcharge-india.vercel.app'),
  openGraph: {
    title: 'EVCharge India',
    description: 'Find and compare 600+ EV charging stations',
    url: 'https://evcharge-india.vercel.app',
    siteName: 'EVCharge India',
    images: ['/og-image.png'],
  },
}
```

---

## 💰 **Cost Breakdown**

### Current (Free Tier)
- ✅ Vercel: Free (Hobby Plan)
- ✅ Render: Free ($0/month)
- ✅ Supabase: Free (2 projects)
- **Total: $0/month**

### When You Scale (1000+ users)
- Vercel: ~$20/month (Pro)
- Render: ~$7/month (Starter)
- Supabase: Free (still good!)
- **Total: ~$27/month**

---

## 🚨 **Render Free Tier Limitations**

### Important:
- **Spins down after 15 min inactivity**
- **First request takes ~30 seconds to wake up**
- **750 hours/month free** (enough for testing)

### Solutions:

**Option 1: Keep-Alive Ping (Free)**
Use UptimeRobot to ping every 14 minutes:
1. Sign up: https://uptimerobot.com
2. Add Monitor: `https://evcharge-backend.onrender.com/health`
3. Check every 5 minutes
4. Free plan works!

**Option 2: Upgrade to Paid ($7/month)**
- Always on
- No spin-down
- Better performance

**Option 3: Move to Railway ($5/month)**
- Similar to Render
- $5 credit included
- Better for India traffic

---

## 🎯 **Better Strategy? Railway!**

### Why Railway > Render:

**Railway Pros:**
- ✅ $5 free credit monthly
- ✅ No spin-down on free tier
- ✅ Better latency in Asia
- ✅ Simpler setup
- ✅ Great DX

**How to Deploy on Railway:**

1. Go to: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo → Select `apps/backend`
4. Add same environment variables
5. Done! Get URL like: `https://evcharge-backend.up.railway.app`

**Cost:** $0-5/month (depending on usage)

---

## 🏆 **My Recommended Stack**

### For MVP (Free):
- **Frontend:** Vercel (free)
- **Backend:** Railway (free $5 credit)
- **Database:** Supabase (free)
- **Monitoring:** UptimeRobot (free)

### For Production (After users):
- **Frontend:** Vercel Pro ($20/month)
- **Backend:** Railway ($7-10/month)
- **Database:** Supabase Pro ($25/month)
- **CDN:** Cloudflare (free)
- **Total:** ~$55/month

---

## 📋 **Step-by-Step Deployment**

### Choose Your Path:

#### **Path A: Vercel + Render (Original Plan)**
- Pros: Familiar, well-documented
- Cons: Render free tier spins down
- Best for: Testing, demo

#### **Path B: Vercel + Railway (Recommended!)**
- Pros: No spin-down, better performance
- Cons: Credit card required (but free credit)
- Best for: Production-ready MVP

---

## 🚀 **Want Me to Generate Deployment Files?**

I can create:
- `render.yaml` (Render config)
- `railway.json` (Railway config)
- `vercel.json` (Vercel config)
- Deployment scripts
- GitHub Actions for auto-deploy

---

## 💡 **My Recommendation**

**Start with Railway + Vercel:**

1. **Railway for backend** ($0, uses free credit)
2. **Vercel for frontend** (free)
3. **Deploy in 10 minutes**
4. **No spin-down issues**
5. **Better India latency**

**Total Cost:** $0 for first month, $5-10/month after

---

**Which do you prefer?**
1. Render (free but spins down)
2. Railway (free $5 credit, always on) ⭐ **Recommended**
3. Both (compare performance)

Let me know and I'll create the exact deployment files! 🚀

