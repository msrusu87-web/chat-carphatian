/**
 * Review Form Component
 * Create reviews with star ratings
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
    contractId: number
    revieweeId: number
    revieweeName: string
    onSuccess?: () => void
}

export default function ReviewForm({ contractId, revieweeId, revieweeName, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_id: contractId,
                    reviewee_id: revieweeId,
                    rating,
                    comment: comment.trim() || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review')
            }

            toast.success('Review submitted successfully!')
            setRating(0)
            setComment('')
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
                Review {revieweeName}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating *
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <svg
                                    className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-600'
                                        } transition-colors`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-gray-400 mt-2">
                            {rating === 5 && '⭐ Excellent!'}
                            {rating === 4 && '👍 Good'}
                            {rating === 3 && '👌 Average'}
                            {rating === 2 && '👎 Below Average'}
                            {rating === 1 && '😞 Poor'}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Comment (Optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        placeholder="Share your experience working together..."
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {comment.length}/1000 characters
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    )
}
