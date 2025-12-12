/**
 * File Attachments API
 * Upload, fetch, and delete file attachments with virus scanning
 * Supports ClamAV when installed, falls back to basic validation
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { attachments, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { scanFile, isAllowedFileType } from '@/lib/security/virus-scan'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user
        const currentUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const entityType = formData.get('entity_type') as string || 'contract'
        const entityId = formData.get('entity_id') as string

        if (!file || !entityId) {
            return NextResponse.json({ error: 'File and entity ID required' }, { status: 400 })
        }

        // Validate file type
        if (!isAllowedFileType(file.name, file.type)) {
            return NextResponse.json({ 
                error: 'File type not allowed. Please upload documents, images, code, or archives only.' 
            }, { status: 400 })
        }

        // Validate file size (50MB max, 100MB for archives)
        const isArchive = /\.(zip|rar|7z|tar|gz)$/i.test(file.name)
        const maxSize = isArchive ? 100 * 1024 * 1024 : 50 * 1024 * 1024
        if (file.size > maxSize) {
            const maxSizeMB = isArchive ? '100MB' : '50MB'
            return NextResponse.json({ 
                error: `File too large (max ${maxSizeMB})` 
            }, { status: 400 })
        }

        // Create uploads directory
        const uploadsDir = join(process.cwd(), 'public', 'uploads', entityType + 's', entityId)
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

        // Scan file for viruses
        const scanResult = await scanFile(filepath)
        if (!scanResult.safe) {
            // Delete the malicious file immediately
            await unlink(filepath)
            console.warn(`Malicious file detected and removed: ${filename} - ${scanResult.virus || scanResult.error}`)
            return NextResponse.json({ 
                error: `Security threat detected: ${scanResult.virus || scanResult.error}. File has been rejected.` 
            }, { status: 400 })
        }
        console.log(`✓ File scanned (${scanResult.method}): ${filename}`)

        // Public URL - use API route for file serving in standalone mode
        const fileUrl = `/api/files/${entityType}s/${entityId}/${filename}`

        // Save to database
        const [attachment] = await db.insert(attachments).values({
            entity_type: entityType,
            entity_id: parseInt(entityId),
            filename: file.name,
            url: fileUrl,
            mime_type: file.type || 'application/octet-stream',
            size: file.size,
            uploaded_by: currentUser.id,
        }).returning()

        return NextResponse.json({
            success: true,
            file: attachment,
            url: fileUrl,
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
        const entityType = searchParams.get('entityType') || 'contract'

        if (!contractId) {
            return NextResponse.json({ error: 'Contract ID required' }, { status: 400 })
        }

        // Fetch attachments from database
        const fileList = await db.query.attachments.findMany({
            where: and(
                eq(attachments.entity_type, entityType),
                eq(attachments.entity_id, parseInt(contractId))
            ),
            orderBy: (attachments, { desc }) => [desc(attachments.uploaded_at)],
        })

        return NextResponse.json({
            files: fileList,
        })

    } catch (error: any) {
        console.error('Fetch attachments error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch attachments' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const fileId = searchParams.get('id')

        if (!fileId) {
            return NextResponse.json({ error: 'File ID required' }, { status: 400 })
        }

        // Get current user
        const currentUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get file details
        const file = await db.query.attachments.findFirst({
            where: eq(attachments.id, parseInt(fileId))
        })

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Check if user owns the file (or is admin)
        if (file.uploaded_by !== currentUser.id && currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
        }

        // Delete physical file
        try {
            const filepath = join(process.cwd(), 'public', file.url)
            await unlink(filepath)
        } catch (err) {
            console.error('Failed to delete physical file:', err)
            // Continue even if physical file deletion fails
        }

        // Delete from database
        await db.delete(attachments).where(eq(attachments.id, parseInt(fileId)))

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Delete attachment error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete attachment' },
            { status: 500 }
        )
    }
}
