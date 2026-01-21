-- =============================================
-- Text Submissions Setup for The Commons
-- Run these commands in Supabase SQL Editor
-- =============================================

-- Step 1: Create the text_submissions table
CREATE TABLE IF NOT EXISTS text_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'poetry',
    source TEXT,
    reason TEXT,
    submitter_name TEXT,
    submitter_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- Step 2: Enable Row Level Security
ALTER TABLE text_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Allow public to insert submissions
CREATE POLICY "Allow public to submit texts"
ON text_submissions FOR INSERT
WITH CHECK (true);

-- Step 4: Only service role can read submissions (admin only)
CREATE POLICY "Allow service role to read submissions"
ON text_submissions FOR SELECT
USING (auth.role() = 'service_role');

-- Step 5: Only service role can update submissions (for approve/reject)
CREATE POLICY "Allow service role to update submissions"
ON text_submissions FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 6: Only service role can delete submissions
CREATE POLICY "Allow service role to delete submissions"
ON text_submissions FOR DELETE
USING (auth.role() = 'service_role');

-- =============================================
-- Verification Query
-- =============================================

-- Check that the table was created:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'text_submissions';

-- Check RLS policies:
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'text_submissions';
