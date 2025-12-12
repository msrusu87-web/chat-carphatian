/**
 * Client Dashboard Content Component
 * 
 * Fully responsive client dashboard with translations.
 * 
 * Built by Carphatian
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ClientDashboardContentProps {
  userName?: string;
  jobCount: number;
  openJobCount: number;
  contractCount: number;
  recentJobs: any[];
}

export function ClientDashboardContent({
  userName,
  jobCount,
  openJobCount,
  contractCount,
  recentJobs,
}: ClientDashboardContentProps) {
  const t = useTranslations('dashboard.client');
  const common = useTranslations('common');
  const jobsT = useTranslations('jobs');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">{userName ? `Welcome, ${userName}!` : ''}</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">💼</span>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{jobCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('myJobs')}</p>
          <p className="text-xs text-green-500 mt-1 sm:mt-2">{openJobCount} {jobsT('status.open').toLowerCase()}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">📄</span>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{contractCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('activeContracts')}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <Link href="/client/jobs/new" className="block h-full">
            <span className="text-2xl sm:text-3xl mb-2 sm:mb-4 block">➕</span>
            <p className="text-lg sm:text-xl font-bold text-white mb-1">{t('postJob')}</p>
            <p className="text-gray-400 text-xs sm:text-sm">{t('findFreelancers')}</p>
          </Link>
        </div>
      </div>

      {/* Quick Actions - Responsive */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
          <Link href="/client/jobs/new" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg text-center text-sm sm:text-base">
            ➕ {t('postJob')}
          </Link>
          <Link href="/client/jobs" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            💼 {t('myJobs')}
          </Link>
          <Link href="/client/applications" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            📝 {t('applications')}
          </Link>
          <Link href="/client/messages" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            💬 {t('messages')}
          </Link>
        </div>
      </div>

      {/* Recent Jobs - Responsive */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">{t('myJobs')}</h2>
          <Link href="/client/jobs" className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium">{common('viewAll')} →</Link>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4 text-sm">No jobs posted yet</p>
              <Link href="/client/jobs/new" className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base">
                Post Your First Job
              </Link>
            </div>
          ) : (
            recentJobs.map((job: any) => (
              <div key={job.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl">
                <div className="min-w-0 flex-1 mr-3">
                  <h3 className="font-medium text-white text-sm sm:text-base truncate">{job.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">${job.budget_min} - ${job.budget_max}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                  job.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {job.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
