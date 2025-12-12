/**
 * Dashboard Layout Component
 * 
 * Fully responsive wrapper for admin, client, and freelancer dashboards.
 * Includes collapsible sidebar for mobile devices.
 * 
 * Built by Carphatian
 */

'use client';

import { ReactNode, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  role: 'admin' | 'client' | 'freelancer';
  userName?: string;
  children: ReactNode;
}

export function DashboardLayout({ role, userName, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'from-orange-500 to-red-500';
      case 'client': return 'from-blue-500 to-purple-500';
      case 'freelancer': return 'from-green-500 to-teal-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRoleColor()} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-bold">Carphatian</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide-in when open */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <DashboardSidebar 
          role={role} 
          userName={userName} 
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
