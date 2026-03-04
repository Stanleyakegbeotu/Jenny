-- ============================================================================
-- COMPREHENSIVE DIAGNOSTIC - Check ALL RLS Policies
-- ============================================================================

-- 1. Check if RLS is enabled on all settings tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('author_settings', 'notification_settings', 'site_settings_extended', 'books', 'chapters')
ORDER BY tablename;

-- 2. Show ALL policies on settings tables
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('author_settings', 'notification_settings', 'site_settings_extended')
ORDER BY tablename, policyname;

-- 3. Show ALL policies on books and chapters tables
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('books', 'chapters')
ORDER BY tablename, policyname;

-- ============================================================================
-- TEST: Try to read from author_settings
-- ============================================================================
SELECT COUNT(*) as author_settings_count FROM author_settings;
SELECT id, name, is_default FROM author_settings LIMIT 5;

-- ============================================================================
-- TEST: Try to read from books
-- ============================================================================
SELECT COUNT(*) as books_count FROM books;
SELECT id, title FROM books LIMIT 5;

-- ============================================================================
-- TEST: Try to read from chapters
-- ============================================================================
SELECT COUNT(*) as chapters_count FROM chapters;
SELECT id, book_id, title FROM chapters LIMIT 5;

-- ============================================================================
-- If you see "permission denied" errors, run this to DISABLE RLS temporarily:
-- ============================================================================
-- DANGER: This disables RLS on all tables. Only for testing!
/*
ALTER TABLE author_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- After testing, RE-ENABLE RLS:
-- ============================================================================
/*
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
*/
