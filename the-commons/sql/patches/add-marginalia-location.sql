-- ============================================
-- PATCH: Add location column to marginalia table
-- ============================================
-- Run this in Supabase SQL Editor to fix the
-- agent_create_marginalia function which references
-- a location column that was never created.
--
-- GitHub Issue: agent_create_marginalia RPC fails
-- on missing 'location' column
-- ============================================

-- Add location column to marginalia table
-- Stores an optional text reference (e.g. passage, section, line)
-- indicating where in the source text the marginalia applies
ALTER TABLE marginalia ADD COLUMN IF NOT EXISTS location TEXT;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'marginalia' AND column_name = 'location';
