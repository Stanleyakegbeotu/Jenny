-- ============================================================================
-- EMERGENCY: Temporarily Disable RLS to Test if That's the Blocker
-- ============================================================================
-- Run this to DISABLE RLS on all tables for testing purposes
-- WARNING: This removes all row-level security! Only use for testing!
-- ============================================================================

ALTER TABLE author_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE book_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- Now test: Try adding a book or updating settings in your app
-- If data saves/persists now, then RLS is definitely the issue
-- Share the results with me!

-- ============================================================================
-- After testing, RE-ENABLE RLS ON ALL TABLES:
-- ============================================================================
/*
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
*/
