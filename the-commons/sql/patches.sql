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
