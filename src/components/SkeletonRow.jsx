import SkeletonCard from './SkeletonCard'

function SkeletonRow() {
  return (
    <div className="mb-6 px-4 md:px-8">
      <div className="h-4 w-32 md:w-48 bg-white/10 rounded mb-3 animate-pulse"></div>
      <div className="flex gap-2 overflow-x-hidden pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export default SkeletonRow
