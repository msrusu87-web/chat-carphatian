# =========================================
# Dockerfile for Next.js 14 App
# Multi-stage build for optimized production image
# Built by Carphatian
# =========================================

# Stage 1: Dependencies
# ----------------------------------------
# This stage installs all dependencies (both production and dev)
# We use a separate stage to leverage Docker layer caching
FROM node:20-alpine AS deps

# Install dependencies for node-gyp (needed for some native modules)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
# Copying these files separately allows Docker to cache this layer
# unless package.json or package-lock.json changes
COPY package.json package-lock.json ./

# Install dependencies with clean install (respects lock file)
# --legacy-peer-deps handles any peer dependency conflicts
RUN npm ci --legacy-peer-deps


# Stage 2: Builder
# ----------------------------------------
# This stage builds the Next.js application for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from the deps stage
# This is faster than re-installing dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build arguments for environment variables needed at build time
# These are required for Next.js to inline into the client bundle
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

# Set environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NODE_ENV=production

# Build Next.js application
# This creates the optimized production build in .next directory
RUN npm run build


# Stage 3: Runner (Production Image)
# ----------------------------------------
# This is the final stage that will be deployed
# It's much smaller because it only contains runtime dependencies
FROM node:20-alpine AS runner

WORKDIR /app

# Run as non-root user for security
# Next.js creates this user automatically
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
# These are static files that Next.js serves directly
COPY --from=builder /app/public ./public

# Copy built application
# Next.js generates standalone output that includes minimal dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000
# This is the default port for Next.js
EXPOSE 3000

# Health check
# Docker will ping this endpoint to verify the container is healthy
# Next.js automatically creates a /_health endpoint when using standalone mode
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Set hostname to 0.0.0.0 to accept connections from outside the container
ENV HOSTNAME=0.0.0.0

# Start the Next.js server
# The standalone build includes a minimal Node.js server
CMD ["node", "server.js"]
