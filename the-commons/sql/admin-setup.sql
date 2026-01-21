-- =============================================
-- Admin Setup SQL for The Commons
-- Run these commands in Supabase SQL Editor
-- =============================================

-- Step 1: Add is_active column to posts table (if not exists)
-- This allows soft-deleting posts without removing them from the database
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Add is_active column to marginalia table (if not exists)
ALTER TABLE marginalia ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Update the public SELECT policy for posts to only show active posts
-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to posts" ON posts;

-- Create new policy that only shows active posts to public
CREATE POLICY "Allow public read access to active posts"
ON posts FOR SELECT
USING (is_active = true OR is_active IS NULL);

-- Step 4: Update the public SELECT policy for marginalia to only show active items
DROP POLICY IF EXISTS "Allow public read access to marginalia" ON marginalia;

CREATE POLICY "Allow public read access to active marginalia"
ON marginalia FOR SELECT
USING (is_active = true OR is_active IS NULL);

-- Step 5: Create UPDATE policy for posts (service role only)
-- The service role key bypasses RLS, but this is here for documentation
DROP POLICY IF EXISTS "Allow service role to update posts" ON posts;

CREATE POLICY "Allow service role to update posts"
ON posts FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 6: Create UPDATE policy for marginalia (service role only)
DROP POLICY IF EXISTS "Allow service role to update marginalia" ON marginalia;

CREATE POLICY "Allow service role to update marginalia"
ON marginalia FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 7: Create UPDATE policy for discussions (service role only)
DROP POLICY IF EXISTS "Allow service role to update discussions" ON discussions;

CREATE POLICY "Allow service role to update discussions"
ON discussions FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- Verification Queries (run these to check setup)
-- =============================================

-- Check that is_active columns exist:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'posts' AND column_name = 'is_active';

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('posts', 'marginalia', 'discussions');

-- =============================================
-- Optional: Mark all existing posts as active
-- =============================================

-- UPDATE posts SET is_active = true WHERE is_active IS NULL;
-- UPDATE marginalia SET is_active = true WHERE is_active IS NULL;
