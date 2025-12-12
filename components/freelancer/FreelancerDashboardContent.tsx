/**
 * Freelancer Dashboard Content Component
 * 
 * Fully responsive freelancer dashboard with translations.
 * 
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">{userName ? `Welcome, ${userName}!` : ''}</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">📝</span>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{applicationCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('applications')}</p>
          <p className="text-xs text-yellow-500 mt-1 sm:mt-2">{pendingCount} pending</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">📄</span>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{contractCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('activeContracts')}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">💼</span>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{openJobs.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('availableJobs')}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <Link href="/freelancer/jobs" className="block h-full">
            <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">🔍</span>
            <p className="text-lg sm:text-xl font-bold text-white mb-1">{t('findJobs')}</p>
            <p className="text-gray-400 text-xs sm:text-sm">{t('browseOpportunities')}</p>
          </Link>
        </div>
      </div>

      {/* Quick Actions - Responsive */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
          <Link href="/freelancer/jobs" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg text-center text-sm sm:text-base">
            🔍 {t('findJobs')}
          </Link>
          <Link href="/freelancer/applications" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            📝 {t('applications')}
          </Link>
          <Link href="/freelancer/contracts" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            📄 {t('contracts')}
          </Link>
          <Link href="/freelancer/messages" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            💬 {t('messages')}
          </Link>
        </div>
      </div>

      {/* Two Column Layout - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Available Jobs */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">{t('availableJobs')}</h2>
            <Link href="/freelancer/jobs" className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {openJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4 text-sm">No jobs available</p>
                <Link href="/freelancer/jobs" className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base">
                  Browse All Jobs
                </Link>
              </div>
            ) : (
              openJobs.map((job: any) => (
                <Link key={job.id} href={`/freelancer/jobs/${job.id}`} className="block p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl hover:bg-gray-700/50 transition-all">
                  <div className="min-w-0">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{job.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">${job.budget_min} - ${job.budget_max}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills?.slice(0, 3).map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">{t('myApplications')}</h2>
            <Link href="/freelancer/applications" className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentApps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4 text-sm">No applications yet</p>
                <Link href="/freelancer/jobs" className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base">
                  Find Jobs to Apply
                </Link>
              </div>
            ) : (
              recentApps.map((app: any) => (
                <div key={app.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{app.job?.title || 'Job'}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">${app.proposed_rate}/hr</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
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
      </div>
    </div>
  );
}
