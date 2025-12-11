'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Job {
  id: number
  title: string
  description: string
  budget_min: string | null
  budget_max: string | null
  timeline: string | null
  required_skills: string[] | null
  status: string
  created_at: Date
  client?: {
    email: string
  }
}

interface JobDetailModalProps {
  job: Job
  onClose: () => void
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
            <p className="text-gray-400 text-sm">Posted by {job.client?.email || 'Unknown'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Budget & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Budget Range</p>
              <p className="text-white font-bold text-lg">
                ${job.budget_min || '0'} - ${job.budget_max || '0'}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Timeline</p>
              <p className="text-white font-bold text-lg">
                {job.timeline || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-600/20 border border-indigo-600/50 text-indigo-400 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status & Date */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              📅 Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'open' ? 'bg-green-500/20 text-green-400' :
              job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
