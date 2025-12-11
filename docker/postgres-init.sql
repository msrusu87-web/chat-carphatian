-- =========================================
-- PostgreSQL Initialization Script
-- Enables pgvector extension and creates initial schema
-- Built by Carphatian
-- =========================================

-- Enable pgvector extension for AI embeddings
-- This allows storing vector embeddings (e.g., from OpenAI) for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for commonly used status fields
-- This ensures data consistency and makes queries more efficient

-- User roles in the platform
CREATE TYPE user_role AS ENUM ('client', 'freelancer', 'admin');

-- Job status lifecycle
CREATE TYPE job_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');

-- Application status from freelancer perspective
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- Contract lifecycle
CREATE TYPE contract_status AS ENUM ('active', 'paused', 'completed', 'cancelled', 'disputed');

-- Milestone payment status
CREATE TYPE milestone_status AS ENUM ('pending', 'in_escrow', 'released', 'refunded');

-- Message read status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Payment transaction status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- AI provider options for routing
CREATE TYPE ai_provider_type AS ENUM ('openai', 'groq', 'anthropic');

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL initialization complete. Extensions and types created.';
END $$;
