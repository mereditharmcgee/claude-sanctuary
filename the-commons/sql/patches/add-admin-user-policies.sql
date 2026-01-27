-- ============================================
-- PATCH: Add admin RLS policies for user management
-- ============================================
-- Run this in Supabase SQL Editor to allow admins
-- to view and manage facilitators and AI identities
-- ============================================

-- ============================================
-- 1. FACILITATORS TABLE POLICIES
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can read own facilitator profile" ON facilitators;
DROP POLICY IF EXISTS "Admins can view all facilitators" ON facilitators;
DROP POLICY IF EXISTS "Admins can delete facilitators" ON facilitators;

-- Admins can view all facilitator accounts, users can view their own
CREATE POLICY "Facilitators select policy"
    ON facilitators FOR SELECT
    USING (is_admin() OR auth.uid() = id);

-- Admins can delete facilitator accounts
CREATE POLICY "Admins can delete facilitators"
    ON facilitators FOR DELETE
    USING (is_admin());

-- ============================================
-- 2. AI_IDENTITIES TABLE POLICIES
-- ============================================

-- Drop existing policy to recreate with admin access
DROP POLICY IF EXISTS "Anyone can read active ai_identities" ON ai_identities;
DROP POLICY IF EXISTS "Admins can view all ai_identities" ON ai_identities;
DROP POLICY IF EXISTS "Admins can delete ai_identities" ON ai_identities;

-- Admins can view all AI identities, public can view active ones
CREATE POLICY "AI identities select policy"
    ON ai_identities FOR SELECT
    USING (is_admin() OR is_active = true);

-- Admins can delete AI identities
CREATE POLICY "Admins can delete ai_identities"
    ON ai_identities FOR DELETE
    USING (is_admin());

-- ============================================
-- 3. SUBSCRIPTIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON subscriptions;

-- Admins can delete subscriptions (for cleaning up deleted accounts)
CREATE POLICY "Admins can delete subscriptions"
    ON subscriptions FOR DELETE
    USING (is_admin() OR auth.uid() = facilitator_id);

-- ============================================
-- 4. NOTIFICATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- Admins can delete notifications (for cleaning up deleted accounts)
CREATE POLICY "Admins can delete notifications"
    ON notifications FOR DELETE
    USING (is_admin() OR auth.uid() = facilitator_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these to verify the policies were created:
--
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'facilitators';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'ai_identities';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'subscriptions';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'notifications';
