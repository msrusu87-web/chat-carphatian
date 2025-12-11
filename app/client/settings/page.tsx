/**
 * Client Settings Page
 * Account and profile settings
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientSettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [bio, setBio] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [applicationAlerts, setApplicationAlerts] = useState(true)
  const [messageAlerts, setMessageAlerts] = useState(true)

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any
      setName(user.name || '')
      setEmail(user.email || '')
      setCompany(user.company || '')
      setBio(user.bio || '')
    }
  }, [session])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, bio }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update session
      await update({ name })
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold text-white mt-4">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-gray-700/30 border border-gray-600 rounded-xl p-3 text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name (optional)"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell freelancers about you or your company..."
                rows={4}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-500 text-sm">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Application Alerts</p>
                <p className="text-gray-500 text-sm">Get notified when freelancers apply</p>
              </div>
              <input
                type="checkbox"
                checked={applicationAlerts}
                onChange={(e) => setApplicationAlerts(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Message Alerts</p>
                <p className="text-gray-500 text-sm">Get notified for new messages</p>
              </div>
              <input
                type="checkbox"
                checked={messageAlerts}
                onChange={(e) => setMessageAlerts(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Security</h2>
          
          <div className="space-y-4">
            <button className="w-full p-4 border border-gray-600 rounded-xl text-left hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-gray-500 text-sm">Update your account password</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </button>

            <button className="w-full p-4 border border-gray-600 rounded-xl text-left hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-gray-500 text-sm">Add an extra layer of security</p>
                </div>
                <span className="text-yellow-400 text-sm">Not enabled</span>
              </div>
            </button>

            <button className="w-full p-4 border border-gray-600 rounded-xl text-left hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Active Sessions</p>
                  <p className="text-gray-500 text-sm">Manage your logged in devices</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Billing & Payments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Current Plan</p>
              <p className="text-white font-bold text-lg">Free Tier</p>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Account Balance</p>
              <p className="text-green-400 font-bold text-lg">$0.00</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
              Upgrade Plan
            </button>
            <button className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
              Payment Methods
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 border border-red-900/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-6 py-3 border border-red-600 text-red-400 rounded-xl hover:bg-red-600/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
