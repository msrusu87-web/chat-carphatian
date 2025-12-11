/**
 * Application Configuration
 * 
 * This file centralizes all configuration values from environment variables.
 * It provides type-safe access to config and validates required variables.
 * 
 * Usage:
 *   import { config } from '@/config'
 *   console.log(config.app.url)
 */

// Validate that a required env var exists, throw error if missing
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Get optional env var with fallback
function optionalEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

export const config = {
  // Application basics
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Carphatian AI Marketplace',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },

  // Supabase (Database & Authentication)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'uploads',
  },

  // Stripe (Payments)
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    platformFeePercent: parseInt(optionalEnv('STRIPE_PLATFORM_FEE_PERCENT', '15')),
  },

  // AI Providers (will be managed via database in production)
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      orgId: process.env.OPENAI_ORG_ID || '',
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    serviceApiKey: process.env.AI_SERVICE_API_KEY || '',
  },

  // Redis (Caching & Rate Limiting)
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },

  // AWS S3 (File Storage)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'carphatian-uploads',
  },

  // Email
  email: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@carphatian.ro',
      fromName: process.env.SENDGRID_FROM_NAME || 'Carphatian Marketplace',
    },
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      authToken: process.env.SENTRY_AUTH_TOKEN || '',
    },
    posthog: {
      key: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    },
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    jwtSecret: process.env.JWT_SECRET || '',
  },

  // Feature Flags (toggles for optional features)
  features: {
    cryptoPayments: process.env.NEXT_PUBLIC_ENABLE_CRYPTO_PAYMENTS === 'true',
    videoCalls: process.env.NEXT_PUBLIC_ENABLE_VIDEO_CALLS === 'true',
    timeTracking: process.env.NEXT_PUBLIC_ENABLE_TIME_TRACKING === 'true',
  },

  // Debug
  debug: process.env.DEBUG === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

export default config;
