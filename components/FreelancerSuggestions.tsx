/**
 * Freelancer Suggestions Component
 * AI-powered freelancer matching for job posts
 * Built by Carphatian
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MatchedFreelancer {
    id: number
    email: string
    profile: {
        full_name: string | null
        avatar_url: string | null
        bio: string | null
        title: string | null
        skills: string[]
        hourly_rate: number | null
        experience_years: number | null
        success_rate: number | null
    }
    matchScore: number
    factors: {
        semanticScore: number
        skillsScore: number
        reviewScore: number
        successScore: number
        responseScore: number
        budgetScore: number
    }
    avgRating: number
    totalReviews: number
}

interface FreelancerSuggestionsProps {
    jobId: number
    jobDescription: string
    requiredSkills: string[]
    budgetMin?: number
    budgetMax?: number
    limit?: number
}

export default function FreelancerSuggestions({
    jobId,
    jobDescription,
    requiredSkills,
    budgetMin,
    budgetMax,
    limit = 10,
}: FreelancerSuggestionsProps) {
    const [freelancers, setFreelancers] = useState<MatchedFreelancer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchSuggestions()
    }, [jobId])

    const fetchSuggestions = async () => {
        try {
            // Generate job embedding
            const embedRes = await fetch('/api/ai/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: jobDescription }),
            })

            const { embedding } = await embedRes.json()

            // Search for matching freelancers
            const searchRes = await fetch('/api/search/freelancers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embedding,
                    requiredSkills,
                    budgetMin,
                    budgetMax,
                    limit,
                }),
            })

            const data = await searchRes.json()
            setFreelancers(data.freelancers || [])
        } catch (err: any) {
            console.error('Failed to fetch suggestions:', err)
            setError('Failed to load freelancer suggestions')
        } finally {
            setLoading(false)
        }
    }

    const StarRating = ({ rating }: { rating: number }) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'
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

    const MatchFactors = ({ factors }: { factors: MatchedFreelancer['factors'] }) => {
        const factorList = [
            { name: 'Skills', score: factors.skillsScore, weight: 25 },
            { name: 'Reviews', score: factors.reviewScore, weight: 20 },
            { name: 'Success Rate', score: factors.successScore, weight: 10 },
        ]

        return (
            <div className="space-y-1">
                {factorList.map((factor) => (
                    <div key={factor.name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-24">{factor.name}:</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-purple-500 h-full transition-all"
                                style={{ width: `${factor.score * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">
                            {Math.round(factor.score * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Freelancers</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Freelancers</h2>
                <div className="text-center py-8">
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        )
    }

    if (freelancers.length === 0) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Freelancers</h2>
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-gray-400">No matching freelancers found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
                Top Matched Freelancers ({freelancers.length})
            </h2>

            <div className="space-y-4">
                {freelancers.map((freelancer) => (
                    <div
                        key={freelancer.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-5 hover:border-purple-500 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {freelancer.profile.avatar_url ? (
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={freelancer.profile.avatar_url}
                                            alt={freelancer.profile.full_name || 'Avatar'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                        {freelancer.profile.full_name?.[0] || freelancer.email[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            {freelancer.profile.full_name || freelancer.email}
                                        </h3>
                                        {freelancer.profile.title && (
                                            <p className="text-sm text-gray-400">{freelancer.profile.title}</p>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-shrink-0">
                                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
                                            <span className="text-sm font-bold text-white">
                                                {Math.round(freelancer.matchScore)}% Match
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                {freelancer.profile.bio && (
                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                        {freelancer.profile.bio}
                                    </p>
                                )}

                                {/* Stats Row */}
                                <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                    {freelancer.avgRating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <StarRating rating={freelancer.avgRating} />
                                            <span className="text-gray-400 ml-1">
                                                {freelancer.avgRating.toFixed(1)} ({freelancer.totalReviews})
                                            </span>
                                        </div>
                                    )}
                                    {freelancer.profile.hourly_rate && (
                                        <div className="text-gray-400">
                                            <span className="text-white font-semibold">
                                                ${freelancer.profile.hourly_rate}
                                            </span>
                                            /hr
                                        </div>
                                    )}
                                    {freelancer.profile.experience_years && (
                                        <div className="text-gray-400">
                                            {freelancer.profile.experience_years} years exp.
                                        </div>
                                    )}
                                    {freelancer.profile.success_rate !== null && (
                                        <div className="text-gray-400">
                                            <span className="text-green-400">
                                                {Math.round(freelancer.profile.success_rate)}%
                                            </span>{' '}
                                            success rate
                                        </div>
                                    )}
                                </div>

                                {/* Skills */}
                                {freelancer.profile.skills && freelancer.profile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {freelancer.profile.skills.slice(0, 5).map((skill, idx) => {
                                            const isMatched = requiredSkills.some(
                                                (rs) => rs.toLowerCase() === skill.toLowerCase()
                                            )
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`px-2 py-1 text-xs rounded-md ${isMatched
                                                            ? 'bg-green-900/30 text-green-300 border border-green-700'
                                                            : 'bg-purple-900/30 text-purple-300'
                                                        }`}
                                                >
                                                    {isMatched && '✓ '}
                                                    {skill}
                                                </span>
                                            )
                                        })}
                                        {freelancer.profile.skills.length > 5 && (
                                            <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                                                +{freelancer.profile.skills.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Match Factors */}
                                <details className="mb-3">
                                    <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                                        Why this match?
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                                        <MatchFactors factors={freelancer.factors} />
                                    </div>
                                </details>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/profile/${freelancer.id}`}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            // TODO: Implement invite to apply
                                            alert('Invite feature coming soon!')
                                        }}
                                        className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Invite to Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
