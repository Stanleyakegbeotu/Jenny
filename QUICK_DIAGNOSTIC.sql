-- ============================================================================
-- QUICK DIAGNOSTIC - Run each query one by one
-- Share ALL results with me
-- ============================================================================

-- Query 1: Do tables exist?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Query 2: Check author_settings table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'author_settings'
ORDER BY ordinal_position;

-- Query 3: Check books table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- Query 4: Check chapters table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chapters'
ORDER BY ordinal_position;

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
ORDER BY tablename, policyname;

-- Query 7: Test SELECT (will fail if RLS blocks it)
SELECT COUNT(*) as author_settings_count FROM author_settings;
SELECT COUNT(*) as books_count FROM books;
SELECT COUNT(*) as chapters_count FROM chapters;

-- If you see "permission denied" errors, RLS is blocking reads
-- If you see "relation does not exist", tables weren't created
-- Share EXACT error messages!
