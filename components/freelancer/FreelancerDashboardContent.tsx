/**
 * Freelancer Dashboard Content Component
 * Built by Carphatian
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface FreelancerDashboardContentProps {
  userName?: string;
  applicationCount: number;
  pendingCount: number;
  contractCount: number;
  recentApps: any[];
  openJobs: any[];
}

export function FreelancerDashboardContent({
  userName,
  applicationCount,
  pendingCount,
  contractCount,
  recentApps,
  openJobs,
}: FreelancerDashboardContentProps) {
  const t = useTranslations('dashboard.freelancer');
  const common = useTranslations('common');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400 mt-1">{userName ? `Welcome, ${userName}!` : ''}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <span className="text-3xl mb-4 block">📝</span>
          <p className="text-4xl font-bold text-white mb-1">{applicationCount}</p>
          <p className="text-gray-400 text-sm">{t('myApplications')}</p>
          <p className="text-xs text-yellow-500 mt-2">{pendingCount} {t('pending')}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <span className="text-3xl mb-4 block">📄</span>
          <p className="text-4xl font-bold text-white mb-1">{contractCount}</p>
          <p className="text-gray-400 text-sm">{t('activeContracts')}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <span className="text-3xl mb-4 block">💼</span>
          <p className="text-4xl font-bold text-white mb-1">{openJobs.length}</p>
          <p className="text-gray-400 text-sm">{t('availableJobs')}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <Link href="/freelancer/jobs" className="block h-full">
            <span className="text-3xl mb-4 block">🔍</span>
            <p className="text-xl font-bold text-white mb-1">{t('findWork')}</p>
            <p className="text-gray-400 text-sm">{t('browseJobs')}</p>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/freelancer/jobs" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg">
            🔍 {t('findWork')}
          </Link>
          <Link href="/freelancer/applications" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📝 {t('myApplications')}
          </Link>
          <Link href="/freelancer/contracts" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📄 {t('contracts')}
          </Link>
          <Link href="/freelancer/profile" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            👤 {t('profile')}
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{t('myApplications')}</h2>
            <Link href="/freelancer/applications" className="text-blue-400 hover:text-blue-300 text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-4">
            {recentApps.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No applications yet</p>
            ) : (
              recentApps.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <div>
                    <h3 className="font-medium text-white">{app.job?.title || 'Job'}</h3>
                    <p className="text-sm text-gray-400 mt-1">${app.proposed_rate}/hr</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    app.status === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Jobs */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{t('availableJobs')}</h2>
            <Link href="/freelancer/jobs" className="text-blue-400 hover:text-blue-300 text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-4">
            {openJobs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No jobs available</p>
            ) : (
              openJobs.slice(0, 5).map((job: any) => (
                <Link key={job.id} href={`/freelancer/jobs/${job.id}`} className="block p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                  <h3 className="font-medium text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">${job.budget_min} - ${job.budget_max}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
