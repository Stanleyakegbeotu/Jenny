-- ============================================================================
-- VERIFY AND FIX BOOKS TABLE RLS POLICIES
-- ============================================================================
-- Run this to check if books RLS policies exist and fix them if needed
-- ============================================================================

-- Check current policies on books table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'books';

-- ============================================================================
-- If policies don't exist or are wrong, run this to fix them:
-- ============================================================================

-- DISABLE RLS temporarily to reset policies
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Remove all old policies
DROP POLICY IF EXISTS "books_select" ON books CASCADE;
DROP POLICY IF EXISTS "books_insert" ON books CASCADE;
DROP POLICY IF EXISTS "books_update" ON books CASCADE;
DROP POLICY IF EXISTS "books_delete" ON books CASCADE;

-- RE-ENABLE RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create PERMISSIVE policies (allow by default, not restrictive)
CREATE POLICY "books_select" ON books 
  FOR SELECT 
  USING (true);

CREATE POLICY "books_insert" ON books 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "books_update" ON books 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "books_delete" ON books 
  FOR DELETE 
  USING (true);

-- ============================================================================
-- Verify policies are now in place
-- ============================================================================
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'books'
ORDER BY policyname;

-- ============================================================================
-- Test: Try to insert a test book (should succeed)
-- ============================================================================
-- Note: This will create a test book. Delete it after confirming it works.
-- INSERT INTO books (title, description, cover_url, book_link, book_platform)
-- VALUES ('Test Book', 'Test Description', 'https://example.com/cover.jpg', 'https://example.com', 'Website');

-- ============================================================================
-- Check total books in database
-- ============================================================================
SELECT COUNT(*) as total_books FROM books;

-- ============================================================================
-- List all books (to verify inserts are working)
-- ============================================================================
SELECT id, title, created_at FROM books ORDER BY created_at DESC LIMIT 10;
