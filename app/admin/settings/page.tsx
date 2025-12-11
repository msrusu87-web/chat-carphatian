/**
 * Admin Settings Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Platform configuration and settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-gray-400 text-sm">Temporarily disable user access</p>
              </div>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
                Off
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">New User Registrations</p>
                <p className="text-gray-400 text-sm">Allow new users to sign up</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                Enabled
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">AI Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Primary AI Provider</p>
                <p className="text-gray-400 text-sm">OpenAI, Anthropic, or Groq</p>
              </div>
              <select className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Groq</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Fallback Provider</p>
                <p className="text-gray-400 text-sm">Used when primary fails</p>
              </div>
              <select className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
                <option>Anthropic</option>
                <option>Groq</option>
                <option>None</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Platform Fee</p>
                <p className="text-gray-400 text-sm">Percentage taken from transactions</p>
              </div>
              <input 
                type="number" 
                defaultValue="10" 
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
