/**
 * Admin Users Page - Interactive User Management
 * Built by Carphatian
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'client' | 'freelancer'
  email_verified: boolean
  created_at: Date
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ email: '', role: '', password: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users-list')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('User deleted successfully')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete user')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ email: user.email, role: user.role, password: '' })
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          email: editForm.email,
          role: editForm.role,
          password: editForm.password || undefined,
        }),
      })

      if (res.ok) {
        await loadUsers()
        setEditingUser(null)
        setEditForm({ email: '', role: '', password: '' })
        alert('User updated successfully')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update user')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-white">
        <div className="animate-pulse">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">Manage platform users - {users.length} total users</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">{user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-white font-medium">{user.name || 'No name'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'client' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {user.email_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Edit User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
