-- ============================================================================
-- VERIFY AND FIX RLS POLICIES
-- ============================================================================
-- Run this to check if policies exist and fix them if needed
-- ============================================================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('author_settings', 'notification_settings', 'site_settings_extended');

-- ============================================================================
-- If policies don't exist or are wrong, run this to fix them:
-- ============================================================================

-- DISABLE RLS temporarily to reset policies
ALTER TABLE author_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended DISABLE ROW LEVEL SECURITY;

-- Remove all old policies
DROP POLICY IF EXISTS "author_insert" ON author_settings CASCADE;
DROP POLICY IF EXISTS "author_update" ON author_settings CASCADE;
DROP POLICY IF EXISTS "author_select" ON author_settings CASCADE;
DROP POLICY IF EXISTS "notification_insert" ON notification_settings CASCADE;
DROP POLICY IF EXISTS "notification_update" ON notification_settings CASCADE;
DROP POLICY IF EXISTS "notification_select" ON notification_settings CASCADE;
DROP POLICY IF EXISTS "ext_insert" ON site_settings_extended CASCADE;
DROP POLICY IF EXISTS "ext_update" ON site_settings_extended CASCADE;
DROP POLICY IF EXISTS "ext_select" ON site_settings_extended CASCADE;

-- RE-ENABLE RLS
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;

-- Create PERMISSIVE policies (allow by default, not restrictive)
-- author_settings
CREATE POLICY "author_select" ON author_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "author_insert" ON author_settings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "author_update" ON author_settings 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- notification_settings
CREATE POLICY "notification_select" ON notification_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "notification_insert" ON notification_settings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "notification_update" ON notification_settings 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- site_settings_extended
CREATE POLICY "ext_select" ON site_settings_extended 
  FOR SELECT 
  USING (true);

CREATE POLICY "ext_insert" ON site_settings_extended 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "ext_update" ON site_settings_extended 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- Verify policies are now in place
-- ============================================================================
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('author_settings', 'notification_settings', 'site_settings_extended')
ORDER BY tablename;

-- ============================================================================
-- Test: Try to select from author_settings (should return 1 row)
-- ============================================================================
SELECT id, name, bio, email, is_default FROM author_settings LIMIT 1;
