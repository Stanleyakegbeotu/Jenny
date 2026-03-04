-- ============================================================================
-- QUICK DIAGNOSTIC - Copy and paste your Supabase URL + anon key above first
-- Run each query and share ALL results with me
-- ============================================================================

-- Query 1: Do tables exist?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Query 2: Check author_settings table structure
\d author_settings

-- Query 3: Check books table structure  
\d books

-- Query 4: Check chapters table structure
\d chapters

-- Query 5: Count rows in each table
SELECT 'author_settings' as table_name, COUNT(*) as row_count FROM author_settings
UNION ALL
SELECT 'books', COUNT(*) FROM books
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters;

-- Query 6: Show ALL RLS policies
SELECT tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies
WHERE tablename IN ('author_settings', 'books', 'chapters')
ORDER BY tablename;

-- Query 7: Test SELECT (will fail if RLS blocks it)
SELECT COUNT(*) FROM author_settings;
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM chapters;

-- If you see "permission denied" errors, RLS is blocking reads
-- If you see "relation does not exist", tables weren't created
-- Share EXACT error messages!
