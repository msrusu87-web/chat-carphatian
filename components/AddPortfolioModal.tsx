/**
 * Add Portfolio Modal Component
 * Form to add new portfolio items
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface AddPortfolioModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function AddPortfolioModal({ onClose, onSuccess }: AddPortfolioModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tech_stack: '',
        image_url: '',
        project_url: '',
        completion_date: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Please enter a project title')
            return
        }

        setSubmitting(true)

        try {
            const tech_stack = formData.tech_stack
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)

            const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim() || null,
                    tech_stack,
                    image_url: formData.image_url.trim() || null,
                    project_url: formData.project_url.trim() || null,
                    completion_date: formData.completion_date || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add portfolio item')
            }

            toast.success('Portfolio item added successfully!')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to add portfolio item')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Add Portfolio Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="E-commerce Platform Redesign"
                            maxLength={200}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the project, your role, challenges solved, and outcomes..."
                            rows={4}
                            maxLength={1000}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/1000 characters
                        </p>
                    </div>

                    {/* Tech Stack */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tech Stack
                        </label>
                        <input
                            type="text"
                            value={formData.tech_stack}
                            onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                            placeholder="React, Next.js, TypeScript, Tailwind CSS (comma-separated)"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate technologies with commas
                        </p>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Project Image URL
                        </label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/project-screenshot.png"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Add a screenshot or preview image
                        </p>
                    </div>

                    {/* Project URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Live Project URL
                        </label>
                        <input
                            type="url"
                            value={formData.project_url}
                            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                            placeholder="https://example.com or https://github.com/username/repo"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Link to live site or repository
                        </p>
                    </div>

                    {/* Completion Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Completion Date
                        </label>
                        <input
                            type="date"
                            value={formData.completion_date}
                            onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? 'Adding...' : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
