/**
 * User Reviews Page
 * View all reviews for a user
 * Built by Carphatian
 */

import { db } from '@/lib/db'
import { reviews, users, profiles, contracts, jobs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReviewCard from '@/components/ReviewCard'
import ReviewStats from '@/components/ReviewStats'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserReviewsPage({ params }: PageProps) {
  const { id } = await params
  const userId = parseInt(id)

  if (isNaN(userId)) {
    notFound()
  }

  // Get user with profile
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Get all reviews for this user
  const userReviews = await db.query.reviews.findMany({
    where: eq(reviews.reviewee_id, userId),
    with: {
      reviewer: {
        with: {
          profile: true,
        },
      },
      contract: {
        with: {
          job: true,
        },
      },
    },
    orderBy: [desc(reviews.created_at)],
  })

  // Calculate stats
  const stats = {
    total: userReviews.length,
    average: userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0,
    breakdown: {
      5: userReviews.filter(r => r.rating === 5).length,
      4: userReviews.filter(r => r.rating === 4).length,
      3: userReviews.filter(r => r.rating === 3).length,
      2: userReviews.filter(r => r.rating === 2).length,
      1: userReviews.filter(r => r.rating === 1).length,
    },
  }

  const displayName = user.profile?.full_name || user.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2"
          >
            ← Back
          </Link>

          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <p className="text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Review Summary</h2>
          <ReviewStats stats={stats} />
        </div>

        {/* Reviews List */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">
            All Reviews ({stats.total})
          </h2>

          {userReviews.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <ReviewCard key={review.id} review={review as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
