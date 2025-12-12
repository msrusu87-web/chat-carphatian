/**
 * Privacy Settings Page
 * GDPR compliance - data export, deletion, cookie preferences
 * Built by Carphatian
 */
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Shield,
  Download,
  Trash2,
  Cookie,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-react'

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState('')
  const [deletionPreview, setDeletionPreview] = useState<Record<string, number> | null>(null)

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/gdpr/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `carphatian-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Your data has been exported!')
    } catch (error) {
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePreviewDeletion = async () => {
    try {
      const response = await fetch('/api/gdpr/delete')
      if (!response.ok) throw new Error('Preview failed')

      const data = await response.json()
      setDeletionPreview(data.recordsToDelete)
      setShowDeleteConfirm(true)
    } catch (error) {
      toast.error('Failed to load deletion preview')
    }
  }

  const handleDeleteAccount = async () => {
    if (deletePhrase !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPhrase: deletePhrase }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Deletion failed')
      }

      toast.success('Your account has been deleted')
      router.push('/auth/signout')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetCookieConsent = () => {
    localStorage.removeItem('cookie-consent')
    localStorage.removeItem('cookie-consent-date')
    toast.success('Cookie preferences reset. Reload the page to see the consent banner.')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold text-white">Privacy & Data</h1>
          </div>
          <p className="text-gray-400">
            Manage your data and privacy settings. We take your privacy seriously.
          </p>
        </div>

        {/* GDPR Info Banner */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-300">Your GDPR Rights</h3>
              <p className="text-sm text-blue-200/70 mt-1">
                Under GDPR, you have the right to access, export, and delete your personal data.
                You can exercise these rights using the options below.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Data Export */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Download className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Export Your Data</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Download a copy of all your data including profile, jobs, applications,
                  contracts, messages, and more in JSON format.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download My Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Cookie Preferences */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <Cookie className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your cookie consent settings. Reset to show the cookie consent banner again.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={resetCookieConsent}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Reset Cookie Preferences
                  </button>
                  <a
                    href="/cookies"
                    className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View Cookie Policy →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="bg-gray-800 rounded-xl border border-red-900/50 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Delete Your Account</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={handlePreviewDeletion}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg font-medium hover:bg-red-600/30 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Delete My Account
                  </button>
                ) : (
                  <div className="mt-4 space-y-4">
                    {/* Deletion Preview */}
                    {deletionPreview && (
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-sm text-gray-300 font-medium mb-2">
                          The following data will be permanently deleted:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(deletionPreview).map(([key, count]) => (
                            <div key={key} className="flex justify-between text-gray-400">
                              <span className="capitalize">{key}:</span>
                              <span className="text-white">{count} records</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confirmation Input */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Type <span className="text-red-400 font-mono">DELETE MY ACCOUNT</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deletePhrase}
                        onChange={(e) => setDeletePhrase(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="DELETE MY ACCOUNT"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deletePhrase !== 'DELETE MY ACCOUNT'}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Permanently Delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeletePhrase('')
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Legal Documents</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/privacy" className="text-purple-400 hover:underline text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-purple-400 hover:underline text-sm">
                Terms of Service
              </a>
              <a href="/cookies" className="text-purple-400 hover:underline text-sm">
                Cookie Policy
              </a>
              <a href="/contact" className="text-purple-400 hover:underline text-sm">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
