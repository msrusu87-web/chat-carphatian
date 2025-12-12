/**
 * Notification Preferences Page
 * Allows users to manage their email notification settings
 * Built by Carphatian
 */
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Bell, Mail, MessageSquare, DollarSign, Star, Megaphone, Loader2 } from 'lucide-react'

interface EmailPreferences {
  applications: boolean
  messages: boolean
  payments: boolean
  reviews: boolean
  marketing: boolean
}

const defaultPreferences: EmailPreferences = {
  applications: true,
  messages: true,
  payments: true,
  reviews: true,
  marketing: false,
}

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [preferences, setPreferences] = useState<EmailPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchPreferences()
    }
  }, [status, router])

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile?.email_preferences) {
          setPreferences({ ...defaultPreferences, ...data.profile.email_preferences })
        }
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_preferences: preferences }),
      })

      if (res.ok) {
        toast.success('Notification preferences saved!')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  function togglePreference(key: keyof EmailPreferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const notificationOptions = [
    {
      key: 'applications' as const,
      icon: Mail,
      title: 'Job Applications',
      description: 'Get notified when freelancers apply to your jobs or when your application status changes',
    },
    {
      key: 'messages' as const,
      icon: MessageSquare,
      title: 'Messages',
      description: 'Receive email notifications for new messages from clients or freelancers',
    },
    {
      key: 'payments' as const,
      icon: DollarSign,
      title: 'Payments & Milestones',
      description: 'Get notified about payment releases, milestone submissions, and escrow updates',
    },
    {
      key: 'reviews' as const,
      icon: Star,
      title: 'Reviews',
      description: 'Receive reminders to leave reviews after completing projects',
    },
    {
      key: 'marketing' as const,
      icon: Megaphone,
      title: 'Platform Updates',
      description: 'Occasional updates about new features, tips, and platform announcements',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold text-white">Notification Settings</h1>
          </div>
          <p className="text-gray-400">
            Choose which email notifications you want to receive. We&apos;ll always send important
            account-related emails.
          </p>
        </div>

        {/* Notification Options */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {notificationOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <div
                key={option.key}
                className={`flex items-center justify-between p-6 ${
                  index < notificationOptions.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{option.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => togglePreference(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences[option.key] ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[option.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2">About Email Notifications</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Essential account and security emails will always be sent</li>
            <li>• You can unsubscribe from any email by clicking the link at the bottom</li>
            <li>• Changes may take a few minutes to take effect</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
