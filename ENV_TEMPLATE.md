# Environment Variables Template

## Backend (.env in apps/backend)

```env
# Server
NODE_ENV=development
PORT=3001

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay (REQUIRED for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key

# Redis (OPTIONAL)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# APIs (OPTIONAL)
GOOGLE_PLACES_API_KEY=
OPENCHARGEMAP_API_KEY=
```

## Frontend (.env.local in apps/web)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (REQUIRED for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Google Maps (OPTIONAL)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Production (Railway for Backend)

Add these variables in Railway Dashboard:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Production (Vercel for Frontend)

Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL` = Your Railway backend URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`




