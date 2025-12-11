'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import FileViewer from '@/components/FileViewer'

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
}

export default function DeliverableUploadForm({ contractId }: DeliverableUploadFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contractId', contractId.toString())
      formData.append('type', 'deliverable')

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setUploadedFiles(prev => [...prev, { ...data.file, id: Date.now() }])
    }
  }

  const handleSourceCodeUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contractId', contractId.toString())
      formData.append('type', 'source_code')

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setUploadedFiles(prev => [...prev, { ...data.file, id: Date.now() }])
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // TODO: Submit deliverables and mark contract as delivered
      alert('Deliverables submitted successfully!')
    } catch (error) {
      alert('Failed to submit deliverables')
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

  return (
    <div className="space-y-6">
      {/* Deliverables Section */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Project Deliverables</h2>
        <p className="text-gray-400 text-sm mb-4">
          Upload final deliverables, documentation, and any related files
        </p>
        
        <FileUpload
          onUpload={handleFileUpload}
          accept="*"
          label="Upload Files"
          maxSizeMB={50}
        />

        {uploadedFiles.filter(f => !f.url.includes('source_code')).length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles
              .filter(f => !f.url.includes('source_code'))
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
        
        <FileUpload
          onUpload={handleSourceCodeUpload}
          accept=".zip,.rar,.7z,.tar,.gz,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html"
          label="Upload Source Code"
          maxSizeMB={100}
        />

        {uploadedFiles.filter(f => f.url.includes('source_code')).length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles
              .filter(f => f.url.includes('source_code'))
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
          className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || uploadedFiles.length === 0}
          className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {submitting ? 'Submitting...' : 'Submit Deliverables'}
        </button>
      </div>

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
