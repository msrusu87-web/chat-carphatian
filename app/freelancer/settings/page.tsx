/**
 * Freelancer Settings Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function FreelancerSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <input 
                type="email" 
                defaultValue={user.email}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Name</label>
              <input 
                type="text" 
                defaultValue={user.name || ''}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Receive updates about jobs and applications</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                Enabled
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Job Alerts</p>
                <p className="text-gray-400 text-sm">Get notified about matching jobs</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                Enabled
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Privacy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Profile Visibility</p>
                <p className="text-gray-400 text-sm">Show your profile in search results</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                Public
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
