/**
 * Contract Attachments Component
 * Upload, view, and manage contract files
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import FileViewer from './FileViewer'

interface FileAttachment {
    id: number
    filename: string
    url: string
    mime_type: string
    size: number
    uploaded_at: Date
}

interface ContractAttachmentsProps {
    contractId: number
    entityType?: 'contract' | 'deliverable' | 'documentation'
    title?: string
    description?: string
    canUpload?: boolean
}

export default function ContractAttachments({
    contractId,
    entityType = 'contract',
    title = 'Attachments',
    description = 'Upload files related to this contract',
    canUpload = true
}: ContractAttachmentsProps) {
    const [files, setFiles] = useState<FileAttachment[]>([])
    const [loading, setLoading] = useState(true)
    const [viewingFile, setViewingFile] = useState<FileAttachment | null>(null)
    const [deleting, setDeleting] = useState<number | null>(null)

    useEffect(() => {
        fetchFiles()
    }, [contractId])

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/attachments?contractId=${contractId}&entityType=${entityType}`)
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files || [])
            }
        } catch (error) {
            console.error('Failed to fetch files:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (selectedFiles: File[]) => {
        for (const file of selectedFiles) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('entity_type', entityType)
            formData.append('entity_id', contractId.toString())

            const res = await fetch('/api/attachments', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                await fetchFiles() // Refresh list
            }
        }
    }

    const handleDelete = async (fileId: number, filename: string) => {
        if (!confirm(`Delete ${filename}?`)) return

        setDeleting(fileId)
        try {
            const res = await fetch(`/api/attachments?id=${fileId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== fileId))
            } else {
                alert('Failed to delete file')
            }
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete file')
        } finally {
            setDeleting(null)
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

    if (loading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
                    </div>
                    {canUpload && (
                        <FileUpload
                            onUpload={handleUpload}
                            label="Upload"
                            multiple={true}
                            maxSizeMB={50}
                        />
                    )}
                </div>

                {files.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📁</div>
                        <p className="text-gray-400 mb-2">No files uploaded yet</p>
                        {canUpload && (
                            <p className="text-sm text-gray-500">Upload files to share with your {entityType === 'contract' ? 'contract partner' : 'team'}</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-3xl">{getFileIcon(file.mime_type)}</span>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-white font-medium truncate">{file.filename}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span>{formatFileSize(file.size)}</span>
                                                <span>•</span>
                                                <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
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
                                        {canUpload && (
                                            <button
                                                onClick={() => handleDelete(file.id, file.filename)}
                                                disabled={deleting === file.id}
                                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {deleting === file.id ? '...' : '🗑️'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {viewingFile && (
                <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
            )}
        </>
    )
}
