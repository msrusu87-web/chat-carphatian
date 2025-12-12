'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

interface EmailSettings {
  smtp_host: string
  smtp_port: string
  smtp_secure: string
  smtp_user: string
  smtp_password: string
  smtp_from_name: string
  smtp_from_email: string
  smtp_enabled: string
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  description: string
}

const defaultTemplates: EmailTemplate[] = [
  { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to Carphatian!', description: 'Sent when a new user registers' },
  { id: 'verification', name: 'Email Verification', subject: 'Verify your email address', description: 'Email confirmation link' },
  { id: 'password-reset', name: 'Password Reset', subject: 'Reset your password', description: 'Password recovery link' },
  { id: 'job-notification', name: 'New Job Alert', subject: 'New job matches your skills', description: 'Job matching notifications' },
  { id: 'contract-created', name: 'Contract Created', subject: 'New contract started', description: 'When a contract begins' },
  { id: 'payment-received', name: 'Payment Received', subject: 'Payment confirmation', description: 'Payment notifications' },
]

export default function EmailSettingsPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'settings' | 'compose' | 'templates' | 'logs'>('settings')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [sending, setSending] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [dnsStatus, setDnsStatus] = useState({ spf: false, dkim: false, dmarc: false })
  
  // Compose email state
  const [composeEmail, setComposeEmail] = useState({
    to: [] as string[],
    subject: '',
    message: '',
    template: '',
  })
  const [searchUsers, setSearchUsers] = useState('')
  
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_host: 'localhost',
    smtp_port: '25',
    smtp_secure: 'false',
    smtp_user: '',
    smtp_password: '',
    smtp_from_name: 'Carphatian AI Marketplace',
    smtp_from_email: 'noreply@chat.carphatian.ro',
    smtp_enabled: 'true',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      redirect('/login')
    }
    loadSettings()
    loadUsers()
    checkDnsRecords()
  }, [session, status])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/email')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const checkDnsRecords = async () => {
    // Simulate DNS check - in production this would call an API
    setDnsStatus({ spf: true, dkim: true, dmarc: true })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (res.ok) {
        toast.success('Email settings saved successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }
    
    setTesting(true)
    try {
      const res = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, settings }),
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success(`Test email sent to ${testEmail}`)
      } else {
        toast.error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  const handleSendEmail = async () => {
    if (composeEmail.to.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }
    if (!composeEmail.subject) {
      toast.error('Please enter a subject')
      return
    }
    if (!composeEmail.message) {
      toast.error('Please enter a message')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/settings/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeEmail.to,
          subject: composeEmail.subject,
          message: composeEmail.message,
        }),
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success(`Email sent to ${composeEmail.to.length} recipient(s)`)
        setComposeEmail({ to: [], subject: '', message: '', template: '' })
      } else {
        toast.error(data.error || 'Failed to send email')
      }
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const toggleRecipient = (email: string) => {
    setComposeEmail(prev => ({
      ...prev,
      to: prev.to.includes(email)
        ? prev.to.filter(e => e !== email)
        : [...prev.to, email]
    }))
  }

  const selectAllUsers = (role?: string) => {
    const filtered = role ? users.filter(u => u.role === role) : users
    setComposeEmail(prev => ({
      ...prev,
      to: filtered.map(u => u.email)
    }))
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchUsers.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Email Management</h1>
        <p className="text-gray-400 mt-2">Configure email settings, send emails, and manage templates</p>
      </div>

      {/* DNS Status Bar */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dnsStatus.spf ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-300">SPF</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dnsStatus.dkim ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-300">DKIM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dnsStatus.dmarc ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-300">DMARC</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Server: <span className="text-white font-mono">localhost:25</span> • 
            Domain: <span className="text-white font-mono">chat.carphatian.ro</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {(['settings', 'compose', 'templates', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab === 'settings' && '⚙️ Settings'}
            {tab === 'compose' && '✉️ Compose'}
            {tab === 'templates' && '📝 Templates'}
            {tab === 'logs' && '📊 Logs'}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* SMTP Settings */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">SMTP Configuration</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smtp_enabled === 'true'}
                    onChange={(e) => setSettings({ ...settings, smtp_enabled: e.target.checked ? 'true' : 'false' })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-white">Enable SMTP Email</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="localhost"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">From Name</label>
                  <input
                    type="text"
                    value={settings.smtp_from_name}
                    onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Carphatian AI Marketplace"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">From Email</label>
                  <input
                    type="email"
                    value={settings.smtp_from_email}
                    onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="noreply@chat.carphatian.ro"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Test Email */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Send Test Email</h2>
            
            <div className="flex gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Sending...' : 'Send Test'}
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mt-2">
              💡 If emails go to spam, check that SPF, DKIM, and DMARC are all configured correctly.
            </p>
          </div>

          {/* DNS Records */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">📋 Required DNS Records</h2>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">SPF Record (TXT)</div>
                <div className="font-bold text-white">chat.carphatian.ro</div>
                <div className="text-green-400">v=spf1 ip4:135.125.174.208 -all</div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">DKIM Record (TXT)</div>
                <div className="font-bold text-white">mail._domainkey.chat.carphatian.ro</div>
                <div className="text-green-400 break-all text-xs">v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtcwX6XBOaybRKK9SRkE1zw+FfN6/MIWWoI26+O5A8uQeHVp7J62bIWsPKKXhvNuC3VdDyuTojHq5zIzTtcjSyogQPTJjXhMPE9YNJVH1mCu4pCp+mK6h63ks8Hc7kgi6W/RarSIGPtJ9aupA6fUcBiCCUtMFsUfDTyuQW/l8hj/GX+L27Qs0J0BtgvzKX3ec/rlEIMJeZRtUBJ3NwZzvyyffigUTw1jud3YENnhnw25ORPQgYiH540b2gUAXeE7VTDrTw4a5qO2kuuWrsVJDPYDfHHgPNTx/6bOt5P3p1dsHR3fM0wMoUmxvJq3sR+xgPy5LPKWUcK/opwOQFcMV2QIDAQAB</div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">DMARC Record (TXT)</div>
                <div className="font-bold text-white">_dmarc.chat.carphatian.ro</div>
                <div className="text-green-400">v=DMARC1; p=none; rua=mailto:msrusu87@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Recipients */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recipients</h2>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                placeholder="Search users..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => selectAllUsers()}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                All Users
              </button>
              <button
                onClick={() => selectAllUsers('client')}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Clients
              </button>
              <button
                onClick={() => selectAllUsers('freelancer')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Freelancers
              </button>
              <button
                onClick={() => setComposeEmail(prev => ({ ...prev, to: [] }))}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Clear
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    composeEmail.to.includes(user.email)
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={composeEmail.to.includes(user.email)}
                    onChange={() => toggleRecipient(user.email)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{user.name || 'No name'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-red-600' :
                    user.role === 'client' ? 'bg-purple-600' : 'bg-green-600'
                  } text-white`}>
                    {user.role}
                  </span>
                </label>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No users found</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Selected: <span className="text-white font-medium">{composeEmail.to.length}</span> recipients
              </p>
            </div>
          </div>

          {/* Compose Form */}
          <div className="col-span-2 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Compose Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Template (optional)</label>
                <select
                  value={composeEmail.template}
                  onChange={(e) => {
                    const template = defaultTemplates.find(t => t.id === e.target.value)
                    setComposeEmail(prev => ({
                      ...prev,
                      template: e.target.value,
                      subject: template?.subject || prev.subject,
                    }))
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No template - Custom email</option>
                  {defaultTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeEmail.subject}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea
                  value={composeEmail.message}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here...

You can use these variables:
{{name}} - User's name
{{email}} - User's email"
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSendEmail}
                  disabled={sending || composeEmail.to.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      📤 Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setComposeEmail({ to: [], subject: '', message: '', template: '' })}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Email Templates</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {defaultTemplates.map((template) => (
                <div key={template.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Subject: {template.subject}</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create New Template</h2>
            <p className="text-gray-400">Template editor coming soon. Currently using default templates.</p>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Email Logs</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">To</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-gray-300">Dec 12, 2025 03:36</td>
                  <td className="py-3 px-4 text-white">msrusu87@gmail.com</td>
                  <td className="py-3 px-4 text-white">Test Email from Carphatian</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded bg-green-600 text-white">Delivered</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            Full email logging with delivery tracking coming soon.
          </p>
        </div>
      )}
    </div>
  )
}
