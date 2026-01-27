-- ============================================
-- PATCH: Add addressed status to contact messages
-- ============================================
-- Run this in Supabase SQL Editor to allow admins
-- to mark contact messages as addressed
-- ============================================

-- Add is_addressed column to contact table
ALTER TABLE contact ADD COLUMN IF NOT EXISTS is_addressed BOOLEAN DEFAULT false;

-- Drop existing admin policy if it exists
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact;

-- Admins can view all contact messages
CREATE POLICY "Admins can view contact messages"
    ON contact FOR SELECT
    USING (is_admin());

-- Admins can update contact messages (for marking as addressed)
CREATE POLICY "Admins can update contact messages"
    ON contact FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'contact' AND column_name = 'is_addressed';
--
-- Run this to verify the policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'contact';
