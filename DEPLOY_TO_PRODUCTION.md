# 🚀 Deploy to Production - Complete Guide

Deploy EVCharge India to production in 30 minutes!

---

## 📋 **Prerequisites**

- [x] Payment integration tested locally
- [x] All features working
- [x] Razorpay account ready
- [ ] Railway account (free tier OK)
- [ ] Vercel account (free tier OK)
- [ ] Supabase project (already have)

---

## 🎯 **Deployment Strategy**

```
Frontend (Vercel) ← Users access here
       ↓
Backend (Railway) ← API server
       ↓
Database (Supabase) ← Already set up
```

---

## 🔧 **Step 1: Prepare Code**

### 1a. Create Production Branch

```bash
# Merge feature/phase1 to main
git checkout main
git merge feature/phase1
git push origin main
```

### 1b. Verify Package.json

Check `apps/backend/package.json`:
```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "build": "echo 'Skipping TypeScript build'"
  }
}
```

---

## 🚂 **Step 2: Deploy Backend to Railway**

### 2a. Create Railway Project

1. Go to [railway.app](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `EVTRANSIT` repository
5. Select `main` branch

### 2b. Configure Railway

**Root Directory**:
- Leave blank (monorepo setup)

**Build Command**:
```
cd apps/backend && npm install
```

**Start Command**:
```
npm --prefix apps/backend start
```

### 2c. Add Environment Variables

In Railway Dashboard → Variables tab, add:

```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_xxxxx (or live key)
RAZORPAY_KEY_SECRET=your-secret
```

### 2d. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy the Railway URL (e.g., `https://evcharge-production.up.railway.app`)

### 2e. Test Backend

```bash
curl https://your-backend.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## ▲ **Step 3: Deploy Frontend to Vercel**

### 3a. Create Vercel Project

1. Go to [vercel.com](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `EVTRANSIT`

### 3b. Configure Vercel

**Framework Preset**: Next.js

**Root Directory**: `apps/web`

**Build Command**: 
```
npm run build
```

**Install Command**:
```
npm install
```

### 3c. Add Environment Variables

In Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**Environment**: Select "Production", "Preview", and "Development"

### 3d. Deploy

1. Click "Deploy"
2. Wait 3-5 minutes
3. Your app will be live at `https://your-app.vercel.app`

---

## 🔒 **Step 4: Update CORS (Important!)**

Your backend CORS is already configured in `apps/backend/src/index.ts`:

```typescript
origin: config.NODE_ENV === 'production' 
  ? /\.vercel\.app$/ // Allows all Vercel domains
  : true,
```

This allows your Vercel frontend to connect to Railway backend! ✅

---

## ✅ **Step 5: Test Production**

### 5a. Test Frontend

1. Visit your Vercel URL
2. Should see the app load
3. Should see stations on map

### 5b. Test Backend Connection

1. Open browser console (F12)
2. Should see no CORS errors
3. Stations should load from Railway backend

### 5c. Test Full Booking Flow

1. Sign in
2. Select vehicle
3. Book a slot
4. Complete payment with test card:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
5. Verify booking confirmed
6. Check Supabase → `payments` table
7. Check Razorpay Dashboard

---

## 💰 **Step 6: Go Live with Real Payments**

### 6a. Complete Razorpay KYC

1. Login to Razorpay Dashboard
2. Go to Settings → Account
3. Complete KYC:
   - Business documents
   - Bank account
   - GST (if applicable)
4. Wait for approval (1-2 days)

### 6b. Get Live API Keys

1. Toggle to "Live Mode"
2. Go to Settings → API Keys
3. Generate Live Keys
4. Copy both `Key ID` and `Key Secret`

### 6c. Update Environment Variables

**Railway**:
- Update `RAZORPAY_KEY_ID` to live key
- Update `RAZORPAY_KEY_SECRET` to live secret

**Vercel**:
- Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` to live key

### 6d. Redeploy

1. Railway: Should auto-deploy after variable change
2. Vercel: Redeploy from Deployments tab

### 6e. Test with Real Money

1. Book a slot
2. Pay ₹1 with your real card
3. Verify money appears in Razorpay Dashboard
4. Request refund to test that flow

---

## 🎨 **Step 7: Custom Domain (Optional)**

### For Frontend (Vercel):

1. Buy domain from Namecheap/GoDaddy
2. In Vercel → Settings → Domains
3. Add your domain (e.g., `evchargeindia.com`)
4. Update DNS records as shown
5. Wait for DNS propagation (up to 24h)

### For Backend (Railway):

1. In Railway → Settings → Domains
2. Add custom domain (e.g., `api.evchargeindia.com`)
3. Update DNS records
4. Update `NEXT_PUBLIC_API_URL` in Vercel

---

## 📊 **Step 8: Monitoring & Analytics**

### Backend Monitoring (Railway):

1. Railway Dashboard shows:
   - CPU usage
   - Memory usage
   - Request logs
   - Deployment history

### Frontend Monitoring (Vercel):

1. Vercel Dashboard shows:
   - Page views
   - Response times
   - Error rates
   - Build history

### Payment Monitoring (Razorpay):

1. Razorpay Dashboard shows:
   - Payment success rate
   - Revenue
   - Refunds
   - Failed payments

---

## 🐛 **Troubleshooting**

### Frontend Not Loading

**Issue**: Blank page or loading forever

**Fix**:
1. Check Vercel build logs for errors
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check browser console for errors
4. Ensure backend is running (test `/health`)

### CORS Errors

**Issue**: `Access to fetch blocked by CORS policy`

**Fix**:
1. Check `apps/backend/src/index.ts` CORS config
2. Verify Railway backend is deployed
3. Check Railway logs for errors
4. Restart Railway deployment

### Payments Not Working

**Issue**: Payment gateway not loading

**Fix**:
1. Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in Vercel
2. Check `RAZORPAY_KEY_SECRET` in Railway
3. Verify using TEST mode keys in test environment
4. Check Razorpay Dashboard for errors

### Database Connection Failed

**Issue**: `Failed to fetch stations`

**Fix**:
1. Check Supabase URL and keys
2. Verify RLS policies allow access
3. Check Supabase logs
4. Restart Railway backend

---

## 📝 **Post-Deployment Checklist**

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check passes
- [ ] Stations load on map
- [ ] Sign in/sign up works
- [ ] Vehicle selection works
- [ ] Booking flow completes
- [ ] Payment gateway loads
- [ ] Test payment succeeds
- [ ] Payment appears in history
- [ ] Receipt downloads
- [ ] Refund works
- [ ] Navigate button works
- [ ] Share button works
- [ ] User menu works
- [ ] All pages load without errors

---

## 🚨 **Important Notes**

1. **Test Mode First**: Always test thoroughly with test keys before going live
2. **Backup Database**: Export Supabase data before major changes
3. **Monitor Costs**: Railway/Vercel free tiers have limits
4. **Security**: Never commit API keys to Git
5. **HTTPS Only**: Production must use HTTPS (both platforms do this automatically)

---

## 💰 **Costs**

**Free Tier Limits:**

**Railway**:
- $5 free credit/month
- Good for ~500 hours/month
- ~15,000 requests/month

**Vercel**:
- 100GB bandwidth/month
- Unlimited requests
- 100 deployments/day

**Supabase**:
- 500MB database
- 1GB file storage
- 2GB bandwidth/month

**Razorpay**:
- Free to use
- 2% + GST per transaction

**Estimated Monthly Cost for <1000 users**: **$0 - $5**

---

## 🎯 **Success!**

Once all checks pass, your app is LIVE! 🎉

Share the URL:
- With friends for testing
- On social media
- In EV communities
- With potential partners

---

## 📞 **Support**

**Platform Issues:**
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs

**Payment Issues:**
- Razorpay: https://razorpay.com/support/

---

**Happy Launching! 🚀⚡**




