-- ============================================================================
-- MASTER DATABASE SCHEMA - NENSHA JENNIFER APP
-- ============================================================================
-- This is the ONLY schema file you need. Everything is here.
-- Run this ONCE in Supabase SQL Editor.
-- 
-- IMPORTANT: This will DROP and recreate all tables.
-- Make sure you have backups if you want to keep existing data.
-- ============================================================================

-- ============================================================================
-- 1. BOOKS TABLE
-- ============================================================================
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT DEFAULT 'Jennifer Nensha',
  cover_image_url TEXT,
  release_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'published',
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE books IS 'Stores all published books by the author';

-- Enable RLS on books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_select_policy" ON books
  FOR SELECT USING (true);

CREATE POLICY "books_insert_policy" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "books_update_policy" ON books
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "books_delete_policy" ON books
  FOR DELETE USING (true);

-- Indexes for books
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_status ON books(status);

-- Grant permissions
GRANT ALL ON books TO anon, authenticated;

-- ============================================================================
-- 2. CHAPTERS TABLE
-- ============================================================================
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  chapter_number INTEGER,
  preview_text TEXT,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE chapters IS 'Stores chapters for each book';

-- Enable RLS on chapters
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chapters_select_policy" ON chapters
  FOR SELECT USING (true);

CREATE POLICY "chapters_insert_policy" ON chapters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "chapters_update_policy" ON chapters
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "chapters_delete_policy" ON chapters
  FOR DELETE USING (true);

-- Indexes for chapters
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_chapters_chapter_number ON chapters(chapter_number);

-- Grant permissions
GRANT ALL ON chapters TO anon, authenticated;

-- ============================================================================
-- 3. SUBSCRIBERS TABLE
-- ============================================================================
DROP TABLE IF EXISTS subscribers CASCADE;

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE subscribers IS 'Stores all email subscribers';

-- Enable RLS on subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers_select_policy" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "subscribers_insert_policy" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "subscribers_update_policy" ON subscribers
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "subscribers_delete_policy" ON subscribers
  FOR DELETE USING (true);

-- Indexes for subscribers
CREATE UNIQUE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_is_active ON subscribers(is_active);

-- Grant permissions
GRANT ALL ON subscribers TO anon, authenticated;

-- ============================================================================
-- 4. AUTHOR SETTINGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS author_settings CASCADE;

CREATE TABLE author_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Jennifer Nensha',
  bio TEXT,
  email TEXT,
  profile_image TEXT,
  total_reads INTEGER DEFAULT 0,
  books_published INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  reviews JSONB DEFAULT '[]'::JSONB,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE author_settings IS 'Stores author profile information and social links';

-- Enable RLS on author_settings
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "author_settings_select_policy" ON author_settings
  FOR SELECT USING (true);

CREATE POLICY "author_settings_insert_policy" ON author_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "author_settings_update_policy" ON author_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "author_settings_delete_policy" ON author_settings
  FOR DELETE USING (true);

-- Indexes for author_settings
CREATE INDEX idx_author_settings_is_default ON author_settings(is_default);

-- Grant permissions
GRANT ALL ON author_settings TO anon, authenticated;

-- ============================================================================
-- 5. HERO SETTINGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS hero_settings CASCADE;

CREATE TABLE hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image TEXT,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE hero_settings IS 'Stores hero section image for the landing page';

-- Enable RLS on hero_settings
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_settings_select_policy" ON hero_settings
  FOR SELECT USING (true);

CREATE POLICY "hero_settings_insert_policy" ON hero_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "hero_settings_update_policy" ON hero_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "hero_settings_delete_policy" ON hero_settings
  FOR DELETE USING (true);

-- Indexes for hero_settings
CREATE INDEX idx_hero_settings_is_default ON hero_settings(is_default);

-- Grant permissions
GRANT ALL ON hero_settings TO anon, authenticated;

-- ============================================================================
-- 6. NOTIFICATION SETTINGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS notification_settings CASCADE;

CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notify_new_subscribers BOOLEAN DEFAULT TRUE,
  notify_contact_form BOOLEAN DEFAULT TRUE,
  notify_book_views BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE notification_settings IS 'Stores notification preferences for admin alerts';

-- Enable RLS on notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_settings_select_policy" ON notification_settings
  FOR SELECT USING (true);

CREATE POLICY "notification_settings_insert_policy" ON notification_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notification_settings_update_policy" ON notification_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "notification_settings_delete_policy" ON notification_settings
  FOR DELETE USING (true);

-- Indexes for notification_settings
CREATE INDEX idx_notification_settings_is_default ON notification_settings(is_default);

-- Grant permissions
GRANT ALL ON notification_settings TO anon, authenticated;

-- ============================================================================
-- 7. BOOK VIEWS TABLE (FOR ANALYTICS)
-- ============================================================================
DROP TABLE IF EXISTS book_views CASCADE;

CREATE TABLE book_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE book_views IS 'Tracks book view analytics';

-- Enable RLS on book_views
ALTER TABLE book_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_views_insert_policy" ON book_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "book_views_select_policy" ON book_views
  FOR SELECT USING (true);

-- Indexes for book_views
CREATE INDEX idx_book_views_book_id ON book_views(book_id);
CREATE INDEX idx_book_views_viewed_at ON book_views(viewed_at DESC);

-- Grant permissions
GRANT ALL ON book_views TO anon, authenticated;

-- ============================================================================
-- 8. FORMSPREE SETTINGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS formspree_settings CASCADE;

CREATE TABLE formspree_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

COMMENT ON TABLE formspree_settings IS 'Stores Formspree contact form URL';

-- Enable RLS on formspree_settings
ALTER TABLE formspree_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formspree_settings_select_policy" ON formspree_settings
  FOR SELECT USING (true);

CREATE POLICY "formspree_settings_insert_policy" ON formspree_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "formspree_settings_update_policy" ON formspree_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "formspree_settings_delete_policy" ON formspree_settings
  FOR DELETE USING (true);

-- Indexes for formspree_settings
CREATE INDEX idx_formspree_settings_is_default ON formspree_settings(is_default);

-- Grant permissions
GRANT ALL ON formspree_settings TO anon, authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- All tables created successfully with proper RLS policies
-- All tables allow public read/write (anon + authenticated)
-- All tables have proper indexing for performance
-- All tables have timestamps for audit trail
