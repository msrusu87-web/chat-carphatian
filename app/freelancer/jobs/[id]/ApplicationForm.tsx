/**
 * Application Form Component
 * Submit job application with cover letter and proposed rate
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApplicationFormProps {
  jobId: number
  freelancerId: number
}

export default function ApplicationForm({ jobId, freelancerId }: ApplicationFormProps) {
  const router = useRouter()
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coverLetter.trim()) {
      setError('Cover letter is required')
      return
    }

    if (!proposedRate || parseFloat(proposedRate) <= 0) {
      setError('Please enter a valid proposed rate')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          freelancer_id: freelancerId,
          cover_letter: coverLetter.trim(),
          proposed_rate: parseFloat(proposedRate),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Refresh the page to show success state
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Apply for this Position</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-300 mb-2">
            Cover Letter *
          </label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Explain why you're a great fit for this job, highlight relevant experience, and what makes you stand out..."
            disabled={submitting}
          />
          <p className="text-xs text-gray-400 mt-1">
            Tip: Mention specific skills and past projects that align with this job
          </p>
        </div>

        {/* Proposed Rate */}
        <div>
          <label htmlFor="proposedRate" className="block text-sm font-medium text-gray-300 mb-2">
            Proposed Rate (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              id="proposedRate"
              type="number"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              min="1"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your proposed rate"
              disabled={submitting}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your total proposed rate for this project
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                📨 Submit Application
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Pro Tip:</strong> Applications with personalized cover letters and competitive rates are 3x more likely to be accepted!
        </p>
      </div>
    </div>
  )
}
