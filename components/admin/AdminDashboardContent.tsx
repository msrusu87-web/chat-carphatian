/**
 * Admin Dashboard Content Component
 * 
 * Fully responsive admin dashboard with translations.
 * 
 * Built by Carphatian
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface StatsProps {
  userCount: number;
  clientCount: number;
  freelancerCount: number;
  jobCount: number;
  openJobCount: number;
  contractCount: number;
  activeContractCount: number;
  applicationCount: number;
  recentJobs: any[];
  recentContracts: any[];
}

export function AdminDashboardContent({
  userCount,
  clientCount,
  freelancerCount,
  jobCount,
  openJobCount,
  contractCount,
  activeContractCount,
  applicationCount,
  recentJobs,
  recentContracts,
}: StatsProps) {
  const t = useTranslations('dashboard.admin');
  const common = useTranslations('common');
  const jobsT = useTranslations('jobs');
  const contractsT = useTranslations('contracts');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">{t('platformHealth')}</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="text-2xl sm:text-3xl">👥</span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{userCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('totalUsers')}</p>
          <p className="text-xs text-gray-500 mt-1 sm:mt-2 hidden sm:block">{clientCount} clients • {freelancerCount} freelancers</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="text-2xl sm:text-3xl">💼</span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{jobCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('jobs')}</p>
          <p className="text-xs text-green-500 mt-1 sm:mt-2">{openJobCount} {jobsT('status.open').toLowerCase()}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="text-2xl sm:text-3xl">📄</span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{contractCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">{t('contracts')}</p>
          <p className="text-xs text-blue-500 mt-1 sm:mt-2">{activeContractCount} {contractsT('active').toLowerCase()}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="text-2xl sm:text-3xl">📝</span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{applicationCount}</p>
          <p className="text-gray-400 text-xs sm:text-sm">Applications</p>
        </div>
      </div>

      {/* Admin Actions - Responsive */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Admin Actions</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
          <Link href="/admin/users" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg text-center text-sm sm:text-base">
            👥 {t('users')}
          </Link>
          <Link href="/admin/jobs" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            💼 {t('jobs')}
          </Link>
          <Link href="/admin/contracts" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            📄 {t('contracts')}
          </Link>
          <Link href="/admin/analytics" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-600 transition-all text-center text-sm sm:text-base">
            📈 {t('analytics')}
          </Link>
        </div>
      </div>

      {/* Recent Activity - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Jobs */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">{t('jobs')}</h2>
            <Link href="/admin/jobs" className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentJobs.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No jobs yet</p>
            ) : (
              recentJobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{job.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">by {job.client?.profile?.full_name || job.client?.email}</p>
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

        {/* Recent Contracts */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">{t('contracts')}</h2>
            <Link href="/admin/contracts" className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium">{common('viewAll')} →</Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentContracts.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No contracts yet</p>
            ) : (
              recentContracts.slice(0, 5).map((contract: any) => (
                <div key={contract.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{contract.job?.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">${contract.total_amount}</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    contract.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {contract.status}
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
