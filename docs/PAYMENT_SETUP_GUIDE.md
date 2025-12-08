do# 💳 Payment Integration Setup Guide

Complete guide to set up Razorpay payment integration for EVCharge India.

---

## 📋 **Prerequisites**

1. ✅ Supabase project set up
2. ✅ Backend running (Railway/local)
3. ✅ Frontend running (Vercel/local)
4. ⏳ Razorpay account (we'll create this)

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Razorpay Account**

1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Click **"Sign Up"**
3. Fill in details:
   - **Business Name**: EVCharge India
   - **Email**: Your email
   - **Phone**: Your phone number
4. Complete email verification
5. Submit business details (can use test mode initially)

---

### **Step 2: Get API Keys**

#### For Testing (No KYC Required):

1. Login to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. Toggle to **"Test Mode"** (top-left)
3. Go to **Settings** → **API Keys**
4. Click **"Generate Test Key"**
5. Copy both:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`

#### For Production (After KYC):

1. Complete KYC verification
2. Toggle to **"Live Mode"**
3. Generate Live API Keys
4. Copy both keys

---

### **Step 3: Set Up Database**

**Run this SQL in Supabase SQL Editor:**

```sql
-- Copy entire content from:
-- database/migrations/011_create_payments.sql

-- Then verify:
SELECT tablename FROM pg_tables WHERE tablename = 'payments';
```

You should see `payments` table created.

---

### **Step 4: Configure Backend**

#### **4a. Install Dependencies**

```bash
cd apps/backend
npm install razorpay
```

#### **4b. Set Environment Variables**

**Local Development** (`.env` file in `apps/backend`):

```env
# Add these lines:
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Railway Production**:

1. Go to Railway Dashboard
2. Select your backend project
3. Go to **Variables** tab
4. Add:
   - `RAZORPAY_KEY_ID` = `rzp_test_xxxxxxxxxxxxx` (or live key)
   - `RAZORPAY_KEY_SECRET` = `xxxxxxxxxxxxxxxxxxxxx` (or live secret)
5. Click **Deploy**

---

### **Step 5: Configure Frontend**

#### **5a. Set Environment Variables**

**Local Development** (`.env.local` file in `apps/web`):

```env
# Add this line:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Vercel Production**:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Value**: `rzp_test_xxxxxxxxxxxxx` (or live key)
   - **Environment**: Production (and Preview if needed)
5. Click **Save**
6. Redeploy from **Deployments** tab

---

### **Step 6: Test Payment Flow**

#### **6a. Local Testing**

1. **Start Backend:**
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Test Booking:**
   - Sign in to app
   - Select a station
   - Click **"Book Slot"**
   - Select date, connector, slot
   - Click **"Continue Booking"**
   - Click **"Pay Now"**
   - Use Razorpay test cards

#### **6b. Razorpay Test Cards**

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`

**UPI Test:**
- Use any UPI ID ending with `@razorpay`
- Example: `test@razorpay`

---

### **Step 7: Verify Payment Works**

✅ **Checklist:**

1. [ ] Payment modal opens with Razorpay checkout
2. [ ] Test card payment succeeds
3. [ ] Success screen shows "Payment Successful!"
4. [ ] Booking appears in Supabase `slot_bookings` table with `payment_status = 'completed'`
5. [ ] Payment appears in Supabase `payments` table with `status = 'completed'`
6. [ ] Payment shows in Razorpay Dashboard → Payments

---

### **Step 8: Go Live (When Ready)**

1. **Complete Razorpay KYC**
   - Submit business documents
   - Bank account details
   - GST details (if applicable)

2. **Switch to Live Keys**
   - Update `RAZORPAY_KEY_ID` (backend & frontend)
   - Update `RAZORPAY_KEY_SECRET` (backend only)
   - Both in Railway and Vercel

3. **Configure Webhooks** (Optional but recommended)
   - Razorpay Dashboard → Settings → Webhooks
   - URL: `https://your-backend.railway.app/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`

4. **Test with Real Card**
   - Use small amount (₹1)
   - Verify end-to-end flow

---

## 🔍 **Troubleshooting**

### **Issue: "Failed to load payment gateway"**

**Solution:**
- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in frontend
- Clear browser cache
- Reload page

### **Issue: "Payment verification failed"**

**Solution:**
- Check `RAZORPAY_KEY_SECRET` is correct in backend
- Verify order_id matches in both frontend & backend
- Check backend logs for errors

### **Issue: "Invalid API Key"**

**Solution:**
- Verify you're using **Test Mode** keys in test environment
- Verify keys are copied correctly (no extra spaces)
- Regenerate keys if needed

### **Issue: Payment succeeds but booking not confirmed**

**Solution:**
- Check Supabase RLS policies allow insert on `payments` table
- Check backend logs for database errors
- Verify `slot_bookings` table update query

---

## 📊 **Testing Checklist**

Run through this before going live:

### **Functional Tests:**

1. [ ] Book slot → Payment succeeds → Booking confirmed
2. [ ] Book slot → Payment fails → Booking not confirmed
3. [ ] Book slot → Close payment modal → Can retry
4. [ ] View payment history (after we add it)
5. [ ] Refund request works

### **Edge Cases:**

1. [ ] User closes payment mid-transaction
2. [ ] Network error during payment
3. [ ] Duplicate payment prevention
4. [ ] Concurrent bookings for same slot

### **Security:**

1. [ ] API keys not exposed in frontend code
2. [ ] Payment signature verification works
3. [ ] RLS policies prevent unauthorized access
4. [ ] Amount tampering detection

---

## 💰 **Pricing**

**Razorpay Charges:**
- **Domestic Cards**: 2% + GST
- **UPI**: 2% + GST
- **Wallets**: 2% + GST
- **Net Banking**: 2% + GST

**Example:**
- User pays: ₹100
- Razorpay fee: ₹2.36 (2% + 18% GST)
- You receive: ₹97.64

---

## 📝 **Next Steps After Setup**

1. [ ] Add payment history page
2. [ ] Add email receipts (using Resend/SendGrid)
3. [ ] Add refund functionality
4. [ ] Add webhook handling for payment status updates
5. [ ] Add analytics (track successful payments, revenue)

---

## 🆘 **Need Help?**

- **Razorpay Docs**: https://razorpay.com/docs/
- **Support**: https://razorpay.com/support/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/

---

*Happy Charging! ⚡💳*




