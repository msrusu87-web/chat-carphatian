/**
 * Semantic Job Search API
 * AI-powered job search using embeddings and match scoring
 * 
 * Security:
 * - Rate limited: 60 requests per minute (search endpoints)
 * - Requires authentication
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { jobs, profiles, users, reviews } from '@/lib/db/schema'
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm'
import { withRateLimit } from '@/lib/security/rate-limit'

// Calculate cosine similarity between two vectors
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
 * POST /api/search/jobs
 * Search jobs with semantic matching
 */
export async function POST(req: NextRequest) {
    // Rate limiting - 60 requests per minute for search endpoints
    const rateLimitResponse = await withRateLimit(req, 'search')
    if (rateLimitResponse) return rateLimitResponse

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            query,
            embedding,
            budgetMin,
            budgetMax,
            skills,
            limit = 20
        } = await req.json()

        let conditions = [eq(jobs.status, 'open')]

        // Add budget filters
        if (budgetMin) {
            conditions.push(gte(jobs.budget_min, budgetMin.toString()))
        }
        if (budgetMax) {
            conditions.push(lte(jobs.budget_max, budgetMax.toString()))
        }

        // Fetch all open jobs
        const allJobs = await db.query.jobs.findMany({
            where: and(...conditions),
            with: {
                client: {
                    with: {
                        profile: true,
                    },
                },
            },
        })

        // If we have an embedding, calculate similarity scores
        let rankedJobs = allJobs

        if (embedding && Array.isArray(embedding)) {
            rankedJobs = allJobs
                .map(job => {
                    let similarityScore = 0

                    // Calculate semantic similarity if job has embedding
                    if (job.scope_embedding) {
                        try {
                            const jobEmbedding = JSON.parse(job.scope_embedding)
                            similarityScore = cosineSimilarity(embedding, jobEmbedding)
                        } catch (e) {
                            console.error('Failed to parse embedding:', e)
                        }
                    }

                    // Bonus for skill matches
                    let skillMatchScore = 0
                    if (skills && Array.isArray(skills) && job.required_skills) {
                        const matchingSkills = skills.filter((s: string) =>
                            job.required_skills?.includes(s)
                        )
                        skillMatchScore = matchingSkills.length / Math.max(skills.length, 1)
                    }

                    // Combined score (70% semantic, 30% skills)
                    const totalScore = (similarityScore * 0.7) + (skillMatchScore * 0.3)

                    return {
                        ...job,
                        matchScore: Math.round(totalScore * 100), // 0-100 percentage
                        similarityScore,
                        skillMatchScore,
                    }
                })
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit)
        } else {
            // No embedding - just return recent jobs
            rankedJobs = allJobs.slice(0, limit).map(job => ({
                ...job,
                matchScore: 0,
            }))
        }

        return NextResponse.json({
            jobs: rankedJobs,
            total: rankedJobs.length,
        })

    } catch (error: any) {
        console.error('Job search error:', error)
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        )
    }
}
