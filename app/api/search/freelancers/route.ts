/**
 * Freelancer Matching API
 * Find best freelancers for a job using AI + multi-factor scoring
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, profiles, reviews } from '@/lib/db/schema'
import { eq, sql, and, avg } from 'drizzle-orm'

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * POST /api/search/freelancers
 * Match freelancers to job requirements
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            jobEmbedding,
            requiredSkills,
            budgetMax,
            limit = 20
        } = await req.json()

        // Fetch all freelancer profiles
        const freelancers = await db.query.users.findMany({
            where: eq(users.role, 'freelancer'),
            with: {
                profile: true,
            },
        })

        // Calculate match scores
        const scoredFreelancers = await Promise.all(
            freelancers.map(async (freelancer) => {
                if (!freelancer.profile) {
                    return { ...freelancer, matchScore: 0, factors: {} }
                }

                const profile = freelancer.profile
                let totalScore = 0
                let avgRating = 0
                let totalReviews = 0
                const factors: any = {}

                // 1. Semantic Similarity (35% weight)
                let semanticScore = 0
                if (jobEmbedding && profile.profile_embedding) {
                    try {
                        const profileEmbedding = JSON.parse(profile.profile_embedding)
                        semanticScore = cosineSimilarity(jobEmbedding, profileEmbedding)
                    } catch (e) {
                        console.error('Embedding parse error:', e)
                    }
                }
                factors.semanticMatch = Math.round(semanticScore * 100)
                totalScore += semanticScore * 35

                // 2. Skills Match (25% weight)
                let skillsScore = 0
                if (requiredSkills && Array.isArray(requiredSkills) && profile.skills) {
                    const matchingSkills = requiredSkills.filter((skill: string) =>
                        profile.skills?.some((s: string) =>
                            s.toLowerCase().includes(skill.toLowerCase()) ||
                            skill.toLowerCase().includes(s.toLowerCase())
                        )
                    )
                    skillsScore = matchingSkills.length / Math.max(requiredSkills.length, 1)
                    factors.skillsMatched = matchingSkills.length
                    factors.skillsRequired = requiredSkills.length
                }
                factors.skillsMatch = Math.round(skillsScore * 100)
                totalScore += skillsScore * 25

                // 3. Reviews & Rating (20% weight)
                let reviewScore = 0

                // Fetch reviews for this freelancer
                const freelancerReviews = await db.query.reviews.findMany({
                    where: eq(reviews.reviewee_id, freelancer.id),
                })

                if (freelancerReviews.length > 0) {
                    avgRating = freelancerReviews.reduce((sum, r) => sum + r.rating, 0) / freelancerReviews.length
                    reviewScore = avgRating / 5 // Normalize to 0-1
                    totalReviews = freelancerReviews.length
                    factors.averageRating = avgRating.toFixed(1)
                    factors.totalReviews = totalReviews
                } else {
                    factors.averageRating = 'New'
                    factors.totalReviews = 0
                }
                factors.reviewScore = Math.round(reviewScore * 100)
                totalScore += reviewScore * 20

                // 4. Success Rate (10% weight)
                const successRate = parseFloat(profile.success_rate || '0') / 100
                factors.successRate = profile.success_rate || '0'
                totalScore += successRate * 10

                // 5. Response Time (5% weight)
                let responseScore = 0
                if (profile.average_response_time) {
                    // Lower is better - 1 hour = 100%, 24 hours = 50%, 48+ hours = 0%
                    responseScore = Math.max(0, 1 - (profile.average_response_time / 48))
                    factors.avgResponseHours = profile.average_response_time
                }
                factors.responseScore = Math.round(responseScore * 100)
                totalScore += responseScore * 5

                // 6. Budget Compatibility (5% weight)
                let budgetScore = 0
                if (budgetMax && profile.hourly_rate) {
                    const rate = parseFloat(profile.hourly_rate)
                    if (rate <= budgetMax) {
                        budgetScore = 1
                    } else {
                        budgetScore = Math.max(0, 1 - ((rate - budgetMax) / budgetMax))
                    }
                    factors.hourlyRate = profile.hourly_rate
                }
                factors.budgetScore = Math.round(budgetScore * 100)
                totalScore += budgetScore * 5

                return {
                    id: freelancer.id,
                    email: freelancer.email,
                    profile: {
                        full_name: profile.full_name,
                        title: profile.title,
                        bio: profile.bio,
                        avatar_url: profile.avatar_url,
                        location: profile.location,
                        hourly_rate: profile.hourly_rate,
                        skills: profile.skills,
                        total_jobs_completed: profile.total_jobs_completed,
                        success_rate: profile.success_rate,
                    },
                    matchScore: Math.round(totalScore),
                    factors,
                    avgRating,
                    totalReviews,
                }
            })
        )

        // Sort by match score and limit results
        const topMatches = scoredFreelancers
            .filter(f => f.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit)

        return NextResponse.json({
            freelancers: topMatches,
            total: topMatches.length,
        })

    } catch (error: any) {
        console.error('Freelancer matching error:', error)
        return NextResponse.json(
            { error: error.message || 'Matching failed' },
            { status: 500 }
        )
    }
}
