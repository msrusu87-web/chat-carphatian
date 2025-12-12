/**
 * Admin Email Settings API
 * GET: Retrieve current SMTP settings
 * POST: Save SMTP settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { platformSettings, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const SMTP_SETTINGS_KEYS = [
  'smtp_host',
  'smtp_port',
  'smtp_secure',
  'smtp_user',
  'smtp_password',
  'smtp_from_name',
  'smtp_from_email',
  'smtp_enabled',
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get all SMTP settings
    const settings = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.category, 'email'))
    
    // Convert to object
    const settingsObj: Record<string, string> = {}
    for (const setting of settings) {
      // Don't return encrypted passwords
      if (setting.key === 'smtp_password' && setting.encrypted) {
        settingsObj[setting.key] = '********'
      } else {
        settingsObj[setting.key] = setting.value || ''
      }
    }
    
    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Save each setting
    for (const key of SMTP_SETTINGS_KEYS) {
      if (body[key] !== undefined) {
        // Skip if password is placeholder
        if (key === 'smtp_password' && body[key] === '********') {
          continue
        }
        
        const isEncrypted = key === 'smtp_password'
        const value = body[key]
        
        // Upsert the setting
        const existing = await db
          .select()
          .from(platformSettings)
          .where(eq(platformSettings.key, key))
          .limit(1)
        
        if (existing.length > 0) {
          await db
            .update(platformSettings)
            .set({
              value,
              encrypted: isEncrypted,
              updated_at: new Date(),
              updated_by: user.id,
            })
            .where(eq(platformSettings.key, key))
        } else {
          await db.insert(platformSettings).values({
            key,
            value,
            encrypted: isEncrypted,
            category: 'email',
            description: `SMTP ${key.replace('smtp_', '').replace('_', ' ')}`,
            updated_by: user.id,
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
