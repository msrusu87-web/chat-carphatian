/**
 * Database Seed Script
 * 
 * This file generates demo data for testing the platform.
 * It creates:
 * - 1 admin user
 * - 5 client users (businesses looking for talent)
 * - 10 freelancer users (developers, designers, writers)
 * - 25 job posts across various categories
 * - 50 applications from freelancers
 * - 15 active contracts
 * - Multiple milestones, messages, and reviews
 * 
 * Run with: npx tsx lib/db/seed.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from './index';
import { 
  users, profiles, jobs, applications, contracts, 
  milestones, messages, reviews, aiProviders, aiRoutingRules 
} from './schema';
import bcrypt from 'bcryptjs';

// Helper: Hash password (bcrypt with 10 salt rounds)
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Helper: Random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Random elements (multiple)
function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

// Helper: Random date in past N days
function randomPastDate(daysAgo: number): Date {
  const now = Date.now();
  const past = now - (daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past + Math.random() * (now - past);
  return new Date(randomTime);
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ======================
    // 1. CREATE USERS
    // ======================
    console.log('👥 Creating users...');
    
    const passwordHash = await hashPassword('password123'); // Same password for all demo users

    // Admin user
    const [admin] = await db.insert(users).values({
      email: 'admin@carphatian.ro',
      password_hash: passwordHash,
      role: 'admin',
      email_verified: true,
    }).returning();

    // Client users (businesses posting jobs)
    const clientData = [
      { email: 'tech.startup@example.com', name: 'Tech Startup Inc', bio: 'Innovative SaaS company building AI-powered tools' },
      { email: 'ecommerce.co@example.com', name: 'E-Commerce Solutions', bio: 'Online retail platform seeking frontend expertise' },
      { email: 'fintech.agency@example.com', name: 'FinTech Agency', bio: 'Financial services company, crypto-friendly' },
      { email: 'design.studio@example.com', name: 'Creative Design Studio', bio: 'Award-winning design agency' },
      { email: 'edu.platform@example.com', name: 'Education Platform', bio: 'EdTech startup revolutionizing online learning' },
    ];

    const clientUsers = [];
    for (const client of clientData) {
      const [user] = await db.insert(users).values({
        email: client.email,
        password_hash: passwordHash,
        role: 'client',
        email_verified: true,
      }).returning();
      
      await db.insert(profiles).values({
        user_id: user.id,
        full_name: client.name,
        bio: client.bio,
      });
      
      clientUsers.push(user);
    }

    // Freelancer users (talent offering services)
    const freelancerData = [
      { 
        email: 'alex.developer@example.com', 
        name: 'Alex Thompson', 
        bio: 'Full-stack developer specializing in React, Node.js, and PostgreSQL. 5+ years experience.', 
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Next.js'],
        hourly_rate: 75.00,
      },
      { 
        email: 'maria.designer@example.com', 
        name: 'Maria Rodriguez', 
        bio: 'UI/UX designer with passion for minimalist, user-centered design. Figma expert.', 
        skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
        hourly_rate: 65.00,
      },
      { 
        email: 'john.backend@example.com', 
        name: 'John Chen', 
        bio: 'Backend architect. Python, Go, microservices, AWS certified.', 
        skills: ['Python', 'Go', 'AWS', 'Docker', 'Kubernetes'],
        hourly_rate: 85.00,
      },
      { 
        email: 'sarah.mobile@example.com', 
        name: 'Sarah Johnson', 
        bio: 'Mobile app developer (iOS & Android). React Native and Flutter specialist.', 
        skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
        hourly_rate: 70.00,
      },
      { 
        email: 'david.devops@example.com', 
        name: 'David Martinez', 
        bio: 'DevOps engineer. CI/CD pipelines, infrastructure as code, cloud architecture.', 
        skills: ['DevOps', 'Terraform', 'GitHub Actions', 'AWS', 'Docker'],
        hourly_rate: 80.00,
      },
      { 
        email: 'emma.frontend@example.com', 
        name: 'Emma Wilson', 
        bio: 'Frontend specialist. Pixel-perfect implementations, performance optimization.', 
        skills: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'Tailwind CSS'],
        hourly_rate: 60.00,
      },
      { 
        email: 'mike.fullstack@example.com', 
        name: 'Mike Anderson', 
        bio: 'Generalist full-stack developer. Rapid prototyping, MVP development.', 
        skills: ['React', 'Express', 'MongoDB', 'GraphQL', 'REST API'],
        hourly_rate: 65.00,
      },
      { 
        email: 'lisa.writer@example.com', 
        name: 'Lisa Brown', 
        bio: 'Technical writer and content strategist. Documentation, blog posts, tutorials.', 
        skills: ['Technical Writing', 'SEO', 'Content Strategy', 'Markdown'],
        hourly_rate: 45.00,
      },
      { 
        email: 'james.blockchain@example.com', 
        name: 'James Taylor', 
        bio: 'Blockchain developer. Smart contracts, Web3, DeFi experience.', 
        skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts'],
        hourly_rate: 95.00,
      },
      { 
        email: 'anna.qa@example.com', 
        name: 'Anna Garcia', 
        bio: 'QA engineer and test automation specialist. Cypress, Jest, Playwright.', 
        skills: ['QA Testing', 'Cypress', 'Jest', 'Playwright', 'Automation'],
        hourly_rate: 55.00,
      },
    ];

    const freelancerUsers = [];
    for (const freelancer of freelancerData) {
      const [user] = await db.insert(users).values({
        email: freelancer.email,
        password_hash: passwordHash,
        role: 'freelancer',
        email_verified: true,
      }).returning();
      
      await db.insert(profiles).values({
        user_id: user.id,
        full_name: freelancer.name,
        bio: freelancer.bio,
        skills: freelancer.skills,
        hourly_rate: freelancer.hourly_rate.toString(),
        location: randomElement(['Bucharest, Romania', 'Cluj-Napoca, Romania', 'Timișoara, Romania', 'Iași, Romania', 'Remote']),
      });
      
      freelancerUsers.push(user);
    }

    console.log(`✅ Created ${clientUsers.length} clients, ${freelancerUsers.length} freelancers, 1 admin\n`);

    // ======================
    // 2. CREATE JOBS
    // ======================
    console.log('💼 Creating job posts...');

    const jobsData = [
      { title: 'Build E-Commerce Platform with Next.js', description: 'Need experienced Next.js developer to build modern e-commerce site with Stripe integration, product catalog, and admin dashboard.', budget_min: 3000, budget_max: 5000, timeline: '2-3 months', skills: ['Next.js', 'React', 'TypeScript', 'Stripe', 'PostgreSQL'] },
      { title: 'Mobile App Development - React Native', description: 'Looking for React Native developer to build cross-platform mobile app for food delivery service.', budget_min: 4000, budget_max: 7000, timeline: '3-4 months', skills: ['React Native', 'Firebase', 'Mobile Development'] },
      { title: 'UI/UX Design for SaaS Dashboard', description: 'Design modern, intuitive dashboard for B2B SaaS product. Figma deliverables required.', budget_min: 1500, budget_max: 2500, timeline: '3-4 weeks', skills: ['UI/UX Design', 'Figma', 'Prototyping'] },
      { title: 'Backend API Development - Python FastAPI', description: 'Build RESTful API for data analytics platform. Python FastAPI, PostgreSQL, authentication.', budget_min: 3500, budget_max: 6000, timeline: '2 months', skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST API'] },
      { title: 'DevOps: AWS Infrastructure Setup', description: 'Set up production-ready AWS infrastructure with Terraform. ECS, RDS, CloudFront, CI/CD pipeline.', budget_min: 2000, budget_max: 3500, timeline: '1 month', skills: ['AWS', 'Terraform', 'DevOps', 'Docker'] },
      { title: 'Smart Contract Development - Solidity', description: 'Develop and audit Ethereum smart contracts for NFT marketplace. Security-focused.', budget_min: 5000, budget_max: 8000, timeline: '2-3 months', skills: ['Solidity', 'Smart Contracts', 'Web3', 'Ethereum'] },
      { title: 'Vue.js Frontend for CRM System', description: 'Build responsive Vue.js frontend for customer relationship management system.', budget_min: 2500, budget_max: 4000, timeline: '6-8 weeks', skills: ['Vue.js', 'JavaScript', 'Tailwind CSS', 'REST API'] },
      { title: 'Technical Documentation Writer Needed', description: 'Write comprehensive API documentation and user guides for developer platform.', budget_min: 800, budget_max: 1500, timeline: '2-3 weeks', skills: ['Technical Writing', 'Markdown', 'API Documentation'] },
      { title: 'QA Automation for Web Application', description: 'Set up end-to-end testing suite using Playwright. Automate regression tests.', budget_min: 1200, budget_max: 2000, timeline: '3 weeks', skills: ['QA Testing', 'Playwright', 'Automation', 'JavaScript'] },
      { title: 'Full-Stack Developer for MVP', description: 'Rapid development of MVP for productivity tool. React + Express + MongoDB.', budget_min: 2000, budget_max: 3500, timeline: '1 month', skills: ['React', 'Express', 'MongoDB', 'Node.js'] },
      { title: 'Redesign Landing Page - High Converting', description: 'Redesign existing landing page to improve conversion rates. A/B testing knowledge required.', budget_min: 1000, budget_max: 1800, timeline: '2 weeks', skills: ['UI/UX Design', 'HTML', 'CSS', 'Figma'] },
      { title: 'Kubernetes Cluster Setup and Management', description: 'Deploy and manage Kubernetes cluster for microservices architecture.', budget_min: 2500, budget_max: 4000, timeline: '1-2 months', skills: ['Kubernetes', 'Docker', 'DevOps', 'AWS'] },
      { title: 'iOS App Developer for Finance App', description: 'Native iOS development for personal finance tracking app. Swift required.', budget_min: 4500, budget_max: 7000, timeline: '3 months', skills: ['iOS', 'Swift', 'Mobile Development'] },
      { title: 'GraphQL API Migration', description: 'Migrate existing REST API to GraphQL. Apollo Server, schema design, resolvers.', budget_min: 2000, budget_max: 3500, timeline: '4-6 weeks', skills: ['GraphQL', 'Node.js', 'Apollo', 'TypeScript'] },
      { title: 'Shopify Theme Customization', description: 'Customize Shopify theme for luxury fashion brand. Liquid, JavaScript, responsive design.', budget_min: 800, budget_max: 1500, timeline: '2 weeks', skills: ['Shopify', 'Liquid', 'JavaScript', 'CSS'] },
      { title: 'Data Science - ML Model Development', description: 'Build machine learning model for customer churn prediction. Python, scikit-learn.', budget_min: 3000, budget_max: 5000, timeline: '2 months', skills: ['Python', 'Machine Learning', 'Data Science'] },
      { title: 'WordPress Plugin Development', description: 'Custom WordPress plugin for booking system integration.', budget_min: 1200, budget_max: 2000, timeline: '3 weeks', skills: ['WordPress', 'PHP', 'JavaScript', 'MySQL'] },
      { title: 'SEO Optimization and Content Strategy', description: 'Improve SEO rankings and develop content strategy for tech blog.', budget_min: 1000, budget_max: 1800, timeline: '1 month', skills: ['SEO', 'Content Strategy', 'Technical Writing'] },
      { title: 'Electron Desktop App Development', description: 'Build cross-platform desktop app using Electron. Local file management.', budget_min: 2500, budget_max: 4000, timeline: '6-8 weeks', skills: ['Electron', 'JavaScript', 'Node.js', 'React'] },
      { title: 'PostgreSQL Database Optimization', description: 'Optimize slow queries, set up replication, improve database performance.', budget_min: 1500, budget_max: 2500, timeline: '2-3 weeks', skills: ['PostgreSQL', 'Database', 'SQL', 'Performance'] },
      { title: 'Chrome Extension Development', description: 'Build Chrome extension for productivity tracking. Manifest V3.', budget_min: 1000, budget_max: 1800, timeline: '3 weeks', skills: ['JavaScript', 'Chrome Extension', 'Web Development'] },
      { title: 'Tailwind CSS UI Component Library', description: 'Create reusable Tailwind CSS component library for design system.', budget_min: 1500, budget_max: 2500, timeline: '4 weeks', skills: ['Tailwind CSS', 'React', 'Component Design'] },
      { title: 'Stripe Payment Integration', description: 'Integrate Stripe for subscription billing. Webhooks, customer portal, invoicing.', budget_min: 1200, budget_max: 2000, timeline: '2-3 weeks', skills: ['Stripe', 'Node.js', 'Payment Integration'] },
      { title: 'Accessibility Audit and Fixes', description: 'Conduct WCAG 2.1 AA accessibility audit and implement fixes.', budget_min: 800, budget_max: 1500, timeline: '2 weeks', skills: ['Accessibility', 'HTML', 'CSS', 'WCAG'] },
      { title: 'Real-Time Chat Feature with WebSockets', description: 'Add real-time messaging to existing app using Socket.io or similar.', budget_min: 1500, budget_max: 2500, timeline: '3-4 weeks', skills: ['WebSockets', 'Node.js', 'Real-Time', 'Socket.io'] },
    ];

    const createdJobs = [];
    for (let i = 0; i < jobsData.length; i++) {
      const jobData = jobsData[i];
      const client = clientUsers[i % clientUsers.length]; // Distribute jobs among clients
      
      const [job] = await db.insert(jobs).values({
        client_id: client.id,
        title: jobData.title,
        description: jobData.description,
        budget_min: jobData.budget_min.toString(),
        budget_max: jobData.budget_max.toString(),
        timeline: jobData.timeline,
        required_skills: jobData.skills,
        status: randomElement(['open', 'open', 'open', 'open', 'in_progress', 'completed']), // Most are open
        created_at: randomPastDate(30),
      }).returning();
      
      createdJobs.push(job);
    }

    console.log(`✅ Created ${createdJobs.length} job posts\n`);

    // ======================
    // 3. CREATE APPLICATIONS
    // ======================
    console.log('📝 Creating applications...');

    const coverLetters = [
      'Hi! I have extensive experience with these technologies and would love to work on this project. My portfolio includes similar work. Looking forward to discussing further!',
      'Hello, I am very interested in this opportunity. I have 5+ years of relevant experience and can start immediately. Let me know if you would like to see my previous projects.',
      'I believe I am the perfect fit for this project. I have delivered similar solutions for clients and received excellent feedback. Available for a quick call to discuss your requirements.',
      'Excited about this project! I have the exact skill set you are looking for and can dedicate full-time hours to ensure timely delivery.',
      'I read your job description carefully and I am confident I can deliver high-quality work within your timeline and budget. Let me share my relevant experience...',
    ];

    const createdApplications = [];
    const openJobs = createdJobs.filter(j => j.status === 'open');
    
    // Each open job gets 2-4 applications
    for (const job of openJobs) {
      const numApps = Math.floor(Math.random() * 3) + 2; // 2-4 applications
      const applicants = randomElements(freelancerUsers, numApps);
      
      for (const freelancer of applicants) {
        const freelancerProfile = await db.query.profiles.findFirst({
          where: (profiles, { eq }) => eq(profiles.user_id, freelancer.id),
        });
        
        const [application] = await db.insert(applications).values({
          job_id: job.id,
          freelancer_id: freelancer.id,
          cover_letter: randomElement(coverLetters),
          proposed_rate: (parseFloat(freelancerProfile?.hourly_rate || '50') * 1.1).toFixed(2), // 10% above hourly rate
          estimated_hours: Math.floor(Math.random() * 80) + 40, // 40-120 hours
          status: randomElement(['pending', 'pending', 'pending', 'accepted', 'rejected']),
          created_at: new Date(job.created_at.getTime() + Math.random() * 86400000), // After job post
        }).returning();
        
        createdApplications.push(application);
      }
    }

    console.log(`✅ Created ${createdApplications.length} applications\n`);

    // ======================
    // 4. CREATE CONTRACTS
    // ======================
    console.log('📄 Creating contracts...');

    const acceptedApps = createdApplications.filter(a => a.status === 'accepted');
    const createdContracts = [];

    for (const app of acceptedApps.slice(0, 15)) { // Create 15 contracts
      const totalAmount = parseFloat(app.proposed_rate) * (app.estimated_hours || 60);
      const platformFee = totalAmount * 0.10; // 10% platform fee

      const [contract] = await db.insert(contracts).values({
        job_id: app.job_id,
        client_id: (await db.query.jobs.findFirst({ where: (jobs, { eq }) => eq(jobs.id, app.job_id) }))!.client_id,
        freelancer_id: app.freelancer_id,
        total_amount: totalAmount.toFixed(2),
        platform_fee: platformFee.toFixed(2),
        status: randomElement(['active', 'active', 'active', 'completed', 'paused']),
        start_date: randomPastDate(60),
      }).returning();

      createdContracts.push(contract);
    }

    console.log(`✅ Created ${createdContracts.length} contracts\n`);

    // ======================
    // 5. CREATE MILESTONES
    // ======================
    console.log('🎯 Creating milestones...');

    let milestonesCount = 0;
    for (const contract of createdContracts) {
      const numMilestones = Math.floor(Math.random() * 3) + 2; // 2-4 milestones per contract
      const milestoneAmount = parseFloat(contract.total_amount) / numMilestones;

      for (let i = 1; i <= numMilestones; i++) {
        await db.insert(milestones).values({
          contract_id: contract.id,
          title: `Milestone ${i}: ${randomElement(['Initial Setup', 'Core Features', 'Testing & QA', 'Deployment', 'Documentation', 'Bug Fixes'])}`,
          description: `Deliverables for milestone ${i} of ${numMilestones}`,
          amount: milestoneAmount.toFixed(2),
          due_date: new Date(contract.start_date.getTime() + (i * 14 * 86400000)), // Every 2 weeks
          status: i === 1 && contract.status === 'completed' 
            ? 'released' 
            : randomElement(['pending', 'in_escrow', 'released']),
        });
        milestonesCount++;
      }
    }

    console.log(`✅ Created ${milestonesCount} milestones\n`);

    // ======================
    // 6. CREATE MESSAGES
    // ======================
    console.log('💬 Creating messages...');

    const messageTemplates = [
      { from: 'client', text: 'Hi! I reviewed your application and would like to discuss the project in more detail.' },
      { from: 'freelancer', text: 'Thank you for considering my application! I am available for a call anytime this week.' },
      { from: 'client', text: 'Great! How about we schedule a call for tomorrow at 2 PM?' },
      { from: 'freelancer', text: 'Perfect, that works for me. Looking forward to it!' },
      { from: 'client', text: 'Just sent over the project requirements document. Let me know if you have any questions.' },
      { from: 'freelancer', text: 'Received! I will review it and get back to you by end of day.' },
      { from: 'freelancer', text: 'Quick update: I have completed the first milestone. Can you please review?' },
      { from: 'client', text: 'Looks great! Releasing the payment now. Keep up the good work!' },
    ];

    let messagesCount = 0;
    for (const contract of createdContracts.slice(0, 10)) { // Add messages for 10 contracts
      const job = await db.query.jobs.findFirst({ where: (jobs, { eq }) => eq(jobs.id, contract.job_id) });
      
      for (let i = 0; i < 4; i++) {
        const template = messageTemplates[i];
        const sender = template.from === 'client' ? contract.client_id : contract.freelancer_id;
        const recipient = template.from === 'client' ? contract.freelancer_id : contract.client_id;

        await db.insert(messages).values({
          sender_id: sender,
          recipient_id: recipient,
          content: template.text,
          read_at: Math.random() > 0.3 ? randomPastDate(5) : null, // 70% read
          created_at: new Date(contract.start_date.getTime() + (i * 86400000)), // One per day
        });
        messagesCount++;
      }
    }

    console.log(`✅ Created ${messagesCount} messages\n`);

    // ======================
    // 7. CREATE REVIEWS
    // ======================
    console.log('⭐ Creating reviews...');

    const completedContracts = createdContracts.filter(c => c.status === 'completed');
    let reviewsCount = 0;

    for (const contract of completedContracts) {
      // Client reviews freelancer
      await db.insert(reviews).values({
        contract_id: contract.id,
        reviewer_id: contract.client_id,
        reviewee_id: contract.freelancer_id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: randomElement([
          'Excellent work! Very professional and delivered on time.',
          'Great communication and quality work. Highly recommended!',
          'Exceeded expectations. Will definitely work together again.',
          'Professional, skilled, and easy to work with.',
        ]),
      });

      // Freelancer reviews client
      await db.insert(reviews).values({
        contract_id: contract.id,
        reviewer_id: contract.freelancer_id,
        reviewee_id: contract.client_id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: randomElement([
          'Great client with clear requirements. Smooth collaboration!',
          'Excellent communication and prompt payments. Pleasure to work with!',
          'Professional and respectful. Would love to work together again.',
          'Clear expectations and great feedback throughout the project.',
        ]),
      });

      reviewsCount += 2;
    }

    console.log(`✅ Created ${reviewsCount} reviews\n`);

    // ======================
    // 8. CREATE AI PROVIDERS
    // ======================
    console.log('🤖 Setting up AI providers...');

    await db.insert(aiProviders).values([
      {
        name: 'openai',
        api_key_encrypted: 'encrypted_openai_key_placeholder', // In production, encrypt with proper key management
        model: 'gpt-4-turbo-preview',
        is_active: true,
        priority: 1,
        monthly_budget: '1000.00',
        monthly_spend: '234.56',
      },
      {
        name: 'groq',
        api_key_encrypted: 'encrypted_groq_key_placeholder',
        model: 'llama-3.1-70b-versatile',
        is_active: true,
        priority: 2,
        monthly_budget: '500.00',
        monthly_spend: '89.12',
      },
      {
        name: 'anthropic',
        api_key_encrypted: 'encrypted_anthropic_key_placeholder',
        model: 'claude-3-sonnet-20240229',
        is_active: false, // Not active initially
        priority: 3,
        monthly_budget: '800.00',
        monthly_spend: '0.00',
      },
    ]);

    // AI Routing Rules
    const providers = await db.query.aiProviders.findMany();
    const openaiProvider = providers.find(p => p.name === 'openai')!;
    const groqProvider = providers.find(p => p.name === 'groq')!;

    await db.insert(aiRoutingRules).values([
      {
        task_type: 'job_matching',
        provider_id: groqProvider.id, // Use Groq (cheaper) for matching
        fallback_provider_id: openaiProvider.id,
      },
      {
        task_type: 'skill_extraction',
        provider_id: groqProvider.id,
        fallback_provider_id: openaiProvider.id,
      },
      {
        task_type: 'profile_enhancement',
        provider_id: openaiProvider.id, // Use OpenAI (better quality) for profiles
        fallback_provider_id: groqProvider.id,
      },
    ]);

    console.log('✅ AI providers and routing rules configured\n');

    // ======================
    // SEED COMPLETE
    // ======================
    console.log('🎉 Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${1 + clientUsers.length + freelancerUsers.length} (1 admin, ${clientUsers.length} clients, ${freelancerUsers.length} freelancers)`);
    console.log(`   - Jobs: ${createdJobs.length}`);
    console.log(`   - Applications: ${createdApplications.length}`);
    console.log(`   - Contracts: ${createdContracts.length}`);
    console.log(`   - Milestones: ${milestonesCount}`);
    console.log(`   - Messages: ${messagesCount}`);
    console.log(`   - Reviews: ${reviewsCount}`);
    console.log(`   - AI Providers: 3`);
    console.log('\n🔑 Login credentials (all demo users):');
    console.log('   Email: [any from above]');
    console.log('   Password: password123');
    console.log('\n   Admin: admin@carphatian.ro / password123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
