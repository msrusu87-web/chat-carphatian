# 🚀 Carphatian AI Marketplace

> **AI-powered freelance platform** connecting exceptional talent with visionary clients through intelligent semantic matching.

**Built by [Carphatian](https://carphatian.ro)** | Live at [chat.carphatian.ro](https://chat.carphatian.ro)

---

## ✨ Features

### For Clients ("Talent OS")
- 🤖 **AI Job Wizard** - Chat with AI to create perfect job posts
- 📊 **Kanban Dashboard** - Track applicants through hiring pipeline
- 🔍 **Instant Matching** - AI finds the best freelancers in seconds
- 💳 **Secure Payments** - Escrow-protected milestone payments via Stripe

### For Freelancers ("Career Copilot")
- ⚡ **One-Click Apply** - AI generates personalized cover letters
- 🎯 **Smart Recommendations** - Jobs matched to your skills via vector search
- 💼 **Workstream** - Manage all contracts in one place
- 🧾 **Auto-Invoicing** - Generate professional invoices instantly

### For Admins ("God Mode")
- 🛡️ **Dispute Resolution** - Access to chat logs and contract history
- 💰 **Financial Dashboard** - Track MRR, ARR, platform fees, payouts
- 🔧 **AI Switchboard** - Manage AI providers (OpenAI, Groq, Anthropic) and routing rules
- 📈 **Analytics** - PostHog integration for user insights

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + Shadcn/UI
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend
- **Database:** PostgreSQL (Supabase) with pgvector for embeddings
- **Auth:** Supabase Auth (JWT + Row Level Security)
- **Payments:** Stripe Connect (platform + freelancers)
- **Cache:** Upstash Redis
- **Storage:** AWS S3 / Supabase Storage

### AI & Microservices
- **AI Service:** FastAPI (Python)
- **Providers:** OpenAI (GPT-4), Groq (Llama 3, free), Anthropic (Claude)
- **Vector Search:** pgvector (cosine similarity)

### DevOps
- **Deployment:** Nginx reverse proxy on VPS
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors) + PostHog (analytics)
- **Email:** SendGrid

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- PostgreSQL 15+ (or Supabase account)
- Redis (or Upstash account)

### Installation

1. **Clone the repository:**
   ```bash
   cd /home/ubuntu/chat-carphatian
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your API keys
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
chat-carphatian/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage (landing)
│   ├── layout.tsx         # Root layout (dark mode, SEO)
│   ├── auth/              # Login, signup, verification
│   ├── client/            # Client portal (hire talent)
│   ├── freelancer/        # Freelancer portal (find work)
│   └── admin/             # Admin panel (god mode)
├── components/
│   ├── ui/                # Shadcn components
│   ├── layouts/           # Header, Footer
│   └── features/          # Feature-specific components
├── lib/                   # Utilities & integrations
├── config/                # Type-safe configuration
├── types/                 # TypeScript definitions
├── hooks/                 # Custom React hooks
└── store/                 # Zustand state management
```

---

## 🎨 Design System

### Theme
- **Primary:** Indigo-600 `#4F46E5` (trust, technology)
- **Success:** Emerald-500 `#10B981` (positive actions)
- **Destructive:** Rose-500 `#F43F5E` (errors, warnings)
- **Mode:** Dark-first (optimized for developers)

### Fonts
- **UI:** Inter (Google Fonts)
- **Code:** JetBrains Mono (for technical displays)

### Components
14 pre-built Shadcn components with dark mode support:
- Button, Input, Card, Select, Textarea
- Dialog, Table, Tabs, Dropdown Menu
- Avatar, Badge, Separator, Label, Sonner (toasts)

---

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required keys:

```bash
# Critical
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_xxx

# AI Providers (at least one required)
OPENAI_API_KEY=sk-xxx         # Best quality
GROQ_API_KEY=gsk-xxx          # Free, fast (Llama 3)
ANTHROPIC_API_KEY=sk-ant-xxx  # Claude alternative

# Optional but recommended
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
SENDGRID_API_KEY=SG.xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Feature Flags
Toggle features via environment:
```bash
NEXT_PUBLIC_ENABLE_CRYPTO_PAYMENTS=false
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=false
NEXT_PUBLIC_ENABLE_TIME_TRACKING=false
```

---

## 📊 Database Schema

### Core Tables
- `users` - Auth records (Supabase)
- `profiles` - Extended user data + **vector embeddings**
- `jobs` - Job posts + **scope embeddings**
- `applications` - Freelancer applications
- `contracts` - Active work agreements
- `messages` - Realtime chat (encrypted)
- `payments` - Stripe payment records
- `ai_providers` - AI service credentials (encrypted)
- `ai_routing_rules` - Task-to-model mapping

### Row Level Security (RLS)
All tables enforce RLS policies:
- Users can only read/write their own data
- Admins have bypass privileges
- Cross-user queries blocked by default

---

## 🤖 AI Architecture

### The "AI Switchboard"
Admins can dynamically route AI tasks to different providers:

| Task              | Default Provider | Fallback   |
|-------------------|------------------|------------|
| Job Drafting      | GPT-4o           | Claude 3.5 |
| Cover Letters     | Groq Llama 3     | GPT-4o-mini|
| Profile Summary   | GPT-4o-mini      | Groq       |
| Chat Assist       | Groq Llama 3     | GPT-4o     |
| Vector Embeddings | OpenAI text-embedding-3-large | - |

Configure via **Admin Panel > AI Switchboard**.

---

## 🧪 Testing

### Run Tests
```bash
npm run test          # Unit tests (Jest/Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run lint          # ESLint
npm run type-check    # TypeScript compiler
```

### Manual Testing
1. Sign up as client: [/auth/signup?role=client](http://localhost:3000/auth/signup?role=client)
2. Sign up as freelancer: [/auth/signup?role=freelancer](http://localhost:3000/auth/signup?role=freelancer)
3. Test AI job wizard, apply flow, payments

---

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` in `.env.local`
- [ ] Add real Supabase, Stripe, OpenAI keys
- [ ] Enable RLS on all Supabase tables
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL with Certbot (already done for chat.carphatian.ro)
- [ ] Configure GitHub Actions for CI/CD
- [ ] Set up Sentry error tracking
- [ ] Enable PostHog analytics

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/chat.carphatian.ro

server {
    server_name chat.carphatian.ro;

    # Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI AI service
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/chat.carphatian.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.carphatian.ro/privkey.pem;
}
```

---

## 📚 Development Roadmap

See [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) for detailed status.

### Current Phase: Phase 1 - Foundation (70% Complete)
- ✅ Next.js + TypeScript setup
- ✅ Shadcn/UI components
- ✅ Dark-first theme
- ✅ Landing page
- ⏳ Docker configuration
- ⏳ Nginx proxy update
- ⏳ CI/CD pipeline

### Next: Phase 2 - Database & Backend
- Database schema design
- Supabase setup with RLS
- API routes (CRUD)
- Stripe webhook handler

---

## 🤝 Contributing

This is a private project. For inquiries, contact Carphatian team.

---

## 📄 License

Proprietary. © 2025 Carphatian. All rights reserved.

---

## 📞 Support

**Built by:** [Carphatian](https://carphatian.ro)  
**Live:** [chat.carphatian.ro](https://chat.carphatian.ro)  
**Status:** In Development 🚧

---

**Every page proudly displays:** *"Built by Carphatian"* ✨
