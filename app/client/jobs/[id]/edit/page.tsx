/**
 * Edit Job Page
 * AI-assisted job editing with status management
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Job {
  id: number
  title: string
  description: string
  budget_min: string | null
  budget_max: string | null
  timeline: string | null
  required_skills: string[]
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditJobPage({ params }: PageProps) {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  
  const [jobId, setJobId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Job data
  const [job, setJob] = useState<Job | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [timeline, setTimeline] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [jobStatus, setJobStatus] = useState<'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'>('draft')

  // AI regeneration
  const [regenerating, setRegenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)

  // Unwrap params
  useEffect(() => {
    params.then(p => setJobId(p.id))
  }, [params])

  // Load job data
  useEffect(() => {
    if (!jobId) return
    
    const loadJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error('Failed to load job')
        }
        const data = await response.json()
        setJob(data)
        setTitle(data.title)
        setDescription(data.description)
        setBudgetMin(data.budget_min || '')
        setBudgetMax(data.budget_max || '')
        setTimeline(data.timeline || '')
        setSkills(data.required_skills || [])
        setJobStatus(data.status)
      } catch (err: any) {
        setError(err.message || 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [jobId])

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  // Remove skill
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  // Regenerate with AI
  const regenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      setError('Please provide instructions for AI regeneration')
      return
    }

    setRegenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ai/job-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          existingJob: {
            title,
            description,
            skills,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate job description')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update fields with AI-generated content
      setTitle(data.title)
      setDescription(
        `${data.description}\n\n## Responsibilities\n${data.responsibilities.map((r: string) => `- ${r}`).join('\n')}\n\n## Requirements\n${data.requirements.map((r: string) => `- ${r}`).join('\n')}\n\n## Nice to Have\n${data.nice_to_have.map((n: string) => `- ${n}`).join('\n')}`
      )
      setSkills([...new Set([...skills, ...data.requirements.slice(0, 5)])])
      setShowAiPanel(false)
      setAiPrompt('')
      setSuccessMessage('✨ AI regeneration successful!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate with AI')
    } finally {
      setRegenerating(false)
    }
  }

  // Save changes
  const saveChanges = async () => {
    if (!title || !description) {
      setError('Please fill in title and description')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
          budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
          timeline,
          required_skills: skills,
          status: jobStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update job')
      }

      setSuccessMessage('✅ Job updated successfully!')
      setTimeout(() => {
        router.push(`/client/jobs/${jobId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update job')
    } finally {
      setSaving(false)
    }
  }

  // Archive job (cancel status)
  const archiveJob = async () => {
    if (!confirm('Are you sure you want to archive this job? This will cancel it.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to archive job')
      }

      router.push('/client/jobs')
    } catch (err: any) {
      setError(err.message || 'Failed to archive job')
      setSaving(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Job not found</h1>
          <Link href="/client/jobs" className="text-purple-400 hover:text-purple-300">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const statusOptions = [
    { value: 'draft', label: '📝 Draft', color: 'gray' },
    { value: 'open', label: '🟢 Open', color: 'green' },
    { value: 'in_progress', label: '🔵 In Progress', color: 'blue' },
    { value: 'completed', label: '✅ Completed', color: 'emerald' },
    { value: 'cancelled', label: '❌ Cancelled', color: 'red' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href={`/client/jobs/${jobId}`} className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
          ← Back to Job
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Job</h1>
            <p className="text-gray-400 mt-1">Update job details or use AI to regenerate content</p>
          </div>
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
          >
            ✨ AI Assist
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400">
            {successMessage}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* AI Regeneration Panel */}
      {showAiPanel && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-purple-500/10 border border-purple-500/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">🤖 AI Job Enhancement</h3>
            <p className="text-gray-400 text-sm mb-4">
              Describe how you want to improve or modify the job description
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: Make it more appealing to senior developers, add emphasis on remote work benefits, expand on technical requirements..."
              className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={regenerateWithAI}
                disabled={regenerating || !aiPrompt.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {regenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Regenerating...
                  </>
                ) : (
                  <>✨ Regenerate with AI</>
                )}
              </button>
              <button
                onClick={() => setShowAiPanel(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-64 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-white font-semibold mb-2">Budget Min</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 pl-8 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Budget Max</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 pl-8 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Timeline</label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g., 2-3 months, 6 weeks, etc."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={addSkill}
                className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">Job Status</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setJobStatus(option.value as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    jobStatus === option.value
                      ? `border-${option.color}-500 bg-${option.color}-500/20 text-white`
                      : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={saveChanges}
              disabled={saving || !title || !description}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Changes</>
              )}
            </button>
            <button
              onClick={archiveJob}
              disabled={saving}
              className="px-6 py-4 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
