/**
 * Database Schema Definition
 * 
 * This file defines the entire database schema using Drizzle ORM.
 * Drizzle is a TypeScript-first ORM that gives us:
 * - Full type safety
 * - SQL-like syntax
 * - Automatic migrations
 * - Edge runtime support
 * 
 * Database: PostgreSQL with pgvector extension (runs in Docker)
 * 
 * Schema Overview:
 * - users: Core user accounts (email, password, role)
 * - profiles: Extended user information with AI embeddings
 * - jobs: Posted jobs with budget, timeline, requirements
 * - applications: Freelancer proposals for jobs
 * - contracts: Accepted work agreements
 * - milestones: Payment milestones within contracts
 * - messages: Real-time chat between users
 * - payments: Payment transactions and escrow
 * - reviews: Ratings and feedback
 * - ai_providers: AI model configuration
 * - ai_routing_rules: Smart AI provider selection
 * 
 * Built by Carphatian
 */

import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, index, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =========================================
// ENUMS - Predefined Status Values
// =========================================

/**
 * User Role Enum
 * 
 * Defines the three types of users in our platform:
 * - client: Posts jobs and hires freelancers
 * - freelancer: Applies to jobs and completes work
 * - admin: Platform administrator with full access
 */
export const userRoleEnum = pgEnum('user_role', ['client', 'freelancer', 'admin'])

/**
 * Job Status Enum
 * 
 * Lifecycle of a job posting:
 * - draft: Being created, not yet published
 * - open: Published and accepting applications
 * - in_progress: Work has started
 * - completed: Work finished successfully
 * - cancelled: Job was cancelled
 */
export const jobStatusEnum = pgEnum('job_status', ['draft', 'open', 'in_progress', 'completed', 'cancelled'])

/**
 * Application Status Enum
 * 
 * Status of a freelancer's application:
 * - pending: Waiting for client review
 * - accepted: Client accepted this proposal
 * - rejected: Client declined this proposal
 * - withdrawn: Freelancer cancelled their application
 */
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'accepted', 'rejected', 'withdrawn'])

/**
 * Contract Status Enum
 * 
 * Status of work contract:
 * - active: Currently working
 * - paused: Temporarily stopped
 * - completed: Work finished successfully
 * - cancelled: Contract terminated early
 * - disputed: In dispute resolution
 */
export const contractStatusEnum = pgEnum('contract_status', ['active', 'paused', 'completed', 'cancelled', 'disputed'])

/**
 * Milestone Status Enum
 * 
 * Payment milestone states:
 * - pending: Not yet funded
 * - in_escrow: Client paid, funds held in escrow
 * - released: Funds released to freelancer
 * - refunded: Funds returned to client
 */
export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'in_escrow', 'released', 'refunded'])

/**
 * Payment Status Enum
 * 
 * Transaction status:
 * - pending: Initiated but not processed
 * - processing: Being processed by payment provider
 * - completed: Successfully processed
 * - failed: Payment failed
 * - refunded: Money returned
 */
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded'])

/**
 * AI Provider Enum
 * 
 * Supported AI providers:
 * - openai: GPT-4, GPT-3.5
 * - groq: Fast Llama models (free tier!)
 * - anthropic: Claude models
 */
export const aiProviderEnum = pgEnum('ai_provider', ['openai', 'groq', 'anthropic'])

// =========================================
// CORE TABLES
// =========================================

/**
 * Users Table
 * 
 * Core authentication and user management.
 * This is the foundation table - every user has an entry here.
 * 
 * Fields:
 * - id: Auto-incrementing primary key
 * - email: Unique email address (used for login)
 * - password_hash: Bcrypt hashed password (never store plain text!)
 * - role: User type (client, freelancer, admin)
 * - email_verified: Whether email is verified
 * - created_at: Account creation timestamp
 * - updated_at: Last modification timestamp
 */
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('client'),
  email_verified: boolean('email_verified').notNull().default(false),
  stripe_account_id: varchar('stripe_account_id', { length: 255 }), // Stripe Connect account for freelancers
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Index on email for fast lookups during login
  emailIdx: index('users_email_idx').on(table.email),
}))

/**
 * Profiles Table
 * 
 * Extended user information beyond basic auth.
 * Contains public profile data and AI embeddings for matching.
 * 
 * Key Features:
 * - full_name, bio, avatar: Public profile info
 * - hourly_rate: Freelancer pricing (null for clients)
 * - skills: JSON array of skills ["React", "Node.js", "AI"]
 * - profile_embedding: Vector(1536) for AI-powered matching
 *   Generated from user's bio + skills using OpenAI embeddings
 *   Used for semantic search and job matching
 * 
 * Why separate from users table?
 * - Keeps auth table lean
 * - Allows nullable fields for incomplete profiles
 * - Better organization of concerns
 */
export const profiles = pgTable('profiles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  full_name: varchar('full_name', { length: 255 }),
  bio: text('bio'),
  avatar_url: text('avatar_url'),
  hourly_rate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  location: varchar('location', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  skills: jsonb('skills').$type<string[]>().default([]),
  // Enhanced profile fields
  title: varchar('title', { length: 255 }), // Professional title (e.g., "Senior React Developer")
  experience_years: integer('experience_years'), // Years of experience
  education: text('education'), // Educational background
  certifications: jsonb('certifications').$type<string[]>().default([]), // List of certifications
  languages: jsonb('languages').$type<{ language: string, proficiency: string }[]>().default([]), // Languages spoken
  availability: varchar('availability', { length: 100 }), // e.g., "Full-time", "Part-time", "20 hrs/week"
  timezone: varchar('timezone', { length: 100 }), // User's timezone
  company_name: varchar('company_name', { length: 255 }), // For clients - company name
  company_size: varchar('company_size', { length: 50 }), // For clients - "1-10", "11-50", etc.
  industry: varchar('industry', { length: 100 }), // For clients - industry sector
  website: varchar('website', { length: 255 }), // Portfolio or company website
  linkedin: varchar('linkedin', { length: 255 }), // LinkedIn profile
  github: varchar('github', { length: 255 }), // GitHub profile (for developers)
  // Stats for matching algorithm
  total_jobs_completed: integer('total_jobs_completed').default(0),
  success_rate: decimal('success_rate', { precision: 5, scale: 2 }).default('0'), // 0-100%
  average_response_time: integer('average_response_time'), // in hours
  // AI Embedding for semantic matching (1536 dimensions from OpenAI)
  // This allows us to find freelancers whose skills match job requirements
  // even when they use different wording
  profile_embedding: text('profile_embedding'), // Will store as JSON array of numbers
  // Email notification preferences
  email_preferences: jsonb('email_preferences').$type<{
    applications: boolean // Notifications about job applications
    messages: boolean // New message notifications
    payments: boolean // Payment notifications
    reviews: boolean // Review requests
    marketing: boolean // Platform updates and tips
  }>().default({
    applications: true,
    messages: true,
    payments: true,
    reviews: true,
    marketing: false,
  }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('profiles_user_id_idx').on(table.user_id),
  // Unique constraint: one profile per user
  userIdUnique: unique('profiles_user_id_unique').on(table.user_id),
}))

/**
 * Jobs Table
 * 
 * Job postings created by clients.
 * Contains all job details, requirements, budget, and AI embeddings.
 * 
 * Important Fields:
 * - title, description: Job details
 * - budget_min, budget_max: Payment range
 * - timeline: Expected completion time
 * - required_skills: JSON array of required skills
 * - scope_embedding: Vector(1536) for semantic job matching
 *   Generated from title + description + required skills
 *   Used to match jobs with relevant freelancers
 * 
 * Status Flow:
 * draft → open → in_progress → completed
 *              ↘ cancelled
 */
export const jobs = pgTable('jobs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  client_id: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  budget_min: decimal('budget_min', { precision: 10, scale: 2 }),
  budget_max: decimal('budget_max', { precision: 10, scale: 2 }),
  timeline: varchar('timeline', { length: 100 }), // e.g., "2 weeks", "1 month"
  required_skills: jsonb('required_skills').$type<string[]>().default([]),
  status: jobStatusEnum('status').notNull().default('draft'),
  // AI Embedding for job matching
  scope_embedding: text('scope_embedding'), // JSON array of 1536 numbers
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index('jobs_client_id_idx').on(table.client_id),
  statusIdx: index('jobs_status_idx').on(table.status),
  createdAtIdx: index('jobs_created_at_idx').on(table.created_at),
}))

/**
 * Applications Table
 * 
 * Freelancer proposals for jobs.
 * Each application is a freelancer's bid to work on a specific job.
 * 
 * Fields:
 * - cover_letter: Freelancer's pitch (can be AI-generated!)
 * - proposed_rate: Freelancer's proposed hourly/fixed rate
 * - estimated_hours: How long they think it will take
 * - status: pending | accepted | rejected | withdrawn
 * 
 * Business Logic:
 * - Freelancers can submit multiple applications (different jobs)
 * - One application per freelancer per job (unique constraint)
 * - When accepted, creates a Contract automatically
 */
export const applications = pgTable('applications', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  job_id: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  freelancer_id: integer('freelancer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cover_letter: text('cover_letter').notNull(),
  proposed_rate: decimal('proposed_rate', { precision: 10, scale: 2 }).notNull(),
  estimated_hours: integer('estimated_hours'),
  status: applicationStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  jobIdIdx: index('applications_job_id_idx').on(table.job_id),
  freelancerIdIdx: index('applications_freelancer_id_idx').on(table.freelancer_id),
  statusIdx: index('applications_status_idx').on(table.status),
  // One application per freelancer per job
  jobFreelancerUnique: unique('applications_job_freelancer_unique').on(table.job_id, table.freelancer_id),
}))

/**
 * Contracts Table
 * 
 * Active work agreements between client and freelancer.
 * Created when a client accepts an application.
 * 
 * Contract Lifecycle:
 * 1. Client accepts application → Contract created (active)
 * 2. Work progresses → Milestones funded and released
 * 3. Work completed → Contract marked completed
 * 
 * Fields:
 * - total_amount: Total contract value
 * - platform_fee: Our 15% marketplace fee
 * - start_date: When work began
 * - end_date: When work finished (null if ongoing)
 * - status: active | paused | completed | cancelled | disputed
 */
export const contracts = pgTable('contracts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  job_id: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  client_id: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  freelancer_id: integer('freelancer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  platform_fee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(), // 15% of total_amount
  status: contractStatusEnum('status').notNull().default('active'),
  start_date: timestamp('start_date').notNull().defaultNow(),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  jobIdIdx: index('contracts_job_id_idx').on(table.job_id),
  clientIdIdx: index('contracts_client_id_idx').on(table.client_id),
  freelancerIdIdx: index('contracts_freelancer_id_idx').on(table.freelancer_id),
  statusIdx: index('contracts_status_idx').on(table.status),
}))

/**
 * Milestones Table
 * 
 * Payment milestones within a contract.
 * Breaks large contracts into smaller, escrow-protected payments.
 * 
 * How Escrow Works:
 * 1. Client creates milestone → status: pending
 * 2. Client funds milestone → status: in_escrow (money held by platform)
 * 3. Freelancer completes work → Requests release
 * 4. Client approves → status: released (money sent to freelancer)
 * 
 * This protects both parties:
 * - Freelancer knows money is secured
 * - Client only releases when satisfied
 * 
 * Fields:
 * - title: Milestone name ("Design mockups", "Frontend implementation")
 * - amount: Payment for this milestone
 * - due_date: Expected completion
 * - status: pending | in_escrow | released | refunded
 */
export const milestones = pgTable('milestones', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  contract_id: integer('contract_id').notNull().references(() => contracts.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  due_date: timestamp('due_date'),
  status: milestoneStatusEnum('status').notNull().default('pending'),
  released_at: timestamp('released_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  contractIdIdx: index('milestones_contract_id_idx').on(table.contract_id),
  statusIdx: index('milestones_status_idx').on(table.status),
}))

/**
 * Messages Table
 * 
 * Real-time chat between users.
 * Powers the messaging system for client-freelancer communication.
 * 
 * Features:
 * - Direct messaging between any two users
 * - File attachments support (URLs to uploaded files)
 * - Read receipts (read_at timestamp)
 * 
 * Message Flow:
 * 1. User sends message → created with read_at = null
 * 2. Recipient sees message → read_at updated
 * 3. Both users can see conversation history
 * 
 * Optional: Could be enhanced with:
 * - Typing indicators
 * - Message reactions
 * - Thread replies
 */
export const messages = pgTable('messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  sender_id: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipient_id: integer('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  attachment_url: text('attachment_url'), // File upload URL if message has attachment
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  senderIdIdx: index('messages_sender_id_idx').on(table.sender_id),
  recipientIdIdx: index('messages_recipient_id_idx').on(table.recipient_id),
  createdAtIdx: index('messages_created_at_idx').on(table.created_at),
}))

/**
 * Payments Table
 * 
 * All payment transactions in the platform.
 * Tracks money flow: client → escrow → freelancer
 * 
 * Payment Types:
 * - deposit: Client funds milestone (goes to escrow)
 * - release: Escrow releases to freelancer
 * - refund: Money returned to client
 * - platform_fee: Our 15% cut
 * 
 * Important Fields:
 * - stripe_payment_id: Reference to Stripe transaction
 * - amount: Transaction amount
 * - status: pending | processing | completed | failed | refunded
 * - metadata: Additional info (JSON)
 */
export const payments = pgTable('payments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contract_id: integer('contract_id').references(() => contracts.id, { onDelete: 'set null' }),
  milestone_id: integer('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  stripe_payment_id: varchar('stripe_payment_id', { length: 255 }),
  payment_method: varchar('payment_method', { length: 100 }), // "card", "bank_transfer"
  metadata: jsonb('metadata'), // Additional payment details
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.user_id),
  contractIdIdx: index('payments_contract_id_idx').on(table.contract_id),
  statusIdx: index('payments_status_idx').on(table.status),
}))

/**
 * Reviews Table
 * 
 * Ratings and feedback after contract completion.
 * Both client and freelancer can review each other.
 * 
 * Fields:
 * - rating: 1-5 stars
 * - comment: Written feedback
 * - reviewer_id: Who wrote the review
 * - reviewee_id: Who is being reviewed
 * 
 * Business Rules:
 * - Only one review per user per contract
 * - Can only review after contract is completed
 * - Reviews are public (build trust!)
 */
export const reviews = pgTable('reviews', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  contract_id: integer('contract_id').notNull().references(() => contracts.id, { onDelete: 'cascade' }),
  reviewer_id: integer('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reviewee_id: integer('reviewee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  contractIdIdx: index('reviews_contract_id_idx').on(table.contract_id),
  revieweeIdIdx: index('reviews_reviewee_id_idx').on(table.reviewee_id),
  // One review per reviewer per contract
  reviewerContractUnique: unique('reviews_reviewer_contract_unique').on(table.reviewer_id, table.contract_id),
}))

/**
 * Portfolio Items Table
 * 
 * Showcase work samples for freelancers.
 * Each portfolio item represents a completed project.
 * 
 * Fields:
 * - title: Project name
 * - description: What was built
 * - tech_stack: Technologies used (JSON array)
 * - image_url: Project screenshot/thumbnail
 * - project_url: Live demo link
 * - completion_date: When project was finished
 */
export const portfolios = pgTable('portfolios', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  tech_stack: jsonb('tech_stack').$type<string[]>().default([]),
  image_url: text('image_url'),
  project_url: text('project_url'),
  completion_date: timestamp('completion_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('portfolios_user_id_idx').on(table.user_id),
}))

/**
 * Attachments Table
 * 
 * Store file attachments for contracts, messages, and deliverables
 */
export const attachments = pgTable('attachments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  entity_type: varchar('entity_type', { length: 50 }).notNull(), // contract, message, deliverable, documentation
  entity_id: integer('entity_id').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  url: text('url').notNull(),
  mime_type: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(), // in bytes
  uploaded_by: integer('uploaded_by').notNull().references(() => users.id),
  uploaded_at: timestamp('uploaded_at').notNull().defaultNow(),
  // Deliverable submission tracking
  submission_status: varchar('submission_status', { length: 20 }).default('draft'), // draft, submitted
  submitted_at: timestamp('submitted_at'),
  // Approval workflow
  approval_status: varchar('approval_status', { length: 20 }).default('pending'), // pending, approved, rejected
  feedback: text('feedback'),
  reviewed_at: timestamp('reviewed_at'),
  reviewed_by: integer('reviewed_by').references(() => users.id),
}, (table) => ({
  entityIdx: index('attachments_entity_idx').on(table.entity_type, table.entity_id),
  uploadedByIdx: index('attachments_uploaded_by_idx').on(table.uploaded_by),
  submissionStatusIdx: index('attachments_submission_status_idx').on(table.submission_status),
  approvalStatusIdx: index('attachments_approval_status_idx').on(table.approval_status),
}))

// =========================================
// AI CONFIGURATION TABLES
// =========================================

/**
 * AI Providers Table
 * 
 * Configuration for AI model providers.
 * Allows dynamic switching between OpenAI, Groq, Anthropic.
 * 
 * Why This Matters:
 * - Cost optimization: Use free Groq when possible
 * - Redundancy: Failover if one provider is down
 * - A/B testing: Compare model quality
 * 
 * Fields:
 * - name: openai | groq | anthropic
 * - api_key: Encrypted API key (NEVER store plain text!)
 * - model: Specific model name ("gpt-4", "llama-3-70b", "claude-3-5-sonnet")
 * - is_active: Toggle provider on/off from admin panel
 * - priority: Lower number = higher priority (1 = try first)
 * - monthly_budget: Spending limit in USD
 * - monthly_spend: Current month's spend (reset monthly)
 */
export const aiProviders = pgTable('ai_providers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: aiProviderEnum('name').notNull().unique(),
  api_key_encrypted: text('api_key_encrypted').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  is_active: boolean('is_active').notNull().default(true),
  priority: integer('priority').notNull().default(1),
  monthly_budget: decimal('monthly_budget', { precision: 10, scale: 2 }),
  monthly_spend: decimal('monthly_spend', { precision: 10, scale: 2 }).default('0'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * AI Routing Rules Table
 * 
 * Smart routing of AI tasks to optimal providers.
 * Different tasks need different models!
 * 
 * Examples:
 * - Job drafts: Use fast Groq (free!) for speed
 * - Cover letters: Use GPT-4 for quality
 * - Embeddings: Use OpenAI (best quality)
 * - Simple Q&A: Use Groq (cost-effective)
 * 
 * Task Types:
 * - job_draft: Generate job description
 * - cover_letter: Generate application letter
 * - embedding: Create vector embeddings
 * - semantic_search: Search with embeddings
 * - chat_completion: General AI chat
 * 
 * How Routing Works:
 * 1. Admin creates rule: "job_draft" → use "groq"
 * 2. User requests job draft
 * 3. System checks routing rules
 * 4. Sends request to Groq
 * 5. If Groq fails → Fallback to GPT-4
 */
export const aiRoutingRules = pgTable('ai_routing_rules', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  task_type: varchar('task_type', { length: 100 }).notNull().unique(),
  provider_id: integer('provider_id').notNull().references(() => aiProviders.id, { onDelete: 'cascade' }),
  fallback_provider_id: integer('fallback_provider_id').references(() => aiProviders.id, { onDelete: 'set null' }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

// =========================================
// RELATIONS (For Drizzle Query API)
// =========================================

/**
 * Define table relationships for easier querying.
 * Drizzle uses these to automatically join tables.
 * 
 * Example Query:
 * ```ts
 * const jobsWithApplications = await db.query.jobs.findMany({
 *   with: {
 *     applications: true,
 *     client: true
 *   }
 * })
 * ```
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.user_id],
  }),
  jobs: many(jobs),
  applications: many(applications),
  sentMessages: many(messages, { relationName: 'sent' }),
  receivedMessages: many(messages, { relationName: 'received' }),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.user_id],
    references: [users.id],
  }),
}))

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.client_id],
    references: [users.id],
  }),
  applications: many(applications),
  contracts: many(contracts),
}))

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.job_id],
    references: [jobs.id],
  }),
  freelancer: one(users, {
    fields: [applications.freelancer_id],
    references: [users.id],
  }),
}))

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  job: one(jobs, {
    fields: [contracts.job_id],
    references: [jobs.id],
  }),
  client: one(users, {
    fields: [contracts.client_id],
    references: [users.id],
  }),
  freelancer: one(users, {
    fields: [contracts.freelancer_id],
    references: [users.id],
  }),
  milestones: many(milestones),
  reviews: many(reviews),
}))

export const milestonesRelations = relations(milestones, ({ one }) => ({
  contract: one(contracts, {
    fields: [milestones.contract_id],
    references: [contracts.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
    relationName: 'sent',
  }),
  recipient: one(users, {
    fields: [messages.recipient_id],
    references: [users.id],
    relationName: 'received',
  }),
}))

export const aiProvidersRelations = relations(aiProviders, ({ many }) => ({
  routingRules: many(aiRoutingRules),
}))

export const aiRoutingRulesRelations = relations(aiRoutingRules, ({ one }) => ({
  provider: one(aiProviders, {
    fields: [aiRoutingRules.provider_id],
    references: [aiProviders.id],
  }),
  fallbackProvider: one(aiProviders, {
    fields: [aiRoutingRules.fallback_provider_id],
    references: [aiProviders.id],
  }),
}))

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  user: one(users, {
    fields: [portfolios.user_id],
    references: [users.id],
  }),
}))

// =========================================
// AUTHENTICATION TOKENS
// =========================================

/**
 * Verification Tokens Table
 * 
 * Stores tokens for email verification and password reset.
 * Tokens are one-time use and expire after a set period.
 * 
 * Types:
 * - email_verification: Verify email address after signup
 * - password_reset: Reset forgotten password
 * 
 * Security:
 * - Token is hashed before storage
 * - Expires after 24 hours (configurable)
 * - Deleted after use
 */
export const verificationTokens = pgTable('verification_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'email_verification' | 'password_reset'
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('verification_tokens_user_id_idx').on(table.user_id),
  tokenIdx: index('verification_tokens_token_idx').on(table.token),
  expiresAtIdx: index('verification_tokens_expires_at_idx').on(table.expires_at),
}))

// =========================================
// PLATFORM SETTINGS
// =========================================

/**
 * Platform Settings Table
 * 
 * Stores global configuration for the platform including:
 * - SMTP email configuration
 * - Payment settings
 * - Feature flags
 * - API keys (encrypted)
 * 
 * Settings are stored as key-value pairs with optional encryption
 * for sensitive values like passwords and API keys.
 */
export const platformSettings = pgTable('platform_settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  encrypted: boolean('encrypted').notNull().default(false),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  description: text('description'),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  updated_by: integer('updated_by').references(() => users.id),
}, (table) => ({
  keyIdx: index('platform_settings_key_idx').on(table.key),
  categoryIdx: index('platform_settings_category_idx').on(table.category),
}))

// =========================================
// NOTIFICATIONS
// =========================================

/**
 * Notification Type Enum
 */
export const notificationTypeEnum = pgEnum('notification_type', [
  'message',
  'application',
  'contract',
  'payment',
  'review',
  'job',
  'milestone',
  'system',
])

/**
 * Notifications Table
 * 
 * Stores user notifications for various platform events.
 */
export const notifications = pgTable('notifications', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  link: varchar('link', { length: 500 }),
  read: boolean('read').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  metadata: text('metadata'), // JSON string for extra data
}, (table) => ({
  userIdIdx: index('notifications_user_id_idx').on(table.user_id),
  readIdx: index('notifications_read_idx').on(table.read),
  createdAtIdx: index('notifications_created_at_idx').on(table.created_at),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
}))
