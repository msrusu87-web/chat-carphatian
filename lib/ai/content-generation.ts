/**
 * AI Content Generation
 * 
 * Generate content like job descriptions, proposals, and messages.
 * 
 * Built by Carphatian
 */

import { generateCompletion, AIModels } from './openai'

/**
 * Generate a job description from basic info
 */
export async function generateJobDescription(input: {
  title: string
  skills: string[]
  budget?: { min?: number; max?: number }
  timeline?: string
  additionalInfo?: string
}): Promise<{
  description: string
  suggestedSkills: string[]
} | null> {
  const prompt = `
Generate a professional job posting description for a freelance marketplace.

Job Title: ${input.title}
Required Skills: ${input.skills.join(', ')}
Budget: ${input.budget?.min && input.budget?.max ? `$${input.budget.min} - $${input.budget.max}` : 'Flexible'}
Timeline: ${input.timeline || 'Flexible'}
Additional Context: ${input.additionalInfo || 'None provided'}

Generate:
1. A compelling job description (200-300 words) that includes:
   - Project overview
   - Key responsibilities
   - Deliverables
   - Ideal candidate qualities

2. 5 additional relevant skills that could be useful

Format your response as JSON:
{
  "description": "...",
  "suggestedSkills": ["skill1", "skill2", ...]
}
`

  const result = await generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: 'You are a professional copywriter specializing in job postings for tech freelancers. Always respond with valid JSON.',
  })

  if (!result) return null

  try {
    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('[AI] Failed to parse job description response:', e)
    return null
  }
}

/**
 * Generate a proposal/cover letter for a job application
 */
export async function generateProposal(input: {
  jobTitle: string
  jobDescription: string
  freelancerName: string
  freelancerSkills: string[]
  freelancerBio?: string
  proposedRate?: number
  timeline?: string
}): Promise<string | null> {
  const prompt = `
Generate a professional proposal/cover letter for a freelancer applying to a job.

Job: ${input.jobTitle}
Job Description: ${input.jobDescription.slice(0, 500)}

Freelancer: ${input.freelancerName}
Skills: ${input.freelancerSkills.join(', ')}
Bio: ${input.freelancerBio?.slice(0, 200) || 'Experienced professional'}
${input.proposedRate ? `Proposed Rate: $${input.proposedRate}/hr` : ''}
${input.timeline ? `Available Timeline: ${input.timeline}` : ''}

Write a compelling, personalized proposal (150-200 words) that:
1. Shows understanding of the project needs
2. Highlights relevant experience and skills
3. Proposes a clear approach or solution
4. Ends with a call to action

Be professional but personable. Avoid generic statements.
`

  return generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 400,
    temperature: 0.7,
    systemPrompt: 'You are helping a freelancer write winning proposals. Be specific and avoid clichés.',
  })
}

/**
 * Generate a professional message response
 */
export async function generateMessageReply(input: {
  context: string // Previous messages or conversation context
  senderName: string
  recipientName: string
  purpose: 'inquiry' | 'followup' | 'clarification' | 'milestone' | 'payment' | 'general'
}): Promise<string | null> {
  const purposeGuides = {
    inquiry: 'Respond professionally to their inquiry with helpful information.',
    followup: 'Follow up on the previous conversation professionally.',
    clarification: 'Ask for or provide clarification in a friendly manner.',
    milestone: 'Discuss milestone completion or requirements.',
    payment: 'Address payment-related matters professionally.',
    general: 'Respond appropriately to the conversation.',
  }

  const prompt = `
Generate a professional message reply for a freelance marketplace conversation.

From: ${input.recipientName}
To: ${input.senderName}
Context: ${input.context.slice(0, 500)}

Purpose: ${purposeGuides[input.purpose]}

Write a brief, professional message (50-100 words) that:
1. Addresses their points directly
2. Maintains a friendly, professional tone
3. Is clear and actionable
`

  return generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 200,
    temperature: 0.7,
    systemPrompt: 'You are helping write professional messages. Be concise and friendly.',
  })
}

/**
 * Improve/polish existing text
 */
export async function improveText(
  text: string,
  type: 'bio' | 'proposal' | 'message' | 'jobDescription'
): Promise<string | null> {
  const typeGuides = {
    bio: 'Improve this freelancer bio to be more compelling and professional.',
    proposal: 'Polish this proposal to be more persuasive and clear.',
    message: 'Refine this message to be clearer and more professional.',
    jobDescription: 'Improve this job description to attract better candidates.',
  }

  const prompt = `
${typeGuides[type]}

Original text:
"""
${text}
"""

Provide an improved version that:
1. Fixes any grammar or spelling issues
2. Improves clarity and flow
3. Makes it more engaging
4. Maintains the original intent and key information

Only return the improved text, no explanations.
`

  return generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 500,
    temperature: 0.5,
    systemPrompt: 'You are a professional editor. Only return the improved text.',
  })
}

/**
 * Generate profile bio suggestions
 */
export async function generateBioSuggestions(input: {
  skills: string[]
  experience?: number
  specialization?: string
}): Promise<string[] | null> {
  const prompt = `
Generate 3 different professional bio options for a freelancer profile.

Skills: ${input.skills.join(', ')}
Years of Experience: ${input.experience || 'Not specified'}
Specialization: ${input.specialization || 'General'}

Create 3 different bios (each 50-80 words) with different tones:
1. Professional and formal
2. Friendly and approachable
3. Results-focused and confident

Format as JSON array: ["bio1", "bio2", "bio3"]
`

  const result = await generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 500,
    temperature: 0.8,
    systemPrompt: 'You help freelancers create compelling profiles. Respond only with JSON array.',
  })

  if (!result) return null

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    return null
  }
}
