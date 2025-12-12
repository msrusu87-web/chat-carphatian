/**
 * Download All Contract Files API
 * Bundles all contract files into a single ZIP download
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { contracts, attachments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import archiver from 'archiver'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any
        const contractId = parseInt(id)

        if (isNaN(contractId)) {
            return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 })
        }

        // Get URL parameters
        const { searchParams } = new URL(request.url)
        const entityType = searchParams.get('type') || 'contract'

        // Verify contract exists and user is authorized
        const contract = await db.query.contracts.findFirst({
            where: eq(contracts.id, contractId),
            with: {
                job: true,
            },
        })

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        const userId = parseInt(user.id)
        const isAuthorized = 
            contract.client_id === userId || 
            contract.freelancer_id === userId || 
            user.role === 'admin'

        if (!isAuthorized) {
            return NextResponse.json(
                { error: 'Not authorized to download these files' },
                { status: 403 }
            )
        }

        // Get all files for this contract
        const files = await db.query.attachments.findMany({
            where: and(
                eq(attachments.entity_id, contractId),
                eq(attachments.entity_type, entityType)
            ),
            orderBy: (attachments, { asc }) => [asc(attachments.uploaded_at)],
        })

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files found to download' },
                { status: 404 }
            )
        }

        // Create ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        })

        // Convert archiver to ReadableStream for Next.js response
        const stream = Readable.toWeb(archive as any) as ReadableStream

        // Set response headers
        const sanitizedJobTitle = contract.job.title.replace(/[^a-zA-Z0-9-]/g, '_')
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `${sanitizedJobTitle}_${entityType}_${timestamp}.zip`

        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err)
            throw err
        })

        // Add files to archive
        let addedFiles = 0
        for (const file of files) {
            try {
                // Convert URL path to file system path
                const filepath = join(process.cwd(), 'public', file.url)
                
                if (existsSync(filepath)) {
                    archive.append(createReadStream(filepath), { 
                        name: file.filename 
                    })
                    addedFiles++
                } else {
                    console.warn(`File not found: ${filepath}`)
                }
            } catch (fileErr) {
                console.error(`Failed to add file ${file.filename}:`, fileErr)
                // Continue with other files
            }
        }

        if (addedFiles === 0) {
            return NextResponse.json(
                { error: 'No files could be added to archive' },
                { status: 500 }
            )
        }

        // Finalize archive (this triggers the stream)
        archive.finalize()

        // Return streaming response
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        console.error('Download all files error:', error)
        return NextResponse.json(
            { error: 'Failed to create download archive' },
            { status: 500 }
        )
    }
}
