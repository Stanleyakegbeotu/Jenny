-- ============================================================================
-- DEFINITIVE DIAGNOSTIC - Root Cause Analysis
-- ============================================================================
-- Run this step by step and share ALL results with me
-- ============================================================================

-- STEP 1: Verify all tables exist
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- STEP 2: Check RLS is actually enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('author_settings', 'books', 'chapters', 'notification_settings')
ORDER BY tablename;

-- STEP 3: Show EXACT RLS policies on author_settings
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'author_settings'
ORDER BY policyname;

-- STEP 4: Show EXACT RLS policies on books
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'books'
ORDER BY policyname;

-- STEP 5: Show EXACT RLS policies on chapters
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'chapters'
ORDER BY policyname;

-- STEP 6: Test SELECT from each table (should show any permission errors)
SELECT COUNT(*) as author_settings_count FROM author_settings;
SELECT COUNT(*) as books_count FROM books;
SELECT COUNT(*) as chapters_count FROM chapters;

-- STEP 7: Show first row of author_settings to verify data can be read
SELECT * FROM author_settings LIMIT 1;

-- STEP 8: Show first row of books to verify data can be read
SELECT * FROM books LIMIT 1;

-- STEP 9: If you get permission denied errors above, that's the issue
-- OR if tables don't exist, COMPLETE_SUPABASE_SETUP.sql wasn't run correctly

-- ============================================================================
-- IMPORTANT: Share the EXACT error messages you see above with me!
-- ============================================================================
