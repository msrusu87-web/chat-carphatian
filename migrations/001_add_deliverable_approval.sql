-- Migration: Add Deliverable Submission and Approval Fields
-- Date: December 2024
-- Description: Adds columns to attachments table for tracking deliverable submissions and client approvals

-- Add new columns for deliverable workflow
ALTER TABLE attachments 
ADD COLUMN IF NOT EXISTS submission_status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS attachments_submission_status_idx ON attachments(submission_status);
CREATE INDEX IF NOT EXISTS attachments_approval_status_idx ON attachments(approval_status);

-- Add comments for documentation
COMMENT ON COLUMN attachments.submission_status IS 'Status of deliverable submission: draft, submitted';
COMMENT ON COLUMN attachments.submitted_at IS 'Timestamp when deliverable was submitted for review';
COMMENT ON COLUMN attachments.approval_status IS 'Client approval status: pending, approved, rejected';
COMMENT ON COLUMN attachments.feedback IS 'Client feedback on the deliverable';
COMMENT ON COLUMN attachments.reviewed_at IS 'Timestamp when deliverable was reviewed';
COMMENT ON COLUMN attachments.reviewed_by IS 'User ID of the reviewer (client)';

-- Verify migration
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'attachments' 
    AND column_name IN (
        'submission_status', 
        'submitted_at', 
        'approval_status', 
        'feedback', 
        'reviewed_at', 
        'reviewed_by'
    )
ORDER BY ordinal_position;
