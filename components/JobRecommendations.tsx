/**
 * Job Recommendations Component
 * AI-powered job matching for freelancers
 * Built by Carphatian
 */

'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface MatchedJob {
    id: number
    title: string
    description: string
    budget_min: number | null
    budget_max: number | null
    required_skills: string[]
    created_at: string
    client: {
        profile: {
            full_name: string | null
            company_name: string | null
        } | null
    }
    matchScore: number
    matchedSkills?: string[]
}

interface JobRecommendationsProps {
    limit?: number
}

export default function JobRecommendations({ limit = 5 }: JobRecommendationsProps) {
    const [jobs, setJobs] = useState<MatchedJob[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchRecommendations()
    }, [])

    const fetchRecommendations = async () => {
        try {
            // First, get user profile to generate embedding
            const profileRes = await fetch('/api/profile')
            const profile = await profileRes.json()

            if (!profile.bio && !profile.skills?.length) {
                setError('Complete your profile to see personalized recommendations')
                setLoading(false)
                return
            }

            // Generate profile embedding
            const profileText = [
                profile.bio,
                profile.title,
                profile.skills?.join(', '),
                profile.experience_years ? `${profile.experience_years} years experience` : '',
            ]
                .filter(Boolean)
                .join('. ')

            const embedRes = await fetch('/api/ai/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: profileText }),
            })

            const { embedding } = await embedRes.json()

            // Search for matching jobs
            const searchRes = await fetch('/api/search/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embedding,
                    skills: profile.skills || [],
                    limit,
                }),
            })

            const data = await searchRes.json()
            setJobs(data.jobs || [])
        } catch (err: any) {
            console.error('Failed to fetch recommendations:', err)
            setError('Failed to load recommendations')
        } finally {
            setLoading(false)
        }
    }

    const formatBudget = (min: number | null, max: number | null) => {
        if (!min && !max) return 'Budget not specified'
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
        if (min) return `From $${min.toLocaleString()}`
        return `Up to $${max?.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Jobs</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Jobs</h2>
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">💡</div>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        )
    }

    if (jobs.length === 0) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recommended Jobs</h2>
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">No matching jobs found right now</p>
                    <p className="text-sm text-gray-500 mt-1">Check back soon for new opportunities</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Recommended Jobs</h2>
                <Link
                    href="/jobs"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                    View All Jobs →
                </Link>
            </div>

            <div className="space-y-4">
                {jobs.map((job) => (
                    <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-purple-500 transition-all group"
                    >
                        {/* Match Score Badge */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors line-clamp-1">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {job.client.profile?.company_name ||
                                        job.client.profile?.full_name ||
                                        'Company'}
                                </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                                <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
                                    <span className="text-sm font-bold text-white">
                                        {Math.round(job.matchScore)}% Match
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{job.description}</p>

                        {/* Skills */}
                        {job.matchedSkills && job.matchedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {job.matchedSkills.slice(0, 4).map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-md border border-green-700"
                                    >
                                        ✓ {skill}
                                    </span>
                                ))}
                                {job.required_skills.length > job.matchedSkills.length && (
                                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                                        +{job.required_skills.length - job.matchedSkills.length} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
