#!/bin/bash

# Setup Modern Monorepo Structure for EVTRANSIT
# This script creates the proper folder structure for Web + Mobile + Backend

echo "🚀 Setting up modern monorepo structure..."

# Create packages directory
mkdir -p packages

# Create shared package
echo "📦 Creating @evcharge/shared package..."
mkdir -p packages/shared/src/{types,constants,utils}

# Create package.json for shared package
cat > packages/shared/package.json << 'EOF'
{
  "name": "@evcharge/shared",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
EOF

# Create tsconfig for shared package
cat > packages/shared/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create index.ts for shared package
cat > packages/shared/src/index.ts << 'EOF'
// Types
export * from './types/station'
export * from './types/vehicle'
export * from './types/user'

// Constants
export * from './constants/connectors'
export * from './constants/networks'

// Utils
export * from './utils/distance'
export * from './utils/pricing'
EOF

echo "📦 Creating @evcharge/api-client package..."
mkdir -p packages/api-client/src

cat > packages/api-client/package.json << 'EOF'
{
  "name": "@evcharge/api-client",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@evcharge/shared": "*"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
EOF

cat > packages/api-client/tsconfig.json << 'EOF'
{
  "extends": "../shared/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
EOF

cat > packages/api-client/src/index.ts << 'EOF'
export * from './client'
export * from './stations'
export * from './vehicles'
export * from './auth'
EOF

echo "📱 Creating mobile app with Expo..."
npx create-expo-app@latest apps/mobile --template blank-typescript --no-install

echo "✅ Monorepo structure created!"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Migrate types from apps/web to packages/shared"
echo "3. Update imports in web and backend"
echo "4. Start building the mobile app!"
echo ""
echo "Commands:"
echo "  npm run dev           - Start all apps"
echo "  npm run dev:web       - Start web only"
echo "  npm run dev:mobile    - Start mobile only"
echo "  npm run dev:backend   - Start backend only"







