# 🚀 DEPLOY NOW - Quick Start

**Time: 15 minutes total**

---

## ⚡ **Option 1: Railway + Vercel (RECOMMENDED)**

### Step 1: Deploy Backend to Railway (5 min)

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Connect GitHub → Select your repo
4. Click "Add variables" and add:
   ```
   NODE_ENV=production
   SUPABASE_URL=your_url_here
   SUPABASE_ANON_KEY=your_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   OPENCHARGEMAP_API_KEY=893bcfaf-0a05-4e01-9adf-e4410876b351
   ```
5. Click "Deploy"
6. Copy your URL: `https://evcharge-backend.up.railway.app`

### Step 2: Deploy Frontend to Vercel (5 min)

1. Go to: https://vercel.com/new
2. Import your GitHub repo
3. **Root Directory:** `apps/web`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   NEXT_PUBLIC_API_URL=https://evcharge-backend.up.railway.app
   ```
5. Click "Deploy"
6. Done! Visit your app: `https://evcharge-india.vercel.app`

### Step 3: Update CORS (2 min)

In `apps/backend/src/index.ts`, update:
```typescript
origin: config.NODE_ENV === 'production'
  ? ['https://evcharge-india.vercel.app'] // Replace with your actual Vercel URL
  : true,
```

Commit and push → Railway auto-deploys!

### Step 4: Sync Data (3 min)

```bash
curl -X POST https://evcharge-backend.up.railway.app/api/admin/sync/openchargemap \
  -H "Content-Type: application/json" \
  -d "{}"
```

---

## ✅ **Verify It Works**

1. **Backend Health:**
   ```
   https://evcharge-backend.up.railway.app/health
   ```
   Should show: `{"status":"ok"}`

2. **Frontend:**
   ```
   https://evcharge-india.vercel.app
   ```
   Should load your app with 598 stations!

---

## 📊 **Your URLs**

After deployment, you'll have:

```
Frontend: https://evcharge-india.vercel.app
Backend:  https://evcharge-backend.up.railway.app
API:      https://evcharge-backend.up.railway.app/api
Health:   https://evcharge-backend.up.railway.app/health
Stats:    https://evcharge-backend.up.railway.app/api/admin/stats
```

---

## 🎯 **Next Steps After Deploy**

1. **Test everything** - Browse stations, search, filters
2. **Share with friends** - Get feedback!
3. **Monitor:** Check Railway + Vercel dashboards
4. **Optional:** Set up custom domain

---

## 💰 **Cost**

- **Railway:** Free (uses $5 credit)
- **Vercel:** Free forever
- **Total:** $0/month until you scale!

---

## 🚨 **Troubleshooting**

### Backend not responding?
- Check Railway logs
- Verify environment variables are set
- Make sure port is 10000 (or use Railway's PORT env var)

### Frontend can't connect to backend?
- Check `NEXT_PUBLIC_API_URL` is correct
- Check CORS is configured
- Try backend health endpoint directly

### No stations showing?
- Run the sync command again
- Check backend logs on Railway
- Verify Supabase connection

---

**Ready? Let's deploy! Pick Railway + Vercel and follow the steps above! 🚀**

