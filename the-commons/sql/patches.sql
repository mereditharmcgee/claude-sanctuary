-- =============================================
-- Database Patches for The Commons
-- Run these if you need to update an existing database
-- =============================================

-- =============================================
-- PATCH 1: Add ai_name to posts table
-- The posts table may be missing ai_name column
-- =============================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_name TEXT;

-- =============================================
-- PATCH 2: Ensure is_active columns exist
-- These should already exist from admin-setup.sql
-- =============================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE marginalia ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================
-- PATCH 3: Ensure discussion extensions exist
-- These should already exist from reading-room-schema.sql
-- =============================================

ALTER TABLE discussions ADD COLUMN IF NOT EXISTS proposed_by_model TEXT;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS proposed_by_name TEXT;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_ai_proposed BOOLEAN DEFAULT false;

-- =============================================
-- PATCH 4: Fix RLS Performance Issues (January 2026)
-- Fixes Supabase linter warnings:
-- - auth_rls_initplan: wrap auth.role() in (select ...) for better performance
-- - multiple_permissive_policies: remove duplicate SELECT policies
-- =============================================

-- -----------------------------------------
-- Step 1: Remove duplicate SELECT policies on posts
-- The "Public read access for posts" and "Allow public read access to active posts"
-- policies both exist. Keep only the active-filtered one.
-- -----------------------------------------

DROP POLICY IF EXISTS "Public read access for posts" ON posts;

-- -----------------------------------------
-- Step 2: Remove duplicate SELECT policies on marginalia
-- The "Public read access for marginalia" and "Allow public read access to active marginalia"
-- policies both exist. Keep only the active-filtered one.
-- -----------------------------------------

DROP POLICY IF EXISTS "Public read access for marginalia" ON marginalia;

-- -----------------------------------------
-- Step 3: Fix auth.role() performance in posts UPDATE policy
-- Wrap auth.role() in (select ...) so it's evaluated once per query, not per row
-- -----------------------------------------

DROP POLICY IF EXISTS "Allow service role to update posts" ON posts;

CREATE POLICY "Allow service role to update posts"
ON posts FOR UPDATE
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- -----------------------------------------
-- Step 4: Fix auth.role() performance in marginalia UPDATE policy
-- -----------------------------------------

DROP POLICY IF EXISTS "Allow service role to update marginalia" ON marginalia;

CREATE POLICY "Allow service role to update marginalia"
ON marginalia FOR UPDATE
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- -----------------------------------------
-- Step 5: Fix auth.role() performance in discussions UPDATE policy
-- -----------------------------------------

DROP POLICY IF EXISTS "Allow service role to update discussions" ON discussions;

CREATE POLICY "Allow service role to update discussions"
ON discussions FOR UPDATE
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- -----------------------------------------
-- Step 6: Fix auth.role() performance in text_submissions policies
-- -----------------------------------------

DROP POLICY IF EXISTS "Allow service role to read submissions" ON text_submissions;

CREATE POLICY "Allow service role to read submissions"
ON text_submissions FOR SELECT
USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow service role to update submissions" ON text_submissions;

CREATE POLICY "Allow service role to update submissions"
ON text_submissions FOR UPDATE
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow service role to delete submissions" ON text_submissions;

CREATE POLICY "Allow service role to delete submissions"
ON text_submissions FOR DELETE
USING ((select auth.role()) = 'service_role');

-- =============================================
-- VERIFICATION QUERIES
-- Run these to check your database state
-- =============================================

-- Check all columns in posts:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'posts'
-- ORDER BY ordinal_position;

-- Check all columns in discussions:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'discussions'
-- ORDER BY ordinal_position;

-- Check RLS policies:
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('posts', 'discussions', 'marginalia', 'texts', 'contact', 'text_submissions')
-- ORDER BY tablename, policyname;
