/**
 * Deliverable Status Display
 * Shows approval status of submitted deliverables to freelancers
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import FileViewer from './FileViewer'

interface FileAttachment {
    id: number
    filename: string
    url: string
    mime_type: string
    size: number
    uploaded_at: Date
    submission_status?: string
    submitted_at?: Date | null
    approval_status?: string
    feedback?: string | null
    reviewed_at?: Date | null
}

interface DeliverableStatusProps {
    contractId: number
}

export default function DeliverableStatus({ contractId }: DeliverableStatusProps) {
    const [files, setFiles] = useState<FileAttachment[]>([])
    const [loading, setLoading] = useState(true)
    const [viewingFile, setViewingFile] = useState<FileAttachment | null>(null)

    useEffect(() => {
        fetchFiles()
    }, [contractId])

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/attachments?contractId=${contractId}&entityType=contract`)
            if (res.ok) {
                const data = await res.json()
                // Show only submitted deliverables
                const submittedFiles = (data.files || []).filter(
                    (f: FileAttachment) => f.submission_status === 'submitted'
                )
                setFiles(submittedFiles)
            }
        } catch (error) {
            console.error('Failed to fetch files:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return '🖼️'
        if (mimeType === 'application/pdf') return '📄'
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
        if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
        if (mimeType.startsWith('text/')) return '📃'
        if (mimeType.startsWith('video/')) return '🎥'
        if (mimeType.startsWith('audio/')) return '🎵'
        return '📎'
    }

    const getStatusBadge = (file: FileAttachment) => {
        if (file.approval_status === 'approved') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                    ✅ Approved
                </span>
            )
        }
        if (file.approval_status === 'rejected') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50">
                    ⚠️ Needs Revision
                </span>
            )
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                ⏳ Awaiting Review
            </span>
        )
    }

    if (loading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (files.length === 0) {
        return null // Don't show anything if no deliverables submitted
    }

    const pendingReviews = files.filter(f => f.approval_status === 'pending').length
    const approvedCount = files.filter(f => f.approval_status === 'approved').length
    const rejectedCount = files.filter(f => f.approval_status === 'rejected').length

    return (
        <>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Deliverable Status</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Track the approval status of your submitted deliverables
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="text-green-400">✅ {approvedCount}</div>
                        <div className="text-red-400">⚠️ {rejectedCount}</div>
                        <div className="text-yellow-400">⏳ {pendingReviews}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className={`border rounded-xl p-5 ${
                                file.approval_status === 'approved'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : file.approval_status === 'rejected'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-gray-700/30 border-gray-600'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-3xl">{getFileIcon(file.mime_type)}</span>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-white font-medium truncate">{file.filename}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            <span>{formatFileSize(file.size)}</span>
                                            <span>•</span>
                                            <span>Submitted {new Date(file.submitted_at!).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(file)}
                            </div>

                            {file.feedback && (
                                <div className={`mt-3 border rounded-lg p-3 ${
                                    file.approval_status === 'approved'
                                        ? 'bg-green-900/20 border-green-500/30'
                                        : 'bg-red-900/20 border-red-500/30'
                                }`}>
                                    <div className="text-xs text-gray-400 mb-1">Client Feedback:</div>
                                    <div className="text-sm text-white">{file.feedback}</div>
                                    {file.reviewed_at && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Reviewed {new Date(file.reviewed_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {file.approval_status === 'rejected' && (
                                <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                    <div className="text-sm text-red-400 font-semibold">
                                        ⚠️ Action Required: Upload a revised version addressing the client's feedback
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => setViewingFile(file)}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    👁 View
                                </button>
                                <a
                                    href={file.url}
                                    download={file.filename}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    ⬇ Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {rejectedCount > 0 && (
                    <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="text-yellow-400 font-semibold mb-1">Next Steps</h4>
                                <p className="text-sm text-gray-300">
                                    Review the client's feedback and upload revised versions of the rejected deliverables.
                                    Once updated, submit them again for review.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {viewingFile && (
                <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
            )}
        </>
    )
}
