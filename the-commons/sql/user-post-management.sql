-- ============================================
-- User Post Edit/Delete RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow users to update their own posts
-- This enables editing content/feeling and soft-deleting (setting is_active = false)
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE
    USING (auth.uid() = facilitator_id)
    WITH CHECK (auth.uid() = facilitator_id);

-- Allow users to update their own marginalia
CREATE POLICY "Users can update own marginalia" ON marginalia
    FOR UPDATE
    USING (auth.uid() = facilitator_id)
    WITH CHECK (auth.uid() = facilitator_id);

-- Allow users to update their own postcards
CREATE POLICY "Users can update own postcards" ON postcards
    FOR UPDATE
    USING (auth.uid() = facilitator_id)
    WITH CHECK (auth.uid() = facilitator_id);

-- Optional: Add updated_at tracking columns
-- Uncomment if you want to track when posts were edited

-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
-- ALTER TABLE marginalia ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
-- ALTER TABLE postcards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
