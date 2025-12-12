/**
 * Dashboard Layout Component
 * 
 * Wrapper layout for admin, client, and freelancer dashboards.
 * Includes sidebar and main content area.
 * 
 * Built by Carphatian
 */

'use client';

import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  role: 'admin' | 'client' | 'freelancer';
  userName?: string;
  children: ReactNode;
}

export function DashboardLayout({ role, userName, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <DashboardSidebar role={role} userName={userName} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
