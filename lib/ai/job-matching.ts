/**
 * AI Job Matching
 * 
 * Intelligent job-freelancer matching using embeddings and AI scoring.
 * 
 * Built by Carphatian
 */

import { generateEmbedding, generateCompletion, AIModels } from './openai'
import { db } from '@/lib/db'
import { jobs, profiles, users, applications } from '@/lib/db/schema'
import { eq, and, not, inArray, desc } from 'drizzle-orm'

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find best matching jobs for a freelancer
 */
export async function findMatchingJobsForFreelancer(
  freelancerId: number,
  limit: number = 10
): Promise<{
  jobs: Array<{
    job: any
    matchScore: number
    reasons: string[]
  }>
}> {
  // Get freelancer profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.user_id, freelancerId),
  })

  if (!profile) {
    return { jobs: [] }
  }

  // Get jobs freelancer hasn't applied to
  const appliedJobIds = await db.select({ jobId: applications.job_id })
    .from(applications)
    .where(eq(applications.freelancer_id, freelancerId))

  const appliedIds = appliedJobIds.map(a => a.jobId).filter(Boolean) as number[]

  // Get open jobs
  let openJobs = await db.query.jobs.findMany({
    where: appliedIds.length > 0
      ? and(eq(jobs.status, 'open'), not(inArray(jobs.id, appliedIds)))
      : eq(jobs.status, 'open'),
    with: {
      client: true,
    },
    orderBy: [desc(jobs.created_at)],
    limit: 50, // Get more for better matching
  })

  if (openJobs.length === 0) {
    return { jobs: [] }
  }

  // Generate embedding for freelancer profile
  const profileText = `
    Skills: ${profile.skills?.join(', ') || 'Not specified'}
    Bio: ${profile.bio || ''}
    Hourly Rate: ${profile.hourly_rate || 'Flexible'}
    Experience: ${profile.experience_years || 0} years
  `
  const profileEmbedding = await generateEmbedding(profileText)

  // Score and rank jobs
  const scoredJobs = await Promise.all(
    openJobs.map(async (job) => {
      let matchScore = 0
      const reasons: string[] = []

      // Skill matching
      if (profile.skills && job.required_skills) {
        const matchingSkills = profile.skills.filter(skill =>
          job.required_skills?.some(rs => 
            rs.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(rs.toLowerCase())
          )
        )
        const skillScore = matchingSkills.length / Math.max(job.required_skills.length, 1)
        matchScore += skillScore * 40 // 40% weight

        if (matchingSkills.length > 0) {
          reasons.push(`Matches ${matchingSkills.length} of your skills: ${matchingSkills.slice(0, 3).join(', ')}`)
        }
      }

      // Budget matching
      if (profile.hourly_rate && job.budget_min && job.budget_max) {
        const rate = parseFloat(profile.hourly_rate)
        const minBudget = parseFloat(job.budget_min)
        const maxBudget = parseFloat(job.budget_max)

        // Estimate hourly from fixed budget (assume 40 hours)
        const estimatedHourly = (minBudget + maxBudget) / 2 / 40

        if (rate >= estimatedHourly * 0.7 && rate <= estimatedHourly * 1.3) {
          matchScore += 20 // 20% weight
          reasons.push('Budget aligns with your rate')
        }
      }

      // Semantic similarity using embeddings
      if (profileEmbedding && job.scope_embedding) {
        try {
          const jobEmbedding = JSON.parse(job.scope_embedding)
          const similarity = cosineSimilarity(profileEmbedding, jobEmbedding)
          matchScore += similarity * 40 // 40% weight

          if (similarity > 0.7) {
            reasons.push('High relevance to your expertise')
          } else if (similarity > 0.5) {
            reasons.push('Good match for your background')
          }
        } catch (e) {
          // Skip embedding comparison if parsing fails
        }
      }

      return {
        job,
        matchScore: Math.round(matchScore),
        reasons,
      }
    })
  )

  // Sort by score and return top matches
  const topMatches = scoredJobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

  return { jobs: topMatches }
}

/**
 * Find best matching freelancers for a job
 */
export async function findMatchingFreelancersForJob(
  jobId: number,
  limit: number = 10
): Promise<{
  freelancers: Array<{
    freelancer: any
    matchScore: number
    reasons: string[]
  }>
}> {
  // Get job details
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  })

  if (!job) {
    return { freelancers: [] }
  }

  // Get freelancers with profiles
  const freelancerProfiles = await db.query.profiles.findMany({
    with: {
      user: true,
    },
    limit: 100,
  })

  // Filter to only freelancers
  const freelancers = freelancerProfiles.filter(p => 
    (p.user as any)?.role === 'freelancer'
  )

  if (freelancers.length === 0) {
    return { freelancers: [] }
  }

  // Generate job embedding if not exists
  let jobEmbedding: number[] | null = null
  if (job.scope_embedding) {
    try {
      jobEmbedding = JSON.parse(job.scope_embedding)
    } catch (e) {}
  }

  if (!jobEmbedding) {
    const jobText = `${job.title}\n${job.description}\nSkills: ${job.required_skills?.join(', ')}`
    jobEmbedding = await generateEmbedding(jobText)
  }

  // Score and rank freelancers
  const scoredFreelancers = await Promise.all(
    freelancers.map(async (profile) => {
      let matchScore = 0
      const reasons: string[] = []

      // Skill matching
      if (profile.skills && job.required_skills) {
        const matchingSkills = job.required_skills.filter(skill =>
          profile.skills?.some(ps =>
            ps.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(ps.toLowerCase())
          )
        )
        const skillScore = matchingSkills.length / job.required_skills.length
        matchScore += skillScore * 50 // 50% weight

        if (matchingSkills.length > 0) {
          reasons.push(`Has ${matchingSkills.length}/${job.required_skills.length} required skills`)
        }
      }

      // Experience level
      if (profile.experience_years) {
        if (profile.experience_years >= 5) {
          matchScore += 15
          reasons.push('Senior level experience')
        } else if (profile.experience_years >= 2) {
          matchScore += 10
          reasons.push('Mid-level experience')
        }
      }

      // Completion score (profile completeness)
      if (profile.success_rate && parseFloat(profile.success_rate) >= 80) {
        matchScore += 15
        reasons.push('Verified profile')
      }

      // Semantic similarity
      if (jobEmbedding && profile.bio) {
        const profileEmbedding = await generateEmbedding(
          `${profile.bio}\nSkills: ${profile.skills?.join(', ')}`
        )
        if (profileEmbedding) {
          const similarity = cosineSimilarity(jobEmbedding, profileEmbedding)
          matchScore += similarity * 20 // 20% weight
        }
      }

      return {
        freelancer: {
          ...profile,
          user: profile.user,
        },
        matchScore: Math.round(matchScore),
        reasons,
      }
    })
  )

  // Sort by score and return top matches
  const topMatches = scoredFreelancers
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

  return { freelancers: topMatches }
}

/**
 * Generate AI-powered job recommendations explanation
 */
export async function explainJobMatch(
  job: any,
  freelancerProfile: any
): Promise<string | null> {
  const prompt = `
You are a career advisor helping a freelancer understand why a job might be a good match for them.

Job Title: ${job.title}
Job Description: ${job.description?.slice(0, 500)}
Required Skills: ${job.required_skills?.join(', ')}

Freelancer Skills: ${freelancerProfile.skills?.join(', ')}
Freelancer Bio: ${freelancerProfile.bio?.slice(0, 300)}

Provide a brief, encouraging 2-3 sentence explanation of why this job could be a good match for this freelancer.
Focus on specific skill alignments and growth opportunities.
`

  return generateCompletion(prompt, {
    model: AIModels.GPT_35_TURBO,
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt: 'You are a helpful career advisor. Be concise and encouraging.',
  })
}
