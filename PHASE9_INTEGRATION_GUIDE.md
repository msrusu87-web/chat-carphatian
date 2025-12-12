# Phase 9: AI-Powered Matching System - Integration Guide

## ✅ Completed Features

### 1. **Database Schema Enhancements**
- ✅ Enhanced `profiles` table with 17 new fields:
  - Professional: `title`, `experience_years`, `education`, `certifications`, `languages`, `availability`, `timezone`
  - Client-specific: `company_name`, `company_size`, `industry`
  - Social: `website`, `linkedin`, `github`
  - Stats: `total_jobs_completed`, `success_rate`, `average_response_time`
  - AI: `profile_embedding` (1536-dimension vector)
- ✅ Created `portfolios` table (9 columns)
- ✅ Reviews table supports bidirectional reviews

### 2. **Backend APIs**
- ✅ `/api/ai/embed` - Generate OpenAI embeddings
- ✅ `/api/search/jobs` - Semantic job search with match scoring
- ✅ `/api/search/freelancers` - Multi-factor freelancer matching
- ✅ `/api/portfolio` - CRUD for portfolio items
- ✅ `/api/reviews` - Bidirectional review system with auto-stats

### 3. **UI Components**
- ✅ `ReviewsDisplay` - Show reviews with stats and star ratings
- ✅ `ReviewForm` - Create reviews with interactive star rating
- ✅ `PortfolioGrid` - Display portfolio items in grid layout
- ✅ `AddPortfolioModal` - Form to add new portfolio projects
- ✅ `JobRecommendations` - AI-powered job suggestions for freelancers
- ✅ `FreelancerSuggestions` - AI-powered freelancer matching for jobs

### 4. **Page Templates**
- ✅ `/app/profile/edit/page.tsx` - Enhanced profile editing
- ✅ `/app/profile/[id]/page.tsx` - Profile view with portfolios and reviews

## 🚀 Integration Examples

### Example 1: Add Job Recommendations to Freelancer Dashboard

Update `/app/freelancer/page.tsx`:

```tsx
import JobRecommendations from '@/components/JobRecommendations'

export default function FreelancerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {/* Your existing dashboard content */}
          </div>
          
          {/* Sidebar with recommendations */}
          <div>
            <JobRecommendations limit={5} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Add Freelancer Suggestions to Job Detail Page

Update `/app/client/jobs/[id]/page.tsx`:

```tsx
import FreelancerSuggestions from '@/components/FreelancerSuggestions'

// In your component after fetching job data:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
  {/* Left: Job details and applications */}
  <div className="lg:col-span-2">
    {/* Existing job details and applications */}
  </div>
  
  {/* Right: Recommended freelancers */}
  <div>
    <FreelancerSuggestions
      jobId={job.id}
      jobDescription={job.description}
      requiredSkills={job.required_skills}
      budgetMin={job.budget_min}
      budgetMax={job.budget_max}
      limit={10}
    />
  </div>
</div>
```

### Example 3: Add Reviews to Contract Completion Page

Update `/app/client/contracts/[id]/page.tsx` or `/app/freelancer/contracts/[id]/page.tsx`:

```tsx
import ReviewForm from '@/components/ReviewForm'
import ReviewsDisplay from '@/components/ReviewsDisplay'

// Show review form when contract is completed:
{contract.status === 'completed' && !hasReviewed && (
  <ReviewForm
    contractId={contract.id}
    revieweeId={freelancerId}
    revieweeName={freelancerName}
    onSuccess={() => {
      // Refresh page or update state
      router.refresh()
    }}
  />
)}

// Show reviews for the user:
<ReviewsDisplay userId={userId} />
```

### Example 4: Add Portfolio Management to Freelancer Profile

Already integrated in `/app/profile/[id]/page.tsx`:

```tsx
import PortfolioGrid from '@/components/PortfolioGrid'

// In profile page:
{userRole === 'freelancer' && (
  <PortfolioGrid userId={userId} isOwner={isOwner} />
)}
```

## 📊 Matching Algorithm Details

### 6-Factor Weighted Scoring System

The `/api/search/freelancers` endpoint uses:

1. **Semantic Similarity (35%)**: Cosine similarity between job description and freelancer profile
2. **Skills Match (25%)**: Percentage of required skills the freelancer has
3. **Reviews & Rating (20%)**: Average rating / 5
4. **Success Rate (10%)**: Percentage of successfully completed jobs
5. **Response Time (5%)**: How quickly freelancer responds (1 hour = 100%, 48+ hours = 0%)
6. **Budget Compatibility (5%)**: How well hourly rate matches budget

### Example API Call

```typescript
const res = await fetch('/api/search/freelancers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    embedding: jobEmbedding, // 1536-dim vector from OpenAI
    requiredSkills: ['React', 'Node.js', 'TypeScript'],
    budgetMin: 50,
    budgetMax: 100,
    limit: 10,
  }),
})

const { freelancers } = await res.json()
// Each freelancer has:
// - matchScore: 0-100 overall match percentage
// - factors: { semanticScore, skillsScore, reviewScore, successScore, responseScore, budgetScore }
// - profile, avgRating, totalReviews, etc.
```

## 🎯 Next Steps to Complete Phase 9

### 1. Integrate Components into Existing Pages

- [ ] Add `JobRecommendations` to freelancer dashboard
- [ ] Add `FreelancerSuggestions` to client job detail pages
- [ ] Add `ReviewForm` to completed contract pages
- [ ] Link to `/profile/[id]` and `/profile/edit` from navigation

### 2. Generate Embeddings for Existing Data

Run this script to generate embeddings for all existing jobs and profiles:

```typescript
// scripts/generate-embeddings.ts
import { db } from '@/lib/db'
import { jobs, users } from '@/lib/db/schema'

async function generateJobEmbeddings() {
  const allJobs = await db.query.jobs.findMany()
  
  for (const job of allJobs) {
    const text = `${job.title}. ${job.description}`
    const res = await fetch('http://localhost:3000/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, jobId: job.id }),
    })
    console.log(`Generated embedding for job ${job.id}`)
  }
}

async function generateProfileEmbeddings() {
  const allUsers = await db.query.users.findMany({ with: { profile: true } })
  
  for (const user of allUsers) {
    if (!user.profile?.bio && !user.profile?.skills?.length) continue
    
    const text = [
      user.profile.bio,
      user.profile.title,
      user.profile.skills?.join(', '),
    ].filter(Boolean).join('. ')
    
    const res = await fetch('http://localhost:3000/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userId: user.id }),
    })
    console.log(`Generated embedding for user ${user.id}`)
  }
}

// Run both
generateJobEmbeddings()
generateProfileEmbeddings()
```

### 3. Test the Matching System

1. Create test profiles with different skills
2. Post test jobs with various requirements
3. Verify match scores are accurate
4. Tune weight factors in `/api/search/freelancers` if needed

### 4. Deploy to Production

```bash
# Build and test locally
npm run build
npm start

# Push database changes
npx drizzle-kit push

# Deploy to production
# Your deployment process here
```

## 🔧 Configuration

### OpenAI API Key

Make sure `.env.local` has:
```
OPENAI_API_KEY=sk-...
```

### Adjust Matching Weights

Edit `/app/api/search/freelancers/route.ts`:

```typescript
const matchScore =
  semanticScore * 0.35 +  // Adjust these weights
  skillsScore * 0.25 +
  reviewScore * 0.20 +
  successScore * 0.10 +
  responseScore * 0.05 +
  budgetScore * 0.05
```

## 📝 API Reference

### POST /api/ai/embed
Generate embedding for text.

**Request:**
```json
{
  "text": "Full stack developer with 5 years experience in React...",
  "userId": 123,  // Optional: auto-saves to profile
  "jobId": 456    // Optional: auto-saves to job
}
```

**Response:**
```json
{
  "embedding": [0.123, -0.456, ...],  // 1536 dimensions
  "dimensions": 1536
}
```

### POST /api/search/jobs
Search jobs semantically.

**Request:**
```json
{
  "embedding": [...],
  "skills": ["React", "Node.js"],
  "budgetMin": 1000,
  "budgetMax": 5000,
  "limit": 10
}
```

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "matchScore": 85.5,
      "matchedSkills": ["React", "Node.js"]
    }
  ]
}
```

### POST /api/search/freelancers
Find matching freelancers for a job.

**Request:**
```json
{
  "embedding": [...],
  "requiredSkills": ["React", "TypeScript"],
  "budgetMin": 50,
  "budgetMax": 100,
  "limit": 10
}
```

**Response:**
```json
{
  "freelancers": [
    {
      "id": 1,
      "profile": {...},
      "matchScore": 92.3,
      "factors": {
        "semanticScore": 0.95,
        "skillsScore": 1.0,
        "reviewScore": 0.8,
        "successScore": 0.9,
        "responseScore": 0.85,
        "budgetScore": 1.0
      },
      "avgRating": 4.8,
      "totalReviews": 25
    }
  ]
}
```

### GET/POST/DELETE /api/portfolio
Manage portfolio items.

**GET:** `?userId=123`
**POST:** `{ title, description, tech_stack, image_url, project_url, completion_date }`
**DELETE:** `?id=456`

### GET/POST /api/reviews
Manage reviews.

**GET:** `?userId=123` - Returns reviews + stats
**POST:** `{ contract_id, reviewee_id, rating, comment }`

## ✨ Features Summary

### For Freelancers:
- ✅ AI-powered job recommendations based on skills and experience
- ✅ Portfolio showcase on profile
- ✅ Receive reviews from clients
- ✅ Enhanced profile with professional details
- ✅ Match score visibility on job listings

### For Clients:
- ✅ AI-powered freelancer suggestions for jobs
- ✅ See match scores and factors for each freelancer
- ✅ Give reviews to freelancers
- ✅ View freelancer portfolios and reviews
- ✅ Enhanced company profile

### For Platform:
- ✅ Semantic search capabilities
- ✅ Multi-factor matching algorithm
- ✅ Automated success rate calculation
- ✅ Review moderation system
- ✅ Bidirectional trust building

---

**Phase 9 Status:** Backend 100% Complete, Frontend 80% Complete
**Next Phase:** Email Notifications (Phase 10)
