/**
 * AI-Powered Job Creator
 * Uses GPT-4 to generate professional job descriptions
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JobDraft {
  title: string
  description: string
  requirements: string[]
  nice_to_have: string[]
  responsibilities: string[]
}

export default function CreateJobPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Form state
  const [step, setStep] = useState<'input' | 'generating' | 'preview' | 'saving'>('input')
  const [prompt, setPrompt] = useState('')
  const [jobDraft, setJobDraft] = useState<JobDraft | null>(null)
  const [error, setError] = useState('')
  
  // Final job form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('development')
  const [budget, setBudget] = useState('')
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  const categories = [
    { value: 'development', label: '💻 Development' },
    { value: 'design', label: '🎨 Design' },
    { value: 'marketing', label: '📈 Marketing' },
    { value: 'writing', label: '✍️ Writing' },
    { value: 'video', label: '🎬 Video & Animation' },
    { value: 'data', label: '📊 Data Science' },
    { value: 'ai', label: '🤖 AI & Machine Learning' },
    { value: 'other', label: '📦 Other' },
  ]

  // Generate job with AI
  const generateJob = async () => {
    if (!prompt.trim()) {
      setError('Please describe the job you want to create')
      return
    }

    setError('')
    setStep('generating')

    try {
      const response = await fetch('/api/ai/job-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          category: category,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate job description')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setJobDraft(data)
      setTitle(data.title)
      setDescription(
        `${data.description}\n\n## Responsibilities\n${data.responsibilities.map((r: string) => `- ${r}`).join('\n')}\n\n## Requirements\n${data.requirements.map((r: string) => `- ${r}`).join('\n')}\n\n## Nice to Have\n${data.nice_to_have.map((n: string) => `- ${n}`).join('\n')}`
      )
      setSkills(data.requirements.slice(0, 5))
      setStep('preview')
    } catch (err: any) {
      setError(err.message || 'Failed to generate job')
      setStep('input')
    }
  }

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

  // Submit job
  const submitJob = async () => {
    if (!title || !description || !budget) {
      setError('Please fill in all required fields')
      return
    }

    setStep('saving')
    setError('')

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          budget: parseFloat(budget),
          budgetType,
          skills,
          status: 'open',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create job')
      }

      const job = await response.json()
      router.push(`/client/jobs/${job.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create job')
      setStep('preview')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/client" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4">Create New Job</h1>
        <p className="text-gray-400 mt-1">Use AI to generate professional job descriptions</p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step === 'input' ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'input' ? 'bg-purple-500 text-white' : step === 'generating' || step === 'preview' || step === 'saving' ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
              {step === 'input' ? '1' : '✓'}
            </div>
            <span>Describe</span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-gray-700">
            <div className={`h-full transition-all ${step !== 'input' ? 'bg-purple-500 w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 'generating' ? 'text-purple-400' : step === 'preview' || step === 'saving' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'generating' ? 'bg-purple-500 text-white animate-pulse' : step === 'preview' || step === 'saving' ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
              {step === 'generating' ? '⚡' : step === 'preview' || step === 'saving' ? '✓' : '2'}
            </div>
            <span>AI Generate</span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-gray-700">
            <div className={`h-full transition-all ${step === 'preview' || step === 'saving' ? 'bg-purple-500 w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-purple-400' : step === 'saving' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-purple-500 text-white' : step === 'saving' ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
              {step === 'saving' ? '✓' : '3'}
            </div>
            <span>Review & Post</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      category === cat.value
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Describe your job <span className="text-purple-400">(AI will enhance it)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: I need a React developer to build an e-commerce dashboard with real-time analytics, user management, and payment integration. The project should take about 2-3 months..."
                className="w-full h-48 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                💡 Tip: Include project scope, timeline, and any specific requirements
              </p>
            </div>

            <button
              onClick={generateJob}
              disabled={!prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>✨</span> Generate with AI
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setTitle('')
                setDescription('')
                setStep('preview')
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Or write manually without AI →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">AI is crafting your job post...</h2>
            <p className="text-gray-400">Using GPT-4 to generate a professional description</p>
            <div className="mt-8 flex justify-center gap-2">
              <span className="animate-pulse">🤖</span>
              <span className="animate-pulse delay-100">📝</span>
              <span className="animate-pulse delay-200">✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Edit */}
      {(step === 'preview' || step === 'saving') && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior React Developer for E-commerce Platform"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full job description with requirements, responsibilities, etc."
                className="w-full h-64 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
              />
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">Budget *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 pl-8 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Budget Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBudgetType('fixed')}
                    className={`flex-1 py-4 rounded-xl border transition-all ${
                      budgetType === 'fixed'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    💰 Fixed Price
                  </button>
                  <button
                    onClick={() => setBudgetType('hourly')}
                    className={`flex-1 py-4 rounded-xl border transition-all ${
                      budgetType === 'hourly'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    ⏰ Hourly
                  </button>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-8">
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

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                disabled={step === 'saving'}
              >
                ← Back
              </button>
              <button
                onClick={submitJob}
                disabled={step === 'saving' || !title || !description || !budget}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {step === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>🚀 Publish Job</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
