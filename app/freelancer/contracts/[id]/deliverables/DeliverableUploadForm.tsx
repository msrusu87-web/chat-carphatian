'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import FileViewer from '@/components/FileViewer'
import { toast } from 'sonner'

interface DeliverableUploadFormProps {
    contractId: number
}

interface UploadedFile {
    id: number
    filename: string
    url: string
    mime_type: string
    size: number
    uploaded_at: Date
    submission_status?: string
    submitted_at?: Date
}

export default function DeliverableUploadForm({ contractId }: DeliverableUploadFormProps) {
    const router = useRouter()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Load existing files
    useEffect(() => {
        loadFiles()
    }, [contractId])

    const loadFiles = async () => {
        try {
            const res = await fetch(`/api/attachments?contractId=${contractId}&entityType=contract`)
            if (res.ok) {
                const data = await res.json()
                setUploadedFiles(data.files || [])
                // Check if already submitted
                const hasSubmitted = data.files?.some((f: UploadedFile) => f.submission_status === 'submitted')
                setIsSubmitted(hasSubmitted)
            }
        } catch (error) {
            console.error('Failed to load files:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (files: File[]) => {
        for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('entity_id', contractId.toString())
            formData.append('entity_type', 'contract')

            try {
                const res = await fetch('/api/attachments', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Upload failed')
                }

                const data = await res.json()
                setUploadedFiles(prev => [...prev, data.file])
                toast.success(`${file.name} uploaded successfully`)
            } catch (error: any) {
                toast.error(`Failed to upload ${file.name}: ${error.message}`)
            }
        }
    }

    const handleSubmit = async () => {
        if (uploadedFiles.length === 0) {
            toast.error('Please upload at least one file before submitting')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/contracts/${contractId}/submit-deliverables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileIds: uploadedFiles.map(f => f.id),
                    notes: notes.trim(),
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Submission failed')
            }

            const data = await res.json()
            toast.success(data.message || 'Deliverables submitted successfully!')
            setIsSubmitted(true)
            
            // Reload files to get updated statuses
            await loadFiles()
            
            // Redirect to contract page after 1.5 seconds
            setTimeout(() => {
                router.push(`/freelancer/contracts/${contractId}`)
            }, 1500)
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit deliverables')
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
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
        if (mimeType.includes('video')) return '🎥'
        if (mimeType.includes('audio')) return '🎵'
        return '📎'
    }

    const isSourceCode = (file: UploadedFile) => {
        return file.filename.match(/\.(zip|rar|7z|tar|gz|js|ts|jsx|tsx|py|java|cpp|c|h)$/i)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {isSubmitted && (
                <div className="bg-green-600/20 border border-green-600 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="text-white font-semibold">Deliverables Submitted</p>
                            <p className="text-green-100 text-sm">Your files are under client review</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Deliverables Section */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Project Deliverables</h2>
                <p className="text-gray-400 text-sm mb-4">
                    Upload final deliverables, documentation, and any related files
                </p>

                {!isSubmitted && (
                    <FileUpload
                        onUpload={handleFileUpload}
                        accept="*"
                        label="Upload Files"
                        maxSizeMB={50}
                    />
                )}

                {uploadedFiles.filter(f => !isSourceCode(f)).length > 0 && (
                    <div className="mt-4 space-y-2">
                        {uploadedFiles
                            .filter(f => !isSourceCode(f))
                            .map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{file.filename}</p>
                                            <p className="text-gray-400 text-sm">
                                                {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewingFile(file)}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                        >
                                            View
                                        </button>
                                        <a
                                            href={file.url}
                                            download={file.filename}
                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Source Code Section */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Source Code</h2>
                <p className="text-gray-400 text-sm mb-4">
                    Upload your source code (ZIP, RAR, or individual files)
                </p>

                {!isSubmitted && (
                    <FileUpload
                        onUpload={handleFileUpload}
                        accept=".zip,.rar,.7z,.tar,.gz,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html"
                        label="Upload Source Code"
                        maxSizeMB={100}
                    />
                )}

                {uploadedFiles.filter(f => isSourceCode(f)).length > 0 && (
                    <div className="mt-4 space-y-2">
                        {uploadedFiles
                            .filter(f => isSourceCode(f))
                            .map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">💻</span>
                                        <div>
                                            <p className="text-white font-medium">{file.filename}</p>
                                            <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={file.url}
                                        download={file.filename}
                                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Notes Section */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Delivery Notes</h2>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or instructions for the client..."
                    disabled={isSubmitted}
                    className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Submit Button */}
            {!isSubmitted && (
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || uploadedFiles.length === 0}
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {submitting ? 'Submitting...' : `Submit ${uploadedFiles.length} File(s) for Review`}
                    </button>
                </div>
            )}

            {/* File Viewer Modal */}
            {viewingFile && (
                <FileViewer
                    file={viewingFile}
                    onClose={() => setViewingFile(null)}
                />
            )}
        </div>
    )
}
