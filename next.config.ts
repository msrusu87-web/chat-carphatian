import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * This configuration enables features needed for production deployment:
 * - Standalone output mode: Creates a minimal production build for Docker
 * - Image optimization: Allows loading images from external domains
 * 
 * Built by Carphatian
 */
const nextConfig: NextConfig = {
  // ----------------------------------------
  // Standalone Output Mode
  // ----------------------------------------
  // This creates a self-contained build in .next/standalone/
  // that includes only the minimal Node.js server and dependencies needed
  // Perfect for Docker containers as it reduces image size significantly
  output: 'standalone',

  // ----------------------------------------
  // Image Optimization
  // ----------------------------------------
  // Configure domains allowed for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        // MinIO local development
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },

  // ----------------------------------------
  // Experimental Features
  // ----------------------------------------
  experimental: {
    // Server actions for form submissions and mutations
    serverActions: {
      bodySizeLimit: '5mb', // Increase limit for file uploads in server actions
    },
  },

  // ----------------------------------------
  // TypeScript
  // ----------------------------------------
  typescript: {
    // Type checking is done in CI/CD pipeline
    ignoreBuildErrors: false,
  },

  // ----------------------------------------
  // Headers
  // ----------------------------------------
  // Add security headers to all responses
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
