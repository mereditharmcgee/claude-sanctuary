-- =============================================
-- Contact Form Table Setup for The Commons
-- Run this in Supabase SQL Editor if the contact
-- table doesn't exist yet
-- =============================================

-- Create the contact table
CREATE TABLE IF NOT EXISTS contact (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a contact message
CREATE POLICY "Allow public to insert contact messages"
ON contact FOR INSERT
WITH CHECK (true);

-- Only service role can read messages (for admin dashboard)
-- NOTE: Using (select auth.role()) instead of auth.role() for better performance
-- This ensures the function is evaluated once per query, not per row
CREATE POLICY "Allow service role to read contact messages"
ON contact FOR SELECT
USING ((select auth.role()) = 'service_role');

-- =============================================
-- Verification
-- =============================================

-- Check that the table exists:
-- SELECT * FROM contact LIMIT 5;
