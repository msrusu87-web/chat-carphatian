/**
 * Portfolio API
 * Manage freelancer portfolio items
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { portfolios, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * GET /api/portfolio?userId=123
 * Fetch portfolio items for a user
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const items = await db.query.portfolios.findMany({
            where: eq(portfolios.user_id, parseInt(userId)),
            orderBy: [desc(portfolios.completion_date)],
        })

        return NextResponse.json({ portfolios: items })

    } catch (error: any) {
        console.error('Portfolio fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch portfolio' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/portfolio
 * Create new portfolio item
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!currentUser || currentUser.role !== 'freelancer') {
            return NextResponse.json({ error: 'Only freelancers can add portfolio items' }, { status: 403 })
        }

        const {
            title,
            description,
            tech_stack,
            image_url,
            project_url,
            completion_date
        } = await req.json()

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description required' }, { status: 400 })
        }

        const [portfolio] = await db.insert(portfolios).values({
            user_id: currentUser.id,
            title,
            description,
            tech_stack: tech_stack || [],
            image_url,
            project_url,
            completion_date: completion_date ? new Date(completion_date) : null,
        }).returning()

        return NextResponse.json({ portfolio }, { status: 201 })

    } catch (error: any) {
        console.error('Portfolio creation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create portfolio' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/portfolio?id=123
 * Delete portfolio item
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 })
        }

        const currentUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check ownership
        const portfolio = await db.query.portfolios.findFirst({
            where: eq(portfolios.id, parseInt(id))
        })

        if (!portfolio || portfolio.user_id !== currentUser.id) {
            return NextResponse.json({ error: 'Portfolio not found or unauthorized' }, { status: 404 })
        }

        await db.delete(portfolios).where(eq(portfolios.id, parseInt(id)))

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Portfolio deletion error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete portfolio' },
            { status: 500 }
        )
    }
}
