/**
 * File Serving API Route
 * Serves uploaded files from public/uploads directory
 * Needed because standalone mode doesn't serve public folder automatically
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

interface RouteParams {
    params: Promise<{
        path: string[]
    }>
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        // Require authentication to view files
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { path } = await params
        const filePath = join(process.cwd(), 'public', 'uploads', ...path)

        // Security: prevent directory traversal
        if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
        }

        // Read the file
        const fileBuffer = await readFile(filePath)

        // Determine content type from file extension
        const ext = path[path.length - 1].split('.').pop()?.toLowerCase()
        const contentTypes: { [key: string]: string } = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'json': 'application/json',
            'xml': 'application/xml',
            'zip': 'application/zip',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }

        const contentType = contentTypes[ext || ''] || 'application/octet-stream'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })

    } catch (error: any) {
        console.error('File serving error:', error)

        if (error.code === 'ENOENT') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        )
    }
}
