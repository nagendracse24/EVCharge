# ✅ EVCharge India - Master Launch Checklist

**Complete checklist for testing and launching your EV charging platform**

---

## 📋 **PRE-LAUNCH SETUP**

### **Database Migrations** (10 mins)

Run these in **Supabase SQL Editor** (in order):

- [ ] `database/migrations/011_create_payments.sql`
- [ ] `database/migrations/012_user_photos_and_reviews.sql`
- [ ] `database/migrations/013_setup_storage.sql`

**Verify**: Run `SELECT tablename FROM pg_tables WHERE tablename IN ('payments', 'station_photos', 'station_reviews');`  
**Should return**: 3 tables

---

### **Razorpay Setup** (10 mins)

- [ ] Sign up at https://razorpay.com/
- [ ] Toggle to "Test Mode"
- [ ] Generate Test API Keys
- [ ] Copy `Key ID` (starts with `rzp_test_`)
- [ ] Copy `Key Secret`
- [ ] Save keys securely

---

### **Environment Variables** (5 mins)

**Backend** (`apps/backend/.env`):
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`

**Frontend** (`apps/web/.env.local`):
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`

---

### **Dependencies** (5 mins)

```bash
cd apps/backend && npm install
cd ../web && npm install
```

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] No errors in installation

---

## 🧪 **FEATURE TESTING**

### **Core Features**

- [ ] **Station List** - Loads with map view
- [ ] **Search** - Find stations by name/location
- [ ] **Filters** - DC Fast, Connector Type, Network
- [ ] **Vehicle Selection** - Dropdown works, text visible
- [ ] **Favorites** - Add/remove stations
- [ ] **User Menu** - Profile, Payment History, Sign Out

---

### **Booking Flow**

- [ ] Sign in works
- [ ] Select station → Detail panel opens
- [ ] Network badge shows prominently
- [ ] Click "Book Slot"
- [ ] Select date (next 7 days)
- [ ] Connector compatibility shows (green/red)
- [ ] Compatible connector auto-selected
- [ ] Select time slot
- [ ] Estimated cost calculated
- [ ] Click "Continue Booking"
- [ ] Booking created in database

---

### **Payment Flow** 💳

- [ ] Payment screen appears
- [ ] Shows station name, network, amount
- [ ] Click "Pay Now"
- [ ] Razorpay checkout opens
- [ ] Use test card: `4111 1111 1111 1111`
- [ ] Payment processes successfully
- [ ] Success screen shows "Payment Successful!"
- [ ] Click "View Receipt"
- [ ] Redirects to `/payments` page
- [ ] Payment appears in history
- [ ] Download receipt works
- [ ] Request refund works

---

### **Photos & Reviews** 📸

- [ ] Click station → Scroll to Photos section
- [ ] Click "Add Photo" (if signed in)
- [ ] Upload image (< 5MB)
- [ ] Photo appears in gallery
- [ ] Click photo → Opens lightbox
- [ ] Click "Add Review"
- [ ] Rate 1-5 stars
- [ ] Add detailed ratings (cleanliness, reliability, value)
- [ ] Write comment
- [ ] Submit review
- [ ] Review appears in list
- [ ] Vote "Helpful" on other reviews
- [ ] Verified badge shows (if booked)

---

### **Aether-Inspired Features** ⚡

- [ ] Navigate button → Opens Google Maps
- [ ] Share button → Copies/shares location
- [ ] Charger speed filters work
- [ ] Grouped stations show properly
- [ ] Hover over station → Tooltip shows networks
- [ ] Network selection in expanded view
- [ ] Compatibility warnings display

---

## 🚀 **DEPLOYMENT**

### **Backend to Railway**

- [ ] Create Railway account
- [ ] New Project → Deploy from GitHub
- [ ] Configure build command
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test `/health` endpoint
- [ ] Copy Railway URL

---

### **Frontend to Vercel**

- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Set root directory: `apps/web`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test live URL
- [ ] Verify stations load

---

### **Production Verification**

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check passes
- [ ] No CORS errors in console
- [ ] Stations load from Railway API
- [ ] Sign in/sign up works
- [ ] Booking flow completes
- [ ] Payment test succeeds
- [ ] Photos upload works
- [ ] Reviews post successfully

---

## 💰 **GO LIVE WITH REAL PAYMENTS**

### **Razorpay KYC** (1-2 days)

- [ ] Login to Razorpay
- [ ] Submit business documents
- [ ] Add bank account
- [ ] Add GST details (if applicable)
- [ ] Wait for approval

### **Switch to Live Keys**

- [ ] Get Live API Keys from Razorpay
- [ ] Update Railway env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- [ ] Update Vercel env: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- [ ] Redeploy both services
- [ ] Test with ₹1 real transaction
- [ ] Verify money in Razorpay Dashboard

---

## 📊 **POST-LAUNCH MONITORING**

### **Day 1**

- [ ] Monitor Railway logs for errors
- [ ] Check Vercel analytics for traffic
- [ ] Test all features on live site
- [ ] Share with 10 friends
- [ ] Collect feedback

### **Week 1**

- [ ] Check payment success rate (Razorpay)
- [ ] Review user feedback
- [ ] Fix any critical bugs
- [ ] Add more stations if needed
- [ ] Monitor database usage (Supabase)

### **Week 2**

- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Add missing station data
- [ ] Improve UX based on feedback
- [ ] Start marketing

---

## 🎯 **SUCCESS CRITERIA**

**You're ready to launch when:**

✅ All database migrations run successfully  
✅ All environment variables configured  
✅ Dependencies installed without errors  
✅ Backend health check passes  
✅ Frontend loads with stations  
✅ Payment test completes successfully  
✅ Photos upload successfully  
✅ Reviews post successfully  
✅ No errors in browser console  
✅ All buttons and features work  

---

## 🐛 **COMMON ISSUES & FIXES**

### "Cannot find module 'razorpay'"
→ Run: `cd apps/backend && npm install`

### "Payment gateway not loading"
→ Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in frontend env

### "CORS error"
→ Restart backend, verify Railway URL in frontend env

### "Stations not loading"
→ Check backend logs, verify Supabase connection

### "White text on white background"
→ Already fixed! Clear browser cache

---

## 📞 **SUPPORT**

**Quick fixes**: Search this checklist ↑

**Detailed guides**:
- Testing: `TESTING_CHECKLIST.md`
- Deployment: `DEPLOY_TO_PRODUCTION.md`
- Payment: `PAYMENT_SETUP_GUIDE.md`
- Environment: `ENV_TEMPLATE.md`

**Platform support**:
- Razorpay: https://razorpay.com/support/
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs

---

## 🎉 **CONGRATULATIONS!**

You've built a complete, production-ready EV charging platform!

**Now GO LAUNCH IT!** 🚀⚡

---

*Last updated: December 6, 2024*  
*Status: 100% Complete*

