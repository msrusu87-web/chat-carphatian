/**
 * AI Module Exports
 * 
 * Built by Carphatian
 */

// Core OpenAI client
export {
  getOpenAI,
  isAIEnabled,
  AIModels,
  generateEmbedding,
  generateCompletion,
} from './openai'

// Job matching
export {
  findMatchingJobsForFreelancer,
  findMatchingFreelancersForJob,
  explainJobMatch,
} from './job-matching'

// Content generation
export {
  generateJobDescription,
  generateProposal,
  generateMessageReply,
  improveText,
  generateBioSuggestions,
} from './content-generation'

// Chatbot
export {
  getChatbotResponse,
  getQuickAnswer,
  analyzeIntent,
  type ChatMessage,
} from './chatbot'
