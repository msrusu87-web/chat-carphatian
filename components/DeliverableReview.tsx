/**
 * Deliverable Review Component
 * Client reviews and approves/rejects submitted deliverables
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import FileViewer from './FileViewer'
import { toast } from 'sonner'

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
    reviewed_by?: number | null
}

interface DeliverableReviewProps {
    contractId: number
}

export default function DeliverableReview({ contractId }: DeliverableReviewProps) {
    const [files, setFiles] = useState<FileAttachment[]>([])
    const [loading, setLoading] = useState(true)
    const [viewingFile, setViewingFile] = useState<FileAttachment | null>(null)
    const [reviewingFile, setReviewingFile] = useState<number | null>(null)
    const [feedback, setFeedback] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchFiles()
    }, [contractId])

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/attachments?contractId=${contractId}&entityType=contract`)
            if (res.ok) {
                const data = await res.json()
                // Only show submitted deliverables
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

    const handleReview = async (fileId: number, action: 'approve' | 'reject') => {
        if (action === 'reject' && !feedback.trim()) {
            toast.error('Please provide feedback for rejection')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/contracts/${contractId}/approve-deliverable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attachmentId: fileId,
                    action: action,
                    feedback: feedback.trim() || null,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                toast.success(data.message || `Deliverable ${action}d successfully`)
                setReviewingFile(null)
                setFeedback('')
                await fetchFiles() // Refresh list
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to review deliverable')
            }
        } catch (error) {
            console.error('Review error:', error)
            toast.error('Failed to review deliverable')
        } finally {
            setSubmitting(false)
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
                    ❌ Rejected
                </span>
            )
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                ⏳ Pending Review
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
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Review Deliverables</h3>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-400 mb-2">No deliverables submitted yet</p>
                    <p className="text-sm text-gray-500">The freelancer will upload deliverables for your review</p>
                </div>
            </div>
        )
    }

    const pendingReviews = files.filter(f => f.approval_status === 'pending').length
    const approvedCount = files.filter(f => f.approval_status === 'approved').length
    const rejectedCount = files.filter(f => f.approval_status === 'rejected').length

    return (
        <>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Review Deliverables</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {pendingReviews > 0 && (
                                <span className="text-yellow-400 font-semibold">
                                    {pendingReviews} pending review
                                </span>
                            )}
                            {pendingReviews === 0 && files.length > 0 && (
                                <span className="text-green-400">All deliverables reviewed</span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="text-green-400">✅ {approvedCount}</div>
                        <div className="text-red-400">❌ {rejectedCount}</div>
                        <div className="text-yellow-400">⏳ {pendingReviews}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="bg-gray-700/30 border border-gray-600 rounded-xl p-5"
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
                                <div className="mt-3 bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                    <div className="text-xs text-gray-400 mb-1">Feedback:</div>
                                    <div className="text-sm text-white">{file.feedback}</div>
                                    {file.reviewed_at && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Reviewed {new Date(file.reviewed_at).toLocaleDateString()}
                                        </div>
                                    )}
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
                                {file.approval_status === 'pending' && (
                                    <button
                                        onClick={() => setReviewingFile(file.id)}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                                    >
                                        📝 Review
                                    </button>
                                )}
                            </div>

                            {/* Review Form */}
                            {reviewingFile === file.id && (
                                <div className="mt-4 pt-4 border-t border-gray-600">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Feedback (optional for approval, required for rejection)
                                            </label>
                                            <textarea
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                placeholder="Provide feedback about this deliverable..."
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleReview(file.id, 'approve')}
                                                disabled={submitting}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleReview(file.id, 'reject')}
                                                disabled={submitting}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
                                            >
                                                ❌ Request Changes
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReviewingFile(null)
                                                    setFeedback('')
                                                }}
                                                disabled={submitting}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {viewingFile && (
                <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
            )}
        </>
    )
}
