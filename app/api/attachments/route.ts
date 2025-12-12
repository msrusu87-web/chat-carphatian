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
import { attachments, users, contracts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { scanFile, isAllowedFileType } from '@/lib/security/virus-scan'
import Pusher from 'pusher'
import { Resend } from 'resend'

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
})

const resend = new Resend(process.env.RESEND_API_KEY)

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

        // Send notifications if file uploaded to contract
        if (entityType === 'contract' || entityType === 'deliverable') {
            try {
                // Get contract details
                const contract = await db.query.contracts.findFirst({
                    where: eq(contracts.id, parseInt(entityId)),
                    with: {
                        client: true,
                        freelancer: {
                            with: {
                                profile: true,
                            },
                        },
                        job: true,
                    },
                })

                if (contract) {
                    // Determine who to notify (the other party)
                    const isUploadedByClient = currentUser.id === contract.client_id
                    const recipientUser = isUploadedByClient ? contract.freelancer : contract.client
                    const uploaderRole = isUploadedByClient ? 'client' : 'freelancer'
                    const uploaderName = isUploadedByClient 
                        ? contract.client.email 
                        : (contract.freelancer.profile?.full_name || contract.freelancer.email)

                    // Send email notification
                    const emailSubject = `📎 New File Uploaded: ${contract.job.title}`
                    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .file-info { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📎 New File Uploaded</h1>
        </div>
        <div class="content">
            <h2>Hello!</h2>
            <p>A new file has been uploaded to your contract: <strong>${contract.job.title}</strong></p>
            
            <div class="file-info">
                <p><strong>📄 Filename:</strong> ${file.name}</p>
                <p><strong>📊 Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                <p><strong>👤 Uploaded by:</strong> ${uploaderName} (${uploaderRole})</p>
                <p><strong>📅 Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>You can view and download this file from your contract page.</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isUploadedByClient ? 'freelancer' : 'client'}/contracts/${contract.id}" class="button">
                View Contract
            </a>
        </div>
        <div class="footer">
            <p>This is an automated message from Carphatian Platform</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit Platform</a></p>
        </div>
    </div>
</body>
</html>
                    `

                    await resend.emails.send({
                        from: 'Carphatian Platform <noreply@carphatian.ro>',
                        to: recipientUser.email,
                        subject: emailSubject,
                        html: emailHtml,
                    })

                    // Send Pusher notifications
                    const eventData = {
                        contractId: contract.id,
                        attachmentId: attachment.id,
                        filename: file.name,
                        fileSize: file.size,
                        uploadedBy: uploaderName,
                        uploaderRole: uploaderRole,
                        uploadedAt: new Date().toISOString(),
                    }

                    // Notify on contract channel
                    await pusher.trigger(`contract-${contract.id}`, 'file-uploaded', eventData)

                    // Notify on recipient's personal channel
                    await pusher.trigger(
                        `private-user-${recipientUser.id}`,
                        'file-uploaded',
                        {
                            ...eventData,
                            message: `${uploaderName} uploaded a new file: ${file.name}`,
                            contractTitle: contract.job.title,
                        }
                    )

                    console.log(`✓ Notifications sent for file upload: ${file.name}`)
                }
            } catch (notificationError) {
                console.error('Failed to send notifications:', notificationError)
                // Continue even if notifications fail
            }
        }

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
