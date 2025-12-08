export function SpinnerSmall() {
  return (
    <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )
}

export function SpinnerMedium() {
  return (
    <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  )
}

export function SpinnerLarge() {
  return (
    <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <SpinnerLarge />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {/* Header */}
          <div className="h-16 bg-gray-800 rounded-xl"></div>
          
          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-4">
              <div className="h-64 bg-gray-800 rounded-xl"></div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <SkeletonList count={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <SpinnerSmall />
      <span>{text}</span>
    </div>
  )
}




