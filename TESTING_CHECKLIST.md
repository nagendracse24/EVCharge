# ✅ Payment Integration - Testing Checklist

Quick checklist to test the complete payment flow.

---

## 🔧 **PRE-TEST SETUP** (Do Once)

### 1. Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Run entire `database/migrations/011_create_payments.sql`
- [ ] Verify: Run `SELECT tablename FROM pg_tables WHERE tablename = 'payments';`
- [ ] Should return: `payments`

### 2. Razorpay Account
- [ ] Sign up at https://razorpay.com/ (free)
- [ ] Toggle to "Test Mode" (top-left)
- [ ] Go to Settings → API Keys
- [ ] Click "Generate Test Key"
- [ ] Copy `Key ID` (starts with `rzp_test_`)
- [ ] Copy `Key Secret`

### 3. Backend Environment
- [ ] Add to `apps/backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```
- [ ] Run: `cd apps/backend && npm install`

### 4. Frontend Environment
- [ ] Add to `apps/web/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 5. Start Servers
- [ ] Terminal 1: `cd apps/backend && npm run dev`
- [ ] Terminal 2: `cd apps/web && npm run dev`
- [ ] Backend running at: http://localhost:3001
- [ ] Frontend running at: http://localhost:3000

---

## 🧪 **TEST FLOW**

### Test 1: Complete Booking with Payment ✅

1. [ ] Open http://localhost:3000
2. [ ] Click "Sign In" (top-right)
3. [ ] Create account or sign in
4. [ ] Click "Select Vehicle" dropdown (top)
5. [ ] Choose any vehicle
6. [ ] Click any station card
7. [ ] Click "Book Slot" button
8. [ ] Select tomorrow's date
9. [ ] Check connector compatibility:
   - [ ] Green checkmark = Compatible ✅
   - [ ] Red warning = Incompatible ❌
10. [ ] Click a time slot
11. [ ] Click "Continue Booking"
12. [ ] **Payment screen should appear**
13. [ ] Verify shows:
    - [ ] Station name
    - [ ] Network name in blue badge
    - [ ] Duration
    - [ ] Amount to pay
14. [ ] Click "Pay Now"
15. [ ] **Razorpay checkout should open**
16. [ ] Use test card:
    - **Card Number**: `4111 1111 1111 1111`
    - **CVV**: `123`
    - **Expiry**: Any future date (e.g., `12/25`)
    - **Name**: Any name
17. [ ] Click "Pay"
18. [ ] **Success screen should appear** with "Payment Successful! 🎉"
19. [ ] Click "View Receipt"
20. [ ] Should redirect to `/payments` page
21. [ ] Verify payment appears in history

---

### Test 2: Payment History ✅

1. [ ] Click user avatar (top-right)
2. [ ] Click "💳 Payment History"
3. [ ] Should see your recent payment
4. [ ] Verify shows:
   - [ ] Green "Completed" badge
   - [ ] Correct amount
   - [ ] Station name
   - [ ] Network name
   - [ ] Payment date
5. [ ] Click "Download Receipt"
6. [ ] `.txt` file should download
7. [ ] Open file - verify details correct

---

### Test 3: Refund Request ✅

1. [ ] In Payment History page
2. [ ] Find a completed payment
3. [ ] Click "Request Refund"
4. [ ] Click "OK" in confirmation dialog
5. [ ] Should show "Refund initiated successfully!"
6. [ ] Refresh page
7. [ ] Payment status should change to "Refunded"
8. [ ] Check Razorpay Dashboard → Refunds
9. [ ] Refund should appear there

---

### Test 4: Failed Payment ❌

1. [ ] Book another slot
2. [ ] Get to payment screen
3. [ ] Click "Pay Now"
4. [ ] Use FAILED test card:
   - **Card Number**: `4000 0000 0000 0002`
   - **CVV**: `123`
   - **Expiry**: Any future date
5. [ ] Payment should fail
6. [ ] Alert should show error
7. [ ] Can retry with correct card

---

### Test 5: Navigate Feature 🗺️

1. [ ] Click any station
2. [ ] Click "Navigate" button (green)
3. [ ] Google Maps should open in new tab
4. [ ] Should show directions to station

---

### Test 6: Share Feature 📤

1. [ ] Click any station
2. [ ] Click "Share" button
3. [ ] On mobile: Native share sheet opens
4. [ ] On desktop: Location copied to clipboard
5. [ ] Paste - should have station details + map link

---

### Test 7: Compatibility Checking 🚗

1. [ ] Select vehicle: "Tata Nexon EV"
2. [ ] Click any station
3. [ ] Click "Book Slot"
4. [ ] Look at connectors:
   - [ ] CCS2 should be GREEN (compatible)
   - [ ] CHAdeMO might be RED (incompatible)
5. [ ] Click RED connector
6. [ ] Warning message should appear explaining why

---

## 🔍 **VERIFICATION**

After successful test, verify in **Supabase**:

### Check Bookings Table:
```sql
SELECT * FROM slot_bookings ORDER BY created_at DESC LIMIT 5;
```
- [ ] Your booking appears
- [ ] `payment_status` = `'completed'`
- [ ] `status` = `'confirmed'`

### Check Payments Table:
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
```
- [ ] Your payment appears
- [ ] `status` = `'completed'`
- [ ] `razorpay_payment_id` is filled
- [ ] `amount` matches

---

## 🐛 **TROUBLESHOOTING**

### "Failed to load payment gateway"
**Fix:**
- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`
- Restart frontend: `npm run dev`
- Hard refresh browser: `Ctrl + Shift + R`

### "Payment verification failed"
**Fix:**
- Check `RAZORPAY_KEY_SECRET` in backend `.env`
- Restart backend: `npm run dev`
- Check backend console for errors

### "Invalid API Key"
**Fix:**
- Ensure using TEST mode keys (start with `rzp_test_`)
- Copy keys again from Razorpay dashboard
- No extra spaces in .env file

### Payment succeeds but booking not confirmed
**Fix:**
- Run `database/migrations/011_create_payments.sql` again
- Check RLS policies exist
- Check backend logs

---

## ✅ **SUCCESS CRITERIA**

**You're ready for production when:**
- [x] Can complete full booking flow
- [x] Payment processes successfully
- [x] Success screen appears
- [x] Payment appears in history
- [x] Receipt downloads
- [x] Refund works
- [x] Navigate/Share work
- [x] Compatibility shows correctly
- [x] Data appears in Supabase tables
- [x] Payment shows in Razorpay dashboard

---

## 🚀 **NEXT: GO LIVE**

1. Complete Razorpay KYC
2. Get LIVE API keys
3. Update environment variables to live keys
4. Deploy to production
5. Test with ₹1 real transaction
6. Launch! 🎉

---

**Good luck with testing!** 💪

Need help? Check:
- `docs/PAYMENT_SETUP_GUIDE.md`
- `PAYMENT_INTEGRATION_COMPLETE.md`
- Razorpay support: https://razorpay.com/support/




