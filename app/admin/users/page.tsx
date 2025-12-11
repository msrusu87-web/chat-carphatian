/**
 * Admin Users Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.created_at)],
    limit: 50,
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">Manage platform users</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
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
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
