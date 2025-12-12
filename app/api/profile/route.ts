/**
 * Profile API Route
 * GET /api/profile - Get current user's profile
 * PATCH /api/profile - Update current user's profile
 * Built by Carphatian
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Get user with profile
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        profile: {
          id: profiles.id,
          full_name: profiles.full_name,
          bio: profiles.bio,
          avatar_url: profiles.avatar_url,
          hourly_rate: profiles.hourly_rate,
          location: profiles.location,
          phone: profiles.phone,
          skills: profiles.skills,
          title: profiles.title,
          experience_years: profiles.experience_years,
          education: profiles.education,
          certifications: profiles.certifications,
          languages: profiles.languages,
          availability: profiles.availability,
          timezone: profiles.timezone,
          company_name: profiles.company_name,
          company_size: profiles.company_size,
          industry: profiles.industry,
          website: profiles.website,
          linkedin: profiles.linkedin,
          github: profiles.github,
          total_jobs_completed: profiles.total_jobs_completed,
          success_rate: profiles.success_rate,
          average_response_time: profiles.average_response_time,
          email_preferences: profiles.email_preferences,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.user_id))
      .where(eq(users.id, userId))
      .limit(1)

    if (!result[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()

    // Check if profile exists
    const existingProfile = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1)

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    }

    // Whitelist of allowed fields
    const allowedFields = [
      'full_name',
      'bio',
      'avatar_url',
      'hourly_rate',
      'location',
      'phone',
      'skills',
      'title',
      'experience_years',
      'education',
      'certifications',
      'languages',
      'availability',
      'timezone',
      'company_name',
      'company_size',
      'industry',
      'website',
      'linkedin',
      'github',
      'email_preferences',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    let updatedProfile

    if (existingProfile.length > 0) {
      // Update existing profile
      const result = await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.user_id, userId))
        .returning()

      updatedProfile = result[0]
    } else {
      // Create new profile
      const result = await db
        .insert(profiles)
        .values({
          user_id: userId,
          ...updateData,
        })
        .returning()

      updatedProfile = result[0]
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
