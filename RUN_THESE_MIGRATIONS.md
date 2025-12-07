# 🗄️ DATABASE SETUP - Run These Migrations

**IMPORTANT**: Run these in **Supabase SQL Editor** in order!

---

## **Migration 1: Photos & Reviews** (Required for photos/reviews to work)

**File**: `database/migrations/012_user_photos_and_reviews.sql`

**What to do:**
1. Open file
2. Copy ENTIRE contents
3. Paste in Supabase SQL Editor
4. Click "Run"
5. Should see: "Success"

**Creates:**
- `station_photos` table
- `station_reviews` table
- `review_votes` table

---

## **Migration 2: Reports System** (Required for price/availability reports)

**File**: `database/migrations/014_user_reports_tables.sql`

**What to do:**
1. Open file in your project
2. Copy contents
3. Paste in Supabase SQL Editor  
4. Click "Run"

**Creates:**
- `user_price_reports` table
- `user_availability_reports` table
- `report_votes` table

---

## **Migration 3: Advanced Features** (Required for analytics/rewards)

**File**: `database/migrations/015_advanced_features.sql`

**What to do:**
1. Open file
2. Copy contents
3. Paste in Supabase SQL Editor
4. Click "Run"

**Creates:**
- `charging_history` table
- `user_rewards` table
- `rewards_transactions` table
- `trip_plans` table
- `user_notifications` table
- `price_alerts` table

---

## **Migration 4: Storage Setup** (Required for photo uploads)

**File**: `database/migrations/013_setup_storage.sql`

**What to do:**
1. Open file
2. Copy contents
3. Paste in Supabase SQL Editor
4. Click "Run"

**Creates:**
- `station-photos` storage bucket
- Storage policies

---

## **✅ VERIFICATION**

After running ALL migrations, run this to verify:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'station_photos', 
  'station_reviews', 
  'review_votes',
  'user_price_reports',
  'user_availability_reports',
  'charging_history',
  'user_rewards',
  'rewards_transactions',
  'trip_plans',
  'user_notifications',
  'price_alerts'
)
ORDER BY tablename;
```

**Should return 11 tables!**

---

## **Common Errors & Fixes**

### **Error: "relation already exists"**
→ Table already created, skip that part or run with `IF NOT EXISTS`

### **Error: "policy already exists"**
→ Add `DROP POLICY IF EXISTS` before creating policies

### **Error: "column does not exist"**
→ Run `ALTER TABLE ADD COLUMN IF NOT EXISTS` first

---

## **Quick Copy-Paste Order:**

1. ✅ Open `database/migrations/012_user_photos_and_reviews.sql` → Run
2. ✅ Open `database/migrations/013_setup_storage.sql` → Run
3. ✅ Open `database/migrations/014_user_reports_tables.sql` → Run
4. ✅ Open `database/migrations/015_advanced_features.sql` → Run

**Total Time**: 5 minutes

---

## **After Migrations:**

1. **Restart backend**: `npm run dev` in `apps/backend`
2. **Refresh frontend**: Browser at http://localhost:3000
3. **Test**:
   - Photos upload ✅
   - Reviews post ✅
   - Analytics load ✅
   - Rewards show ✅

---

**Ready! Just run the 4 migrations and you're done!** 🚀

