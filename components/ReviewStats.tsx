'use client'

interface ReviewStatsProps {
  stats: {
    total: number
    average: number
    breakdown: Record<number, number>
  }
  compact?: boolean
}

export default function ReviewStats({ stats, compact = false }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(stats.breakdown), 1)

  if (stats.total === 0) {
    return (
      <div className={`text-center ${compact ? 'py-4' : 'py-8'}`}>
        <div className="text-gray-400">No reviews yet</div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'flex items-center gap-4' : 'flex flex-col md:flex-row gap-6'}`}>
      {/* Average Score */}
      <div className={`${compact ? '' : 'text-center md:pr-6 md:border-r border-gray-700'}`}>
        <div className={`font-bold text-white ${compact ? 'text-3xl' : 'text-5xl'}`}>
          {stats.average.toFixed(1)}
        </div>
        <div className="flex items-center justify-center gap-1 my-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${compact ? 'text-sm' : 'text-lg'} ${
                star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-gray-400 text-sm">
          {stats.total} review{stats.total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Breakdown */}
      {!compact && (
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.breakdown[rating] || 0
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-8 text-sm text-gray-400 text-right">{rating} ★</div>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-gray-500">{count}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
