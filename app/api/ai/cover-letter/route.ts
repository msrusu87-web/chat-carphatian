/**
 * AI Cover Letter Generation API
 * Generate personalized cover letters based on job details and freelancer profile
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, freelancerId } = await req.json()

    if (!jobId || !freelancerId) {
      return NextResponse.json(
        { error: 'Job ID and Freelancer ID required' },
        { status: 400 }
      )
    }

    // Get freelancer profile
    const freelancer = await db.query.users.findFirst({
      where: eq(users.id, freelancerId),
    })

    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 })
    }

    // Get job details
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Build the prompt for AI
    const prompt = `You are a professional freelancer writing a compelling cover letter for a job application.

Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
Budget Range: $${job.budget_min} - $${job.budget_max}

Freelancer Email: ${freelancer.email}
Freelancer Role: ${freelancer.role}

Write a professional, personalized cover letter (2-3 paragraphs, around 150-200 words) that:
1. Shows enthusiasm for the specific job
2. Highlights relevant experience and skills that match the job requirements
3. Explains why you're a great fit for this project
4. Demonstrates value you can bring to the client
5. Has a confident, professional tone

Important: 
- Use "I" statements (first person)
- Be specific about the job requirements
- Don't make up skills or experience - focus on the skills mentioned in the job
- Keep it concise and impactful
- Don't include greetings or sign-offs, just the body of the cover letter

Generate only the cover letter text, nothing else.`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert freelancer who writes compelling, personalized cover letters that win jobs. You write concisely and professionally.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    })

    const coverLetter = completion.choices[0]?.message?.content || ''

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Failed to generate cover letter' },
        { status: 500 }
      )
    }

    return NextResponse.json({ coverLetter })

  } catch (error: any) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}
