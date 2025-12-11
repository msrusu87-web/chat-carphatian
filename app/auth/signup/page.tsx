'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'freelancer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      // Register user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created! Please sign in.')
        router.push('/login')
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div 
      className="flex min-h-screen"
      style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)' }}
    >
      {/* Left Panel - Branding (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)' }}
        />
        <div 
          className="absolute rounded-full"
          style={{ top: '25%', left: '25%', width: '24rem', height: '24rem', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(80px)' }}
        />
        <div 
          className="absolute rounded-full"
          style={{ bottom: '25%', right: '25%', width: '24rem', height: '24rem', background: 'rgba(147, 51, 234, 0.1)', filter: 'blur(80px)' }}
        />
        
        <div className="relative z-10 text-center" style={{ maxWidth: '28rem' }}>
          <div 
            className="flex items-center justify-center mx-auto mb-8 rounded-2xl shadow-2xl"
            style={{ width: '5rem', height: '5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)' }}
          >
            <span className="text-white font-bold text-4xl">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join Carphatian</h1>
          <p className="text-xl mb-8" style={{ color: '#d1d5db' }}>Start your freelance journey today</p>
          
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3" style={{ color: '#d1d5db' }}>
              <span className="text-2xl">🚀</span>
              <span>Launch your career in minutes</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: '#d1d5db' }}>
              <span className="text-2xl">🌍</span>
              <span>Connect with global clients</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: '#d1d5db' }}>
              <span className="text-2xl">💰</span>
              <span>Get paid securely, on time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full" style={{ maxWidth: '28rem' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div 
                className="flex items-center justify-center rounded-xl shadow-lg"
                style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)' }}
              >
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-white">Carphatian</span>
            </Link>
          </div>

          {/* Signup Card */}
          <div 
            className="rounded-2xl shadow-2xl p-6 sm:p-8"
            style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid #374151' }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p style={{ color: '#9ca3af' }}>Join our marketplace today</p>
            </div>

            {error && (
              <div 
                className="flex items-center justify-center gap-2 p-4 mb-6 rounded-xl text-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171' }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label 
                  htmlFor="name" 
                  className="text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563' }}
                />
              </div>

              <div className="flex flex-col">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563' }}
                />
              </div>

              <div className="flex flex-col">
                <label 
                  htmlFor="role" 
                  className="text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  I want to...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563' }}
                >
                  <option value="client">Hire Freelancers (Client)</option>
                  <option value="freelancer">Work as Freelancer</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563' }}
                />
              </div>

              <div className="flex flex-col">
                <label 
                  htmlFor="confirmPassword" 
                  className="text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium transition-colors hover:underline"
                  style={{ color: '#60a5fa' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p 
            className="mt-6 text-center text-xs"
            style={{ color: '#6b7280' }}
          >
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>

          <p 
            className="mt-4 text-center text-sm"
            style={{ color: '#4b5563' }}
          >
            Built by Carphatian
          </p>
        </div>
      </div>
    </div>
  )
}
