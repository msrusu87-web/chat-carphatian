'use client'

import { useState } from 'react'
import JobDetailModal from '@/components/JobDetailModal'

interface ApplicationCardProps {
    application: any
}

export default function ApplicationCard({ application: app }: ApplicationCardProps) {
    const [showJobDetails, setShowJobDetails] = useState(false)

    return (
        <>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{app.job?.title}</h3>
                        <p className="text-gray-400 text-sm">Client: {app.job?.client?.email || 'Unknown'}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                        }`}>
                        {app.status}
                    </span>
                </div>

                <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">Your Cover Letter:</p>
                    <p className="text-gray-300 line-clamp-3">{app.cover_letter}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">💰 ${app.proposed_rate}/hr</span>
                        <span className="text-gray-400">📅 Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>

                    <button
                        onClick={() => setShowJobDetails(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Complete Job
                    </button>
                </div>
            </div>

            {showJobDetails && app.job && (
                <JobDetailModal
                    job={app.job}
                    onClose={() => setShowJobDetails(false)}
                />
            )}
        </>
    )
}
