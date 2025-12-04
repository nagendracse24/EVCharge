export function StationCardSkeleton() {
  return (
    <div className="card-ultra p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
        <div className="h-6 w-20 bg-white/10 rounded-lg" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-white/10 rounded-lg" />
        <div className="h-6 w-12 bg-white/10 rounded-lg" />
      </div>
      <div className="flex justify-between pt-3 border-t border-white/5">
        <div className="h-8 bg-white/10 rounded w-20" />
        <div className="h-8 bg-white/10 rounded w-16" />
      </div>
    </div>
  )
}

export function StationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <StationCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StationDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-3/4" />
      <div className="h-4 bg-white/10 rounded w-1/2" />
      <div className="space-y-3">
        <div className="h-20 bg-white/10 rounded" />
        <div className="h-20 bg-white/10 rounded" />
        <div className="h-20 bg-white/10 rounded" />
      </div>
    </div>
  )
}

export function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="text-center">
        <div className="loading-ultra mx-auto mb-4" />
        <div className="text-gradient text-xl font-bold">Loading map...</div>
        <div className="text-sm text-gray-400 mt-2">Please wait</div>
      </div>
    </div>
  )
}



