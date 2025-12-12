'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import debounce from 'lodash.debounce'

interface Freelancer {
  id: number
  email: string
  profile?: {
    full_name: string | null
    title: string | null
    bio: string | null
    avatar_url: string | null
    location: string | null
    hourly_rate: string | null
    skills: string[] | null
    total_jobs_completed: number
    success_rate: string | null
  }
  matchScore?: number
  avgRating?: number
  totalReviews?: number
  factors?: {
    skillsMatch?: number
    semanticMatch?: number
    reviewScore?: number
  }
}

export default function FreelancerSearch() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [maxRate, setMaxRate] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'rate' | 'match' | 'jobs'>('rating')
  const [showFilters, setShowFilters] = useState(false)

  const popularSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL',
    'Next.js', 'Tailwind', 'Vue.js', 'Angular', 'Django'
  ]

  const fetchFreelancers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search/freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredSkills: selectedSkills.length > 0 ? selectedSkills : undefined,
          budgetMax: maxRate ? parseFloat(maxRate) : undefined,
          limit: 50,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        let results = data.freelancers || []

        // Apply sorting
        if (sortBy === 'rating') {
          results = results.sort((a: Freelancer, b: Freelancer) => 
            (b.avgRating || 0) - (a.avgRating || 0)
          )
        } else if (sortBy === 'rate') {
          results = results.sort((a: Freelancer, b: Freelancer) => 
            parseFloat(a.profile?.hourly_rate || '999') - parseFloat(b.profile?.hourly_rate || '999')
          )
        } else if (sortBy === 'jobs') {
          results = results.sort((a: Freelancer, b: Freelancer) => 
            (b.profile?.total_jobs_completed || 0) - (a.profile?.total_jobs_completed || 0)
          )
        } else if (sortBy === 'match') {
          results = results.sort((a: Freelancer, b: Freelancer) => 
            (b.matchScore || 0) - (a.matchScore || 0)
          )
        }

        setFreelancers(results)
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedSkills, maxRate, sortBy])

  useEffect(() => {
    fetchFreelancers()
  }, [selectedSkills, maxRate, sortBy])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSkills([])
    setMaxRate('')
    setSortBy('rating')
  }

  // Filter by search query (client-side)
  const filteredFreelancers = freelancers.filter(f => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      f.profile?.full_name?.toLowerCase().includes(query) ||
      f.profile?.title?.toLowerCase().includes(query) ||
      f.profile?.bio?.toLowerCase().includes(query) ||
      f.profile?.skills?.some(s => s.toLowerCase().includes(query))
    )
  })

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search freelancers by name, title, or skills..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters || selectedSkills.length || maxRate
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎛️ Filters {(selectedSkills.length > 0 || maxRate) && 
              `(${selectedSkills.length + (maxRate ? 1 : 0)})`
            }
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="match">Best Match</option>
            <option value="rate">Lowest Rate</option>
            <option value="jobs">Most Experienced</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
            {/* Max Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Max Hourly Rate</label>
              <div className="relative w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  placeholder="Any rate"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 pl-7 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/hr</span>
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {(selectedSkills.length > 0 || maxRate) && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          {loading ? 'Searching...' : `${filteredFreelancers.length} freelancers found`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">👥</span>
          <h3 className="text-xl font-bold text-white mb-2">No Freelancers Found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {freelancer.profile?.avatar_url ? (
                    <img
                      src={freelancer.profile.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {(freelancer.profile?.full_name || freelancer.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                    {freelancer.profile?.full_name || freelancer.email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {freelancer.profile?.title || 'Freelancer'}
                  </p>
                  {freelancer.profile?.location && (
                    <p className="text-xs text-gray-500">📍 {freelancer.profile.location}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                {freelancer.avgRating && freelancer.avgRating > 0 ? (
                  <span className="text-yellow-400">
                    ⭐ {freelancer.avgRating.toFixed(1)} ({freelancer.totalReviews})
                  </span>
                ) : (
                  <span className="text-gray-500">New</span>
                )}
                {freelancer.profile?.hourly_rate && (
                  <span className="text-green-400 font-semibold">
                    ${freelancer.profile.hourly_rate}/hr
                  </span>
                )}
              </div>

              {/* Skills */}
              {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {freelancer.profile.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-0.5 text-xs rounded ${
                        selectedSkills.includes(skill)
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.profile.skills.length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-400">
                      +{freelancer.profile.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Match Score */}
              {freelancer.matchScore !== undefined && freelancer.matchScore > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Match Score</span>
                    <span className="text-purple-400">{freelancer.matchScore}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${freelancer.matchScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action */}
              <Link
                href={`/users/${freelancer.id}/reviews`}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
