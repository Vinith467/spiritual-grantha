function SkeletonCard() {
  return (
    <div className="min-w-[120px] max-w-[120px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 animate-pulse">
      <div className="rounded-md aspect-[2/3] bg-white/5 mb-1 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="h-3 w-3/4 bg-white/5 rounded mt-2"></div>
      <div className="h-3 w-1/2 bg-white/5 rounded mt-1"></div>
    </div>
  )
}

export default SkeletonCard
