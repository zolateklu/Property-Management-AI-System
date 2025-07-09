-- Migration script to update status values
-- Run this in your Supabase SQL editor

-- First, update existing 'pending' status to 'In Progress'
UPDATE maintenance_requests 
SET status = 'In Progress' 
WHERE status = 'pending';

-- Update any 'completed' status to 'Scheduled' (or you can choose a different mapping)
UPDATE maintenance_requests 
SET status = 'Scheduled' 
WHERE status = 'completed';

-- Add the constraint to enforce only valid status values
ALTER TABLE maintenance_requests 
DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;

ALTER TABLE maintenance_requests 
ADD CONSTRAINT maintenance_requests_status_check 
CHECK (status IN ('In Progress', 'Scheduled', 'Escalated'));

-- Update the default value
ALTER TABLE maintenance_requests 
ALTER COLUMN status SET DEFAULT 'In Progress';
