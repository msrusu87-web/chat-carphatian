/**
 * AI Job Draft Generation API
 * 
 * POST /api/ai/job-draft
 * 
 * Generates professional job descriptions using AI.
 * Uses OpenAI GPT-4 directly (no microservice needed).
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import OpenAI from 'openai'
import { z } from 'zod'

// Request validation schema - simplified
const jobDraftSchema = z.object({
  prompt: z.string().min(10).max(2000),
  category: z.string().optional(),
  existingJob: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
})

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user as { role?: string }
    
    // Only clients and admins can generate job drafts
    if (user.role !== 'client' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only clients can generate job drafts' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = jobDraftSchema.parse(body)

    // Build system prompt
    const systemPrompt = `You are an expert job description writer for a freelance marketplace. 
Generate a professional, compelling job posting based on the user's requirements.

Return a JSON object with this structure:
{
  "title": "Professional job title",
  "description": "Detailed job description (2-3 paragraphs)",
  "responsibilities": ["Responsibility 1", "Responsibility 2", "..."],
  "requirements": ["Requirement 1", "Requirement 2", "..."],
  "nice_to_have": ["Nice to have 1", "Nice to have 2", "..."]
}

Make it engaging and clear. Focus on attracting qualified freelancers.`

    // Build user prompt
    let userPrompt = validatedData.prompt
    if (validatedData.category) {
      userPrompt = `Category: ${validatedData.category}\n\n${userPrompt}`
    }
    if (validatedData.existingJob) {
      userPrompt = `Improve this existing job posting:\n\nTitle: ${validatedData.existingJob.title}\n\nDescription: ${validatedData.existingJob.description}\n\nUser's instructions: ${userPrompt}`
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Job draft generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate job draft' },
      { status: 500 }
    )
  }
}
