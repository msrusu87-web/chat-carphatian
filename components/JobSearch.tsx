'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import debounce from 'lodash.debounce'

interface Job {
  id: number
  title: string
  description: string
  budget_min: string
  budget_max: string
  timeline: string | null
  required_skills: string[] | null
  created_at: string
  client?: {
    email: string
  }
  matchScore?: number
}

interface JobSearchProps {
  userId: number
  applicationStatusMap: Map<number, string>
}

export default function JobSearch({ userId, applicationStatusMap }: JobSearchProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'budget' | 'match'>('recent')
  const [showFilters, setShowFilters] = useState(false)

  // Popular skills for filter suggestions
  const popularSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL',
    'Next.js', 'Tailwind', 'Vue.js', 'Angular', 'Django'
  ]

  const fetchJobs = useCallback(async (query?: string) => {
    setLoading(true)
    try {
      // For semantic search, we'd need an embedding API
      // For now, use basic filtering
      const params = new URLSearchParams()
      if (budgetMin) params.append('budgetMin', budgetMin)
      if (budgetMax) params.append('budgetMax', budgetMax)
      if (selectedSkills.length) params.append('skills', selectedSkills.join(','))
      if (query) params.append('query', query)

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        let jobsList = data.jobs || []

        // Sort jobs
        if (sortBy === 'budget') {
          jobsList = jobsList.sort((a: Job, b: Job) => 
            parseFloat(b.budget_max || '0') - parseFloat(a.budget_max || '0')
          )
        } else if (sortBy === 'match' && jobsList[0]?.matchScore !== undefined) {
          jobsList = jobsList.sort((a: Job, b: Job) => 
            (b.matchScore || 0) - (a.matchScore || 0)
          )
        } else {
          jobsList = jobsList.sort((a: Job, b: Job) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }

        setJobs(jobsList)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [budgetMin, budgetMax, selectedSkills, sortBy])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchJobs(query)
    }, 500),
    [fetchJobs]
  )

  useEffect(() => {
    fetchJobs()
  }, [budgetMin, budgetMax, selectedSkills, sortBy])

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    }
  }, [searchQuery, debouncedSearch])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setBudgetMin('')
    setBudgetMax('')
    setSelectedSkills([])
    setSortBy('recent')
  }

  const getStatusBadge = (jobId: number) => {
    const status = applicationStatusMap.get(jobId)
    if (!status) return null

    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      accepted: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
      withdrawn: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    }

    const labels: Record<string, string> = {
      pending: '⏳ Applied',
      accepted: '✅ Accepted',
      rejected: '❌ Rejected',
      withdrawn: '🚫 Withdrawn',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

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
              placeholder="Search jobs by title, description, or skills..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters || selectedSkills.length || budgetMin || budgetMax
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎛️ Filters {(selectedSkills.length > 0 || budgetMin || budgetMax) && 
              `(${selectedSkills.length + (budgetMin ? 1 : 0) + (budgetMax ? 1 : 0)})`
            }
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="recent">Most Recent</option>
            <option value="budget">Highest Budget</option>
            <option value="match">Best Match</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Budget Range</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="Min"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 pl-7 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <span className="text-gray-500 self-center">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 pl-7 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Required Skills</label>
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

            {/* Clear Filters */}
            {(selectedSkills.length > 0 || budgetMin || budgetMax) && (
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

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          {loading ? 'Searching...' : `${jobs.length} jobs found`}
        </p>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
          <p className="text-gray-400">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {job.title}
                    </h3>
                    {job.matchScore !== undefined && job.matchScore > 0 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {job.matchScore}% match
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Posted by {job.client?.email || 'Unknown'} • {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(job.id) || (
                    <Link
                      href={`/freelancer/jobs/${job.id}`}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all whitespace-nowrap"
                    >
                      View & Apply
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-green-400 font-semibold">
                  💰 ${parseFloat(job.budget_min || '0').toLocaleString()} - ${parseFloat(job.budget_max || '0').toLocaleString()}
                </span>
                {job.timeline && <span className="text-gray-400">⏱️ {job.timeline}</span>}
              </div>

              {/* Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.required_skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedSkills.includes(skill)
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {job.required_skills.length > 6 && (
                    <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-400">
                      +{job.required_skills.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
