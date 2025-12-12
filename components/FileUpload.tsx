'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
    onUpload: (files: File[]) => Promise<void>
    accept?: string
    multiple?: boolean
    maxSizeMB?: number
    label?: string
}

export default function FileUpload({
    onUpload,
    accept = '*',
    multiple = true,
    maxSizeMB = 50,
    label = 'Upload Files'
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length === 0) return

        // Validate file sizes
        const maxSize = maxSizeMB * 1024 * 1024
        const oversizedFiles = selectedFiles.filter(f => f.size > maxSize)

        if (oversizedFiles.length > 0) {
            setError(`Some files exceed ${maxSizeMB}MB limit`)
            return
        }

        setError('')
        setUploading(true)

        try {
            await onUpload(selectedFiles)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Uploading...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {label}
                    </>
                )}
            </label>
            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
        </div>
    )
}
