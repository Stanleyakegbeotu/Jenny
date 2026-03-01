-- ============================================================================
-- Fix Analytics Events RLS Policy
-- ============================================================================
-- This migration fixes the RLS policy on analytics_events table to allow
-- anonymous users to insert and read analytics data (needed for .select() after INSERT)
--
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR-PROJECT/sql/new

-- Drop the old authenticated-only SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read analytics" ON analytics_events;

-- Create new public SELECT policy
CREATE POLICY "Allow public read on analytics_events"
  ON analytics_events FOR SELECT
  USING (true);

-- Verify the policies are in place
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'analytics_events'
-- ORDER BY policyname;
