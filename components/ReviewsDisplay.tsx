/**
 * Review Display Component
 * Show reviews with star ratings and stats
 * Built by Carphatian
 */

'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Review {
    id: number
    rating: number
    comment: string | null
    created_at: string
    reviewer: {
        id: number
        email: string
        profile: {
            full_name: string | null
            avatar_url: string | null
        } | null
    }
    contract: {
        job: {
            title: string
        }
    }
}

interface ReviewStats {
    total: number
    average: number
    breakdown: {
        5: number
        4: number
        3: number
        2: number
        1: number
    }
}

interface ReviewsDisplayProps {
    userId: number
}

export default function ReviewsDisplay({ userId }: ReviewsDisplayProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [userId])

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?userId=${userId}`)
            const data = await res.json()
            setReviews(data.reviews || [])
            setStats(data.stats || null)
        } catch (error) {
            console.error('Failed to fetch reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const StarRating = ({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6',
        }

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!stats || stats.total === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <p className="text-gray-400 mb-2">No reviews yet</p>
                <p className="text-sm text-gray-500">Reviews will appear here after completed contracts</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl font-bold text-white">{stats.average.toFixed(1)}</span>
                            <StarRating rating={Math.round(stats.average)} size="lg" />
                        </div>
                        <p className="text-gray-400">{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.breakdown[rating as keyof typeof stats.breakdown]
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0

                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-12">{rating} star{rating !== 1 ? 's' : ''}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-yellow-400 h-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {review.reviewer.profile?.full_name?.[0] || review.reviewer.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">
                                        {review.reviewer.profile?.full_name || review.reviewer.email}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} />
                        </div>

                        {review.comment && (
                            <p className="text-gray-300 mb-3">{review.comment}</p>
                        )}

                        <div className="text-sm text-gray-500">
                            Project: <span className="text-gray-400">{review.contract.job.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
