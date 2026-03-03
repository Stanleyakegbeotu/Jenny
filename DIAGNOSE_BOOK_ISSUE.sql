-- ============================================================================
-- COMPREHENSIVE BOOK PERSISTENCE DIAGNOSTIC
-- ============================================================================
-- Run this script to identify why books aren't persisting
-- ============================================================================

-- 1. Check if books table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'books'
) as books_table_exists;

-- 2. Show books table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on books table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'books';

-- 4. Check all policies on books table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'books'
ORDER BY policyname;

-- 5. Check if books table is empty
SELECT COUNT(*) as total_books FROM books;

-- 6. List any existing books (with timestamps)
SELECT id, title, created_at, updated_at FROM books ORDER BY created_at DESC;

-- ============================================================================
-- IF YOUR BOOKS TABLE EXISTS AND HAS NO POLICIES, RUN THIS:
-- ============================================================================
/*
-- Double check RLS is enabled
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "books_select" ON books CASCADE;
DROP POLICY IF EXISTS "books_insert" ON books CASCADE;
DROP POLICY IF EXISTS "books_update" ON books CASCADE;
DROP POLICY IF EXISTS "books_delete" ON books CASCADE;

-- Create permissive (allow all) policies
CREATE POLICY "books_select" ON books FOR SELECT USING (true);
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "books_update" ON books FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "books_delete" ON books FOR DELETE USING (true);

-- Verify policies were created
SELECT policyname, permissive FROM pg_policies WHERE tablename = 'books' ORDER BY policyname;
*/

-- ============================================================================
-- IF YOUR CHAPTERS TABLE IS MISSING OR HAS NO POLICIES, RUN THIS:
-- ============================================================================
/*
-- Create chapters table if it doesn't exist
CREATE TABLE IF NOT EXISTS chapters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  preview_text text,
  chapter_number integer DEFAULT 1,
  "order" integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS chapters_book_id_idx ON chapters(book_id);
CREATE INDEX IF NOT EXISTS chapters_order_idx ON chapters(book_id, "order");

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "chapters_select" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_insert" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_update" ON chapters CASCADE;
DROP POLICY IF EXISTS "chapters_delete" ON chapters CASCADE;

-- Create permissive policies
CREATE POLICY "chapters_select" ON chapters FOR SELECT USING (true);
CREATE POLICY "chapters_insert" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "chapters_update" ON chapters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "chapters_delete" ON chapters FOR DELETE USING (true);

-- Verify
SELECT policyname, permissive FROM pg_policies WHERE tablename = 'chapters' ORDER BY policyname;
*/
