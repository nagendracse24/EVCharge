/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@evcharge/shared'],
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'supabase.co',
      'evcharge.supabase.co',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              if (!module.context) return 'lib'
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
              if (!match || !match[1]) return 'lib'
              const packageName = match[1]
              return `lib.${packageName.replace('@', '')}`
            },
            priority: 10,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig






