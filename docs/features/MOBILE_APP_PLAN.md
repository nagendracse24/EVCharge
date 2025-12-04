# 📱 Mobile App Architecture Plan

## **Why This Structure?**

✅ **Code Reuse**: Share 60-70% of code between Web, iOS, Android
✅ **Type Safety**: TypeScript types shared across all platforms
✅ **Single API Client**: One source of truth for API calls
✅ **Consistent UI**: Shared design system
✅ **Fast Development**: Change once, deploy everywhere (when possible)
✅ **Easy Maintenance**: Fix a bug once, it's fixed everywhere

## **Technology Stack**

### Mobile App (iOS + Android)
- **React Native + Expo** (v49+)
  - Why Expo? 
    - Over-the-air updates (fix bugs without app store approval!)
    - Easy build process
    - Built-in navigation, camera, maps, etc.
    - Free tier for building
- **Expo Router** (file-based navigation like Next.js)
- **React Native Maps** (for station maps)
- **React Query** (same as web - API caching)
- **Tailwind CSS via NativeWind** (same styling as web!)

### Shared Packages
- **@evcharge/shared**: Types, constants, utilities
- **@evcharge/api-client**: API calls (works on web + mobile)
- **@evcharge/ui**: Shared components (Button, Card, etc.)

## **Folder Structure**

```
EVTRANSIT/
├── apps/
│   ├── web/                    # Next.js web app ✅
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── mobile/                 # React Native + Expo (NEW)
│   │   ├── app/                # Expo Router screens
│   │   │   ├── (tabs)/        # Bottom tabs
│   │   │   │   ├── index.tsx  # Home/Map
│   │   │   │   ├── search.tsx # Search
│   │   │   │   └── profile.tsx# Profile
│   │   │   ├── station/[id].tsx # Station details
│   │   │   └── _layout.tsx    # Root layout
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── app.json           # Expo config
│   │   └── package.json
│   │
│   └── backend/               # Fastify API ✅
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── shared/                # Shared code (NEW)
│   │   ├── src/
│   │   │   ├── types/         # TypeScript types
│   │   │   │   ├── station.ts
│   │   │   │   ├── vehicle.ts
│   │   │   │   └── user.ts
│   │   │   ├── constants/     # App constants
│   │   │   │   ├── connectors.ts
│   │   │   │   └── networks.ts
│   │   │   └── utils/         # Utilities
│   │   │       ├── distance.ts
│   │   │       └── pricing.ts
│   │   └── package.json
│   │
│   ├── api-client/            # API layer (NEW)
│   │   ├── src/
│   │   │   ├── client.ts      # API client
│   │   │   ├── stations.ts    # Station endpoints
│   │   │   ├── vehicles.ts    # Vehicle endpoints
│   │   │   └── auth.ts        # Auth endpoints
│   │   └── package.json
│   │
│   └── ui/                    # Shared components (LATER)
│       ├── src/
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   └── Input.tsx
│       └── package.json
│
├── database/                  # Database schemas ✅
├── package.json              # Root workspace config
└── turbo.json               # Turborepo config (optional)
```

## **Development Workflow**

### 1. Start All Apps
```bash
# Root directory
npm run dev              # Start web + backend + mobile
npm run dev:web         # Just web
npm run dev:mobile      # Just mobile
npm run dev:backend     # Just backend
```

### 2. Build for Production
```bash
npm run build:web       # Build web app
npm run build:mobile    # Build iOS + Android
npm run build:backend   # Build API
```

### 3. Deploy
- **Web**: Vercel (already planned)
- **Backend**: Railway/Render (already planned)
- **Mobile**: Expo EAS Build → App Store + Google Play

## **Mobile App Features**

### Phase 1 (MVP - Week 1)
✅ Authentication (Google, Apple, Email)
✅ Map view with stations
✅ Station list with filters
✅ Station details
✅ Vehicle selector
✅ Search

### Phase 2 (Week 2)
✅ Route planning
✅ Favorites
✅ Reviews & ratings
✅ Add new stations
✅ Push notifications

### Phase 3 (Week 3)
✅ Charging history
✅ Price alerts
✅ Offline mode
✅ Dark/light theme
✅ Multi-language (Hindi, English)

## **Shared Code Example**

```typescript
// packages/shared/src/types/station.ts
export interface Station {
  id: string
  name: string
  network: string
  latitude: number
  longitude: number
  // ... works on web AND mobile!
}

// packages/api-client/src/stations.ts
export async function fetchStations(params: StationParams) {
  // Same API call logic for web AND mobile!
}
```

## **Cost Breakdown**

### Free Tier (Initially)
- ✅ Expo: FREE (build, OTA updates, up to 100 users)
- ✅ App Store: $99/year (one-time for launch)
- ✅ Google Play: $25 (one-time forever!)

### After Launch
- Expo EAS: $29/month (for unlimited builds + users)

**Total to launch iOS + Android: $124 (one-time)**
**Ongoing: $29/month (Expo) or FREE if you build locally**

## **Timeline**

### Day 1-2: Setup
- ✅ Create monorepo structure
- ✅ Set up shared packages
- ✅ Create mobile app with Expo
- ✅ Migrate types to @evcharge/shared

### Day 3-4: Core Features
- ✅ Authentication
- ✅ Map view
- ✅ Station list
- ✅ Filters

### Day 5-6: Details & Polish
- ✅ Station details
- ✅ Reviews
- ✅ Favorites
- ✅ Profile

### Day 7: Build & Deploy
- ✅ Build iOS IPA
- ✅ Build Android APK/AAB
- ✅ Submit to App Store
- ✅ Submit to Google Play

## **Why This is Better Than Separate Apps**

❌ **Old Way**: Separate codebases for Web/iOS/Android
- 3x development time
- 3x bug fixes
- 3x maintenance

✅ **Modern Way**: Shared monorepo
- Write once, run everywhere (mostly)
- Single source of truth
- Fix bugs once
- Share UI components
- Consistent user experience

## **Next Steps**

1. Run the setup script (I'll create this)
2. Migrate existing types to `packages/shared`
3. Create API client package
4. Build mobile app
5. Test on iOS + Android
6. Deploy! 🚀



