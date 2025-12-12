'use client'

interface ReviewCardProps {
  review: {
    id: number
    rating: number
    comment: string | null
    created_at: string
    reviewer?: {
      id: number
      email: string
      profile?: {
        full_name: string | null
      }
    }
    contract?: {
      id: number
      job?: {
        title: string
      }
    }
  }
  showJob?: boolean
  compact?: boolean
}

export default function ReviewCard({ review, showJob = true, compact = false }: ReviewCardProps) {
  const reviewerName = review.reviewer?.profile?.full_name || review.reviewer?.email || 'Anonymous'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-xl ${compact ? 'p-4' : 'p-5'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold">
              {reviewerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-medium">{reviewerName}</div>
            <div className="text-xs text-gray-500">{formatDate(review.created_at)}</div>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Job Reference */}
      {showJob && review.contract?.job && (
        <div className="mb-3 text-sm">
          <span className="text-gray-500">Project: </span>
          <span className="text-purple-400">{review.contract.job.title}</span>
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <p className={`text-gray-300 ${compact ? 'text-sm' : ''}`}>{review.comment}</p>
      )}

      {/* No comment placeholder */}
      {!review.comment && (
        <p className="text-gray-500 italic text-sm">No written review provided</p>
      )}
    </div>
  )
}
