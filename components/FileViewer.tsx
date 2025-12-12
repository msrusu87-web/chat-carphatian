'use client'

import { useState } from 'react'

interface FileAttachment {
    id: number
    filename: string
    url: string
    mime_type: string
    size: number
    uploaded_at: Date
}

interface FileViewerProps {
    file: FileAttachment
    onClose: () => void
}

export default function FileViewer({ file, onClose }: FileViewerProps) {
    const [imageError, setImageError] = useState(false)

    const isImage = file.mime_type.startsWith('image/')
    const isPDF = file.mime_type === 'application/pdf'
    const isText = file.mime_type.startsWith('text/') ||
        file.mime_type === 'application/json' ||
        file.mime_type === 'application/xml'

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-700 p-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-semibold">{file.filename}</h3>
                        <p className="text-gray-400 text-sm">
                            {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={file.url}
                            download={file.filename}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Download
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-gray-900">
                    {isImage && !imageError && (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <img
                                src={file.url}
                                alt={file.filename}
                                className="max-w-full max-h-[70vh] h-auto mx-auto rounded-lg shadow-2xl"
                                onError={() => setImageError(true)}
                                onLoad={(e) => {
                                    console.log('Image loaded successfully:', file.url)
                                }}
                            />
                        </div>
                    )}

                    {isImage && imageError && (
                        <div className="text-center py-12">
                            <svg className="w-20 h-20 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-white font-semibold mb-2">Failed to Load Image</h3>
                            <p className="text-gray-400 mb-4">The image could not be displayed</p>
                            <a
                                href={file.url}
                                download={file.filename}
                                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download Instead
                            </a>
                        </div>
                    )}

                    {isPDF && (
                        <iframe
                            src={file.url}
                            className="w-full h-full min-h-[600px] rounded-lg"
                            title={file.filename}
                        />
                    )}

                    {isText && (
                        <div className="bg-gray-800 rounded-lg p-4">
                            <iframe
                                src={file.url}
                                className="w-full h-full min-h-[600px] bg-white rounded"
                                title={file.filename}
                            />
                        </div>
                    )}

                    {!isImage && !isPDF && !isText && (
                        <div className="text-center py-12">
                            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-white font-semibold mb-2">Preview Not Available</h3>
                            <p className="text-gray-400 mb-4">
                                This file type cannot be previewed in the browser
                            </p>
                            <a
                                href={file.url}
                                download={file.filename}
                                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
