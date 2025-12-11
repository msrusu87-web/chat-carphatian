'use client'

import { useState } from 'react'
import Link from 'next/link'
import JobDetailModal from '@/components/JobDetailModal'

interface ContractCardProps {
  contract: any
}

export default function ContractCard({ contract }: ContractCardProps) {
  const [showJobDetails, setShowJobDetails] = useState(false)

  const completedMilestones = contract.milestones?.filter((m: any) => m.status === 'released').length || 0
  const totalMilestones = contract.milestones?.length || 0

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{contract.job?.title}</h3>
            <p className="text-gray-400 text-sm">Client: {contract.client?.email || 'Unknown'}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            contract.status === 'active' ? 'bg-green-500/20 text-green-400' :
            contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            contract.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {contract.status}
          </span>
        </div>

        {/* Progress Bar */}
        {totalMilestones > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300">{completedMilestones}/{totalMilestones} milestones</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm mb-4">
          <span className="text-gray-400">💰 ${contract.total_amount}</span>
          <span className="text-gray-400">📅 {new Date(contract.created_at).toLocaleDateString()}</span>
          {contract.end_date && (
            <span className="text-gray-400">⏰ Ends {new Date(contract.end_date).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJobDetails(true)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Job Details
          </button>

          {(contract.status === 'active' || contract.status === 'paused') && (
            <Link
              href={`/freelancer/messages?client=${contract.client_id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Client
            </Link>
          )}

          {contract.status === 'completed' && (
            <Link
              href={`/freelancer/contracts/${contract.id}/deliverables`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Deliverables
            </Link>
          )}
        </div>
      </div>

      {showJobDetails && contract.job && (
        <JobDetailModal
          job={contract.job}
          onClose={() => setShowJobDetails(false)}
        />
      )}
    </>
  )
}
