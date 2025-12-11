/**
 * File Attachments API
 * Upload and manage contract deliverables
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { pgTable, integer, varchar, timestamp, text } from 'drizzle-orm/pg-core'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const contractId = formData.get('contractId') as string
    const type = formData.get('type') as string || 'deliverable' // deliverable, source_code, document

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'contracts', contractId)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Public URL for file access
    const fileUrl = `/uploads/contracts/${contractId}/${filename}`

    // Save to database (you'll need to create attachments table)
    // For now, return file info
    const fileInfo = {
      filename: file.name,
      url: fileUrl,
      mime_type: file.type,
      size: file.size,
      type,
      uploaded_by: session.user.email,
      uploaded_at: new Date(),
    }

    return NextResponse.json({
      success: true,
      file: fileInfo,
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const contractId = searchParams.get('contractId')

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 })
    }

    // TODO: Fetch attachments from database
    // For now, return empty array
    return NextResponse.json({
      attachments: [],
    })

  } catch (error: any) {
    console.error('Fetch attachments error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}
