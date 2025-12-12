'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import NotificationBell from '@/components/NotificationBell'

interface SidebarProps {
  userRole: 'client' | 'freelancer' | 'admin'
  userName?: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = {
    client: [
      { icon: '📊', label: 'Dashboard', href: '/client' },
      { icon: '💼', label: 'My Jobs', href: '/client/jobs' },
      { icon: '👥', label: 'Find Talent', href: '/client/freelancers' },
      { icon: '📝', label: 'Applications', href: '/client/applications' },
      { icon: '📄', label: 'Contracts', href: '/client/contracts' },
      { icon: '💬', label: 'Messages', href: '/client/messages' },
      { icon: '💳', label: 'Payments', href: '/client/payments' },
      { icon: '⚙️', label: 'Settings', href: '/client/settings' },
    ],
    freelancer: [
      { icon: '📊', label: 'Dashboard', href: '/freelancer' },
      { icon: '🔍', label: 'Find Jobs', href: '/freelancer/jobs' },
      { icon: '📝', label: 'My Applications', href: '/freelancer/applications' },
      { icon: '📄', label: 'Contracts', href: '/freelancer/contracts' },
      { icon: '💬', label: 'Messages', href: '/freelancer/messages' },
      { icon: '💰', label: 'Earnings', href: '/freelancer/earnings' },
      { icon: '👤', label: 'Profile', href: '/freelancer/profile' },
      { icon: '⚙️', label: 'Settings', href: '/freelancer/settings' },
    ],
    admin: [
      { icon: '📊', label: 'Dashboard', href: '/admin' },
      { icon: '👥', label: 'Users', href: '/admin/users' },
      { icon: '💼', label: 'Jobs', href: '/admin/jobs' },
      { icon: '📄', label: 'Contracts', href: '/admin/contracts' },
      { icon: '💳', label: 'Payments', href: '/admin/payments' },
      { icon: '📈', label: 'Analytics', href: '/admin/analytics' },
      { icon: '🩺', label: 'Health', href: '/admin/health' },
      { icon: '📧', label: 'Email', href: '/admin/settings/email' },
      { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
    ],
  }

  const items = menuItems[userRole] || menuItems.client

  const roleColors = {
    client: 'from-blue-500 to-cyan-500',
    freelancer: 'from-purple-500 to-pink-500',
    admin: 'from-orange-500 to-red-500',
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[userRole]} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">Carphatian</span>
            <p className="text-xs text-gray-500 capitalize">{userRole} Portal</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[userRole]} flex items-center justify-center`}>
            <span className="text-white font-medium">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg`
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-600">Built by Carphatian</p>
      </div>
    </aside>
  )
}
