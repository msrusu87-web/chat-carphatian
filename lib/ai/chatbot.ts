/**
 * AI Chatbot Assistant
 * 
 * Provides conversational AI assistance for users.
 * Helps with platform navigation, job search, and general questions.
 * 
 * Built by Carphatian
 */

import { generateCompletion, AIModels } from './openai'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Platform knowledge base for the chatbot
 */
const PLATFORM_CONTEXT = `
You are Carpy, the helpful AI assistant for Carphatian - an AI-powered freelance marketplace.

Platform Features:
- Job posting and bidding for freelance work
- Secure milestone-based payments via Stripe
- Real-time messaging between clients and freelancers
- Portfolio and review system
- Contract management

User Roles:
- Clients: Post jobs, hire freelancers, manage contracts
- Freelancers: Browse jobs, submit proposals, deliver work
- Admins: Platform management

Common Tasks:
- Finding jobs: Browse /freelancer/jobs or use search
- Posting jobs: Go to /client/jobs/new
- Viewing applications: /client/applications or /freelancer/applications
- Messages: /client/messages or /freelancer/messages
- Profile: /freelancer/profile or /client/settings
- Payments: /freelancer/earnings or /client/payments

Be helpful, concise, and friendly. If unsure, suggest contacting support.
`

/**
 * Generate chatbot response
 */
export async function getChatbotResponse(
  messages: ChatMessage[],
  userContext?: {
    role?: 'client' | 'freelancer'
    name?: string
    currentPage?: string
  }
): Promise<string | null> {
  // Build conversation history
  const conversationHistory = messages.map(m => 
    `${m.role === 'user' ? 'User' : 'Carpy'}: ${m.content}`
  ).join('\n')

  // Add user context if available
  let contextAddition = ''
  if (userContext) {
    contextAddition = `\nCurrent user context:
- Name: ${userContext.name || 'Unknown'}
- Role: ${userContext.role || 'Unknown'}
- Current page: ${userContext.currentPage || 'Unknown'}`
  }

  const prompt = `
${PLATFORM_CONTEXT}
${contextAddition}

Conversation:
${conversationHistory}

Respond as Carpy. Be helpful and concise. If they ask about a feature, explain it clearly.
If they need to navigate somewhere, provide the path. Keep responses under 150 words.
`

  return generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 300,
    temperature: 0.7,
    systemPrompt: 'You are Carpy, a friendly AI assistant for Carphatian marketplace. Be helpful, concise, and use a professional yet friendly tone.',
  })
}

/**
 * Quick answer common questions
 */
export async function getQuickAnswer(
  question: string,
  userRole?: 'client' | 'freelancer'
): Promise<{
  answer: string
  suggestedActions?: { label: string; path: string }[]
} | null> {
  // Check for common quick questions
  const lowerQuestion = question.toLowerCase()

  // Common FAQ responses (no API call needed)
  const quickResponses: Record<string, { answer: string; suggestedActions?: { label: string; path: string }[] }> = {
    'how do i post a job': {
      answer: 'To post a job, go to your Client Dashboard and click "Post New Job". Fill in the job title, description, budget, and required skills.',
      suggestedActions: [
        { label: 'Post a Job', path: '/client/jobs/new' },
        { label: 'View My Jobs', path: '/client/jobs' },
      ],
    },
    'how do i apply for jobs': {
      answer: 'Browse available jobs in the Jobs section, find one that matches your skills, and click "Apply" to submit your proposal.',
      suggestedActions: [
        { label: 'Browse Jobs', path: '/freelancer/jobs' },
        { label: 'My Applications', path: '/freelancer/applications' },
      ],
    },
    'how do i get paid': {
      answer: 'Payments are processed through Stripe. Set up your Stripe Connect account in Settings, then receive payments when milestones are approved.',
      suggestedActions: [
        { label: 'Payment Settings', path: '/freelancer/settings' },
        { label: 'View Earnings', path: '/freelancer/earnings' },
      ],
    },
    'how do i message': {
      answer: 'You can message clients/freelancers through the Messages section. Click on a conversation to view and send messages.',
      suggestedActions: [
        { label: 'View Messages', path: userRole === 'client' ? '/client/messages' : '/freelancer/messages' },
      ],
    },
  }

  // Check for quick response matches
  for (const [key, response] of Object.entries(quickResponses)) {
    if (lowerQuestion.includes(key.replace('how do i ', '')) || lowerQuestion.includes(key)) {
      return response
    }
  }

  // Use AI for other questions
  const prompt = `
Question from a ${userRole || 'user'} on Carphatian freelance marketplace:
"${question}"

Provide a brief, helpful answer (under 100 words). Include any relevant navigation paths if applicable.

Respond as JSON:
{
  "answer": "Your helpful response",
  "suggestedActions": [{"label": "Action Name", "path": "/path"}]
}
`

  const result = await generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 200,
    temperature: 0.5,
    systemPrompt: 'You are a helpful assistant for Carphatian marketplace. Respond with JSON only.',
  })

  if (!result) return null

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    return { answer: result, suggestedActions: [] }
  }
}

/**
 * Analyze user intent from message
 */
export async function analyzeIntent(
  message: string
): Promise<{
  intent: 'question' | 'navigation' | 'complaint' | 'feature_request' | 'greeting' | 'other'
  confidence: number
  topic?: string
} | null> {
  const prompt = `
Analyze this user message from a freelance marketplace platform:
"${message}"

Classify the intent as one of:
- question: User is asking a question
- navigation: User wants to navigate somewhere
- complaint: User is expressing a problem or dissatisfaction
- feature_request: User is requesting a new feature
- greeting: User is saying hello or starting conversation
- other: Doesn't fit other categories

Respond as JSON: {"intent": "...", "confidence": 0.0-1.0, "topic": "brief topic description"}
`

  const result = await generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 100,
    temperature: 0.3,
    systemPrompt: 'Analyze user intent. Respond with JSON only.',
  })

  if (!result) return null

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    return null
  }
}
