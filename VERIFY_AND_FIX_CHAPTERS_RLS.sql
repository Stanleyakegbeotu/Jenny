-- ============================================================================
-- VERIFY AND FIX CHAPTERS TABLE RLS POLICIES
-- ============================================================================
-- Run this to check if chapters RLS policies exist and fix them if needed
-- ============================================================================

-- Check current policies on chapters table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'chapters';

-- ============================================================================
-- If policies don't exist or are wrong, run this to fix them:
-- ============================================================================

-- DISABLE RLS temporarily to reset policies
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;

-- Remove all old policies
DROP POLICY IF EXISTS "chapters_select" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_insert" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_update" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_delete" ON chapters CASCADE;

-- RE-ENABLE RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create PERMISSIVE policies (allow by default, not restrictive)
CREATE POLICY "chapters_select" ON chapters 
  FOR SELECT 
  USING (true);

CREATE POLICY "chapters_insert" ON chapters 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "chapters_update" ON chapters 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "chapters_delete" ON chapters 
  FOR DELETE 
  USING (true);

-- ============================================================================
-- Verify policies are now in place
-- ============================================================================
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'chapters'
ORDER BY policyname;

-- ============================================================================
-- Test: Try to select chapters (should return data if any chapters exist)
-- ============================================================================
SELECT COUNT(*) as total_chapters FROM chapters;
SELECT id, book_id, title, chapter_number FROM chapters ORDER BY created_at DESC LIMIT 10;
