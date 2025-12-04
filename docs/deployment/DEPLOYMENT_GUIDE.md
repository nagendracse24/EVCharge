# 🚀 Deployment Guide - Go Live in 15 Minutes!

## ✅ Prerequisites Checklist

Before deploying, make sure you have:
- ✅ Supabase project setup (done)
- ✅ 50+ stations in database (run `data/bangalore_stations_50.sql`)
- ✅ All features working locally
- ✅ GitHub repository (you already have this)

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy Backend to Railway** (5 minutes)

#### **1.1 Sign Up for Railway**
1. Go to: https://railway.app/
2. Sign up with GitHub (FREE tier: $5/month credit)

#### **1.2 Deploy Backend**
```bash
# In your project root:
cd apps/backend

# Create railway.json
echo '{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}' > railway.json
```

#### **1.3 Deploy via Railway Dashboard**
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `EVTRANSIT` repo
3. Root directory: `apps/backend`
4. Add environment variables:
   ```
   NODE_ENV=production
   API_PORT=3001
   SUPABASE_URL=https://sjycysfueahyxdflbsky.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
5. Click "Deploy"
6. Copy your backend URL (e.g., `https://evcharge-backend-production.up.railway.app`)

---

### **Step 2: Deploy Frontend to Vercel** (5 minutes)

#### **2.1 Sign Up for Vercel**
1. Go to: https://vercel.com/
2. Sign up with GitHub (FREE tier: unlimited)

#### **2.2 Deploy Frontend**
1. Click "Add New" → "Project"
2. Import your `EVTRANSIT` repo
3. Framework: Next.js (auto-detected)
4. Root Directory: `apps/web`
5. Build Command: `npm run build`
6. Output Directory: `.next`

#### **2.3 Add Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=https://sjycysfueahyxdflbsky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://evcharge-backend-production.up.railway.app
```

#### **2.4 Deploy**
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site is live! (e.g., `https://evcharge-india.vercel.app`)

---

### **Step 3: Configure Supabase Auth** (2 minutes)

#### **3.1 Add Vercel URL to Supabase**
1. Go to: https://supabase.com/dashboard
2. Your project → Authentication → URL Configuration
3. Add to "Redirect URLs":
   ```
   https://evcharge-india.vercel.app/auth/callback
   https://evcharge-india.vercel.app
   ```

#### **3.2 Enable Google OAuth (Optional)**
1. Go to: Authentication → Providers
2. Enable "Google"
3. Add Google Client ID & Secret
   - Get from: https://console.cloud.google.com/
   - OAuth 2.0 Client IDs
4. Authorized redirect URIs:
   ```
   https://sjycysfueahyxdflbsky.supabase.co/auth/v1/callback
   ```

---

### **Step 4: Test Your Live Site** (3 minutes)

1. Open your Vercel URL
2. Test features:
   - ✅ Search for stations
   - ✅ Filter by price/distance
   - ✅ Sign in with Google/Email
   - ✅ Select vehicle
   - ✅ View station details
   - ✅ Add review

---

## 🎨 Custom Domain (Optional - Later)

### **Buy Domain** (~₹500/year)
- Namecheap, GoDaddy, or Google Domains
- Example: `evcharge.in` or `evchargeindia.com`

### **Add to Vercel**
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)
4. Wait 24-48 hours for propagation

---

## 📊 Cost Breakdown (Production)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| **Vercel (Frontend)** | Unlimited | ₹0/month |
| **Railway (Backend)** | $5 credit/month | ₹0 (within free tier) |
| **Supabase** | 500MB DB, 50K users | ₹0/month |
| **Domain** | - | ₹500/year |
| **Total** | | **~₹42/month** (domain only) |

---

## 🔧 Troubleshooting

### **Backend not responding**
- Check Railway logs
- Verify environment variables
- Make sure port is 3001

### **Frontend can't reach backend**
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Make sure Railway backend is running
- Check CORS settings

### **Auth not working**
- Verify Supabase redirect URLs
- Check Google OAuth credentials
- Clear browser cache

---

## 🚀 Post-Deployment Checklist

After deployment:
- [ ] Test all features on live site
- [ ] Share URL with friends for feedback
- [ ] Monitor Railway & Vercel dashboards
- [ ] Set up Google Analytics (optional)
- [ ] Create social media posts
- [ ] Submit to product directories (Product Hunt, etc.)

---

## 📈 Monitoring & Analytics

### **Vercel Analytics** (FREE)
- Automatic page view tracking
- Performance metrics
- Enable in: Project Settings → Analytics

### **Supabase Dashboard**
- User signups
- Database usage
- API calls

### **Railway Metrics**
- Backend response times
- Error logs
- Resource usage

---

## 🎉 You're Live!

Your EV charging platform is now accessible to users across India!

**Next steps:**
1. ✅ Share with EV owner groups on Facebook/WhatsApp
2. ✅ Post on LinkedIn, Twitter
3. ✅ Collect feedback
4. ✅ Iterate based on user needs
5. ✅ Add more stations (Google Places API later)

**Your live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.up.railway.app`
- Documentation: Share GitHub repo

---

## 💡 Pro Tips

1. **Monitor Costs**: Check Railway & Vercel dashboards weekly
2. **Backup Database**: Export Supabase data monthly
3. **Update Dependencies**: Run `npm update` monthly
4. **Security**: Never commit `.env` files
5. **Performance**: Use Vercel Analytics to optimize

---

## 🆘 Need Help?

If deployment fails:
1. Check error logs in Railway/Vercel
2. Verify all environment variables
3. Test backend API directly: `https://your-backend.up.railway.app/api/health`
4. Test frontend build locally: `npm run build`

---

**Ready to deploy? Let's go! 🚀**



