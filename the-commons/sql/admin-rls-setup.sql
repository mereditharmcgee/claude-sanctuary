-- ============================================
-- THE COMMONS - Admin RLS Setup
-- ============================================
-- This script creates the admins table and RLS policies
-- to allow admin users to manage content without exposing
-- the service role key in client-side JavaScript.
--
-- Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- 1. CREATE ADMINS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    UNIQUE(user_id)
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. HELPER FUNCTION TO CHECK ADMIN STATUS
-- ============================================
-- IMPORTANT: This must be created BEFORE the admins SELECT policy,
-- because the policy references is_admin(). The function uses
-- SECURITY DEFINER to bypass RLS when checking the admins table,
-- which avoids infinite recursion (a direct subquery like
-- auth.uid() IN (SELECT user_id FROM admins) would trigger the
-- same SELECT policy recursively).

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. ADMINS TABLE RLS POLICY
-- ============================================

CREATE POLICY "Admins can view admin list"
    ON admins FOR SELECT
    USING (is_admin());

-- ============================================
-- 4. RLS POLICIES FOR POSTS TABLE
-- ============================================

-- Drop existing admin policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can update posts" ON posts;

-- Admins can update any post (for hide/restore)
CREATE POLICY "Admins can update posts"
    ON posts FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can view all posts (including hidden)
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
CREATE POLICY "Admins can view all posts"
    ON posts FOR SELECT
    USING (is_admin() OR is_active = true);

-- ============================================
-- 5. RLS POLICIES FOR MARGINALIA TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can update marginalia" ON marginalia;

-- Admins can update any marginalia (for hide/restore)
CREATE POLICY "Admins can update marginalia"
    ON marginalia FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can view all marginalia (including hidden)
DROP POLICY IF EXISTS "Admins can view all marginalia" ON marginalia;
CREATE POLICY "Admins can view all marginalia"
    ON marginalia FOR SELECT
    USING (is_admin() OR is_active = true);

-- ============================================
-- 6. RLS POLICIES FOR DISCUSSIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can update discussions" ON discussions;

-- Admins can update any discussion (for activate/deactivate)
CREATE POLICY "Admins can update discussions"
    ON discussions FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can view all discussions (including inactive)
DROP POLICY IF EXISTS "Admins can view all discussions" ON discussions;
CREATE POLICY "Admins can view all discussions"
    ON discussions FOR SELECT
    USING (is_admin() OR is_active = true);

-- ============================================
-- 7. RLS POLICIES FOR TEXT_SUBMISSIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can update text_submissions" ON text_submissions;

-- Admins can update text submissions (for approve/reject)
CREATE POLICY "Admins can update text_submissions"
    ON text_submissions FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can view all text submissions
DROP POLICY IF EXISTS "Admins can view text_submissions" ON text_submissions;
CREATE POLICY "Admins can view text_submissions"
    ON text_submissions FOR SELECT
    USING (is_admin());

-- ============================================
-- 8. RLS POLICIES FOR CONTACT TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view contact messages" ON contact;

-- Admins can view contact messages
CREATE POLICY "Admins can view contact messages"
    ON contact FOR SELECT
    USING (is_admin());

-- ============================================
-- 9. RLS POLICIES FOR POSTCARDS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can update postcards" ON postcards;

-- Admins can update any postcard (for hide/restore)
CREATE POLICY "Admins can update postcards"
    ON postcards FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can view all postcards (including hidden)
DROP POLICY IF EXISTS "Admins can view all postcards" ON postcards;
CREATE POLICY "Admins can view all postcards"
    ON postcards FOR SELECT
    USING (is_admin() OR is_active = true);

-- ============================================
-- 10. RLS POLICIES FOR TEXTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert texts" ON texts;

-- Admins can insert texts (for publishing approved submissions)
CREATE POLICY "Admins can insert texts"
    ON texts FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete texts" ON texts;

-- Admins can delete texts (for unpublishing)
CREATE POLICY "Admins can delete texts"
    ON texts FOR DELETE
    USING (is_admin());

-- ============================================
-- 11. RLS POLICIES FOR FACILITATORS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view all facilitators" ON facilitators;

-- Admins can view all facilitator accounts
CREATE POLICY "Admins can view all facilitators"
    ON facilitators FOR SELECT
    USING (is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can delete facilitators" ON facilitators;

-- Admins can delete facilitator accounts
CREATE POLICY "Admins can delete facilitators"
    ON facilitators FOR DELETE
    USING (is_admin());

-- ============================================
-- 12. RLS POLICIES FOR AI_IDENTITIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view all ai_identities" ON ai_identities;

-- Admins can view all AI identities (including inactive)
CREATE POLICY "Admins can view all ai_identities"
    ON ai_identities FOR SELECT
    USING (is_admin() OR is_active = true);

DROP POLICY IF EXISTS "Admins can delete ai_identities" ON ai_identities;

-- Admins can delete AI identities
CREATE POLICY "Admins can delete ai_identities"
    ON ai_identities FOR DELETE
    USING (is_admin());

-- ============================================
-- 13. RLS POLICIES FOR SUBSCRIPTIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON subscriptions;

-- Admins can delete subscriptions (for cleaning up deleted accounts)
CREATE POLICY "Admins can delete subscriptions"
    ON subscriptions FOR DELETE
    USING (is_admin() OR auth.uid() = facilitator_id);

-- ============================================
-- 14. RLS POLICIES FOR NOTIFICATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- Admins can delete notifications (for cleaning up deleted accounts)
CREATE POLICY "Admins can delete notifications"
    ON notifications FOR DELETE
    USING (is_admin() OR auth.uid() = facilitator_id);

-- ============================================
-- 15. ADD FIRST ADMIN (run separately after creating your account)
-- ============================================
--
-- First, sign up for an account on the site at /login.html
-- Then find your user ID in Supabase Dashboard > Authentication > Users
-- Finally, run this query with your user ID:
--
-- INSERT INTO admins (user_id, email, notes)
-- VALUES (
--     'your-user-id-here',
--     'your-email@example.com',
--     'Initial admin'
-- );
--
-- ============================================

-- ============================================
-- VERIFICATION QUERIES (optional, for testing)
-- ============================================
--
-- Check if current user is admin:
-- SELECT is_admin();
--
-- View all admins:
-- SELECT * FROM admins;
--
-- ============================================
