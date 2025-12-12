/**
 * Reviews API
 * Bidirectional review system for clients and freelancers
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { reviews, users, contracts, profiles } from '@/lib/db/schema'
import { eq, or, and, desc, sql } from 'drizzle-orm'
import { createNotification, NotificationTemplates } from '@/lib/notifications'

/**
 * GET /api/reviews?userId=123 or ?contractId=456
 * Fetch reviews for a user or contract
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')
        const contractId = searchParams.get('contractId')

        if (!userId && !contractId) {
            return NextResponse.json({ error: 'User ID or Contract ID required' }, { status: 400 })
        }

        let whereCondition
        if (contractId) {
            whereCondition = eq(reviews.contract_id, parseInt(contractId))
        } else {
            whereCondition = eq(reviews.reviewee_id, parseInt(userId!))
        }

        const userReviews = await db.query.reviews.findMany({
            where: whereCondition,
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

        // Calculate statistics
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

        return NextResponse.json({
            reviews: userReviews,
            stats,
        })

    } catch (error: any) {
        console.error('Reviews fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/reviews
 * Create a review
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const {
            contract_id,
            reviewee_id,
            rating,
            comment
        } = await req.json()

        if (!contract_id || !reviewee_id || !rating) {
            return NextResponse.json({
                error: 'Contract ID, reviewee ID, and rating required'
            }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        // Verify contract exists and user is part of it
        const contract = await db.query.contracts.findFirst({
            where: eq(contracts.id, contract_id)
        })

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        if (contract.client_id !== currentUser.id && contract.freelancer_id !== currentUser.id) {
            return NextResponse.json({ error: 'Not authorized for this contract' }, { status: 403 })
        }

        // Check if review already exists
        const existingReview = await db.query.reviews.findFirst({
            where: and(
                eq(reviews.contract_id, contract_id),
                eq(reviews.reviewer_id, currentUser.id)
            )
        })

        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this contract' }, { status: 400 })
        }

        // Create review
        const [review] = await db.insert(reviews).values({
            contract_id,
            reviewer_id: currentUser.id,
            reviewee_id,
            rating,
            comment: comment || null,
        }).returning()

        // Update reviewee's profile stats
        const allReviews = await db.query.reviews.findMany({
            where: eq(reviews.reviewee_id, reviewee_id)
        })

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

        // Update success rate (reviews 4-5 stars are "successful")
        const successfulReviews = allReviews.filter(r => r.rating >= 4).length
        const successRate = (successfulReviews / allReviews.length) * 100

        await db.execute(sql`
      UPDATE profiles 
      SET success_rate = ${successRate.toFixed(2)}
      WHERE user_id = ${reviewee_id}
    `)

        // Send notification to reviewee
        const reviewerName = currentUser.email.split('@')[0]
        await createNotification({
            userId: reviewee_id,
            ...NotificationTemplates.newReview(reviewerName, rating),
            metadata: { contractId: contract_id, reviewId: review.id },
        })

        return NextResponse.json({ review }, { status: 201 })

    } catch (error: any) {
        console.error('Review creation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create review' },
            { status: 500 }
        )
    }
}
