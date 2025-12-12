/**
 * Dashboard Sidebar Component
 * 
 * Reusable sidebar for admin, client, and freelancer dashboards.
 * Fully translated using next-intl.
 * 
 * Built by Carphatian
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  BarChart2,
  Settings,
  MessageSquare,
  Search,
  Send,
  Wallet,
  User,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'client' | 'freelancer';
  userName?: string;
}

export function DashboardSidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const nav = useTranslations('nav');

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: t('admin.title') },
    { href: '/admin/users', icon: Users, label: t('admin.users') },
    { href: '/admin/jobs', icon: Briefcase, label: t('admin.jobs') },
    { href: '/admin/contracts', icon: FileText, label: t('admin.contracts') },
    { href: '/admin/payments', icon: CreditCard, label: t('admin.payments') },
    { href: '/admin/analytics', icon: BarChart2, label: t('admin.analytics') },
    { href: '/admin/settings', icon: Settings, label: t('admin.settings') },
  ];

  const clientLinks = [
    { href: '/client', icon: LayoutDashboard, label: t('client.title') },
    { href: '/client/jobs', icon: Briefcase, label: t('client.myJobs') },
    { href: '/client/jobs/new', icon: Send, label: t('client.postJob') },
    { href: '/client/applications', icon: FileText, label: t('client.applications') },
    { href: '/client/contracts', icon: FileText, label: t('client.contracts') },
    { href: '/client/payments', icon: CreditCard, label: t('client.payments') },
    { href: '/client/messages', icon: MessageSquare, label: t('client.messages') },
    { href: '/client/settings', icon: Settings, label: nav('settings') },
  ];

  const freelancerLinks = [
    { href: '/freelancer', icon: LayoutDashboard, label: t('freelancer.title') },
    { href: '/freelancer/jobs', icon: Search, label: t('freelancer.findJobs') },
    { href: '/freelancer/applications', icon: Send, label: t('freelancer.myApplications') },
    { href: '/freelancer/contracts', icon: FileText, label: t('freelancer.contracts') },
    { href: '/freelancer/earnings', icon: Wallet, label: t('freelancer.earnings') },
    { href: '/freelancer/profile', icon: User, label: t('freelancer.profile') },
    { href: '/freelancer/messages', icon: MessageSquare, label: t('freelancer.messages') },
    { href: '/freelancer/settings', icon: Settings, label: t('freelancer.settings') },
  ];

  const links = role === 'admin' ? adminLinks : role === 'client' ? clientLinks : freelancerLinks;

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'from-orange-500 to-red-500';
      case 'client': return 'from-blue-500 to-purple-500';
      case 'freelancer': return 'from-green-500 to-teal-500';
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-white font-bold">Carphatian</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center`}>
            <span className="text-white font-bold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{userName || 'User'}</p>
            <p className="text-gray-400 text-xs capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `bg-gradient-to-r ${getRoleColor()} text-white`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher & Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center justify-center mb-2">
          <LanguageSwitcher variant="compact" />
        </div>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{nav('signOut')}</span>
        </Link>
      </div>
    </aside>
  );
}
