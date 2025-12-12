'use client'

import { useState, useEffect } from 'react'
import ReviewModal from './ReviewModal'
import ReviewCard from './ReviewCard'
import Link from 'next/link'

interface ContractReviewSectionProps {
  contractId: number
  contractStatus: string
  isClient: boolean
  otherParty: {
    id: number
    name: string
    role: 'client' | 'freelancer'
  }
  currentUserId: number
}

export default function ContractReviewSection({
  contractId,
  contractStatus,
  isClient,
  otherParty,
  currentUserId,
}: ContractReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?contractId=${contractId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        
        // Check if current user has already reviewed
        const userReview = (data.reviews || []).find(
          (r: any) => r.reviewer?.id === currentUserId
        )
        setHasReviewed(!!userReview)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [contractId])

  const canReview = contractStatus === 'completed' && !hasReviewed

  // Find each party's review
  const myReview = reviews.find((r) => r.reviewer?.id === currentUserId)
  const theirReview = reviews.find((r) => r.reviewer?.id === otherParty.id)

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Reviews</h3>
        {canReview && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            Leave Review
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p className="text-gray-400">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          {contractStatus !== 'completed' ? (
            <>
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-gray-400">Reviews available after contract completion</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-400">No reviews yet</p>
              {canReview && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-500 transition-colors"
                >
                  Be the first to review
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Your review */}
          {myReview && (
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">Your Review</div>
              <ReviewCard review={myReview} showJob={false} compact />
            </div>
          )}

          {/* Their review */}
          {theirReview && (
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">
                {otherParty.name}&apos;s Review
              </div>
              <ReviewCard review={theirReview} showJob={false} compact />
            </div>
          )}

          {/* Pending reviews status */}
          {contractStatus === 'completed' && reviews.length < 2 && (
            <div className="text-center pt-4 border-t border-gray-700">
              {!myReview && !hasReviewed && (
                <p className="text-gray-400 text-sm">
                  You haven&apos;t left a review yet.{' '}
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Leave one now
                  </button>
                </p>
              )}
              {myReview && !theirReview && (
                <p className="text-gray-500 text-sm">
                  Waiting for {otherParty.name}&apos;s review...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* View all reviews links */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-center gap-4">
        <Link
          href={`/users/${otherParty.id}/reviews`}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          View all {otherParty.name}&apos;s reviews →
        </Link>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contractId={contractId}
        revieweeId={otherParty.id}
        revieweeName={otherParty.name}
        onSuccess={fetchReviews}
      />
    </div>
  )
}
