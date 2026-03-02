-- ============================================================================
-- COMPREHENSIVE SUPABASE SQL SETUP
-- ============================================================================
-- This script contains ALL necessary queries to set up the database for
-- NENSHA JENNIFER Romance Author Platform
-- 
-- Run this entire script in the Supabase SQL Editor
-- Copy everything, paste, and execute
-- ============================================================================

-- ============================================================================
-- 1. SITE SETTINGS TABLE - Stores Configuration (Formspree URL, etc.)
-- ============================================================================
DROP TABLE IF EXISTS site_settings CASCADE;

CREATE TABLE site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  description text,
  setting_type text DEFAULT 'text',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX site_settings_key_idx ON site_settings(setting_key);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
CREATE POLICY "site_settings_select" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_update" ON site_settings;
CREATE POLICY "site_settings_update" ON site_settings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "site_settings_insert" ON site_settings;
CREATE POLICY "site_settings_insert" ON site_settings FOR INSERT WITH CHECK (true);

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, description, setting_type)
VALUES
  ('formspree_contact_form_url', '', 'Formspree endpoint for contact form (https://formspree.io/f/xxxxxxx)', 'url'),
  ('admin_notification_email', '', 'Email address to receive admin notifications', 'text'),
  ('site_name', 'NENSHA JENNIFER', 'Site name for emails and headers', 'text'),
  ('site_email', 'info@nenshasworld.com', 'Sender email address', 'text')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 2. AUTHOR SETTINGS TABLE - Stores Author Profile Information
-- ============================================================================
DROP TABLE IF EXISTS author_settings CASCADE;

CREATE TABLE author_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text DEFAULT 'Jennifer Nensha',
  bio text DEFAULT '',
  email text DEFAULT '',
  profile_image text,
  total_reads integer DEFAULT 0,
  books_published integer DEFAULT 0,
  followers integer DEFAULT 0,
  instagram_url text,
  twitter_url text,
  linkedin_url text,
  reviews jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT true UNIQUE,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "author_select" ON author_settings;
CREATE POLICY "author_select" ON author_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "author_update" ON author_settings;
CREATE POLICY "author_update" ON author_settings FOR UPDATE USING (true) WITH CHECK (true);

-- Insert default author data
INSERT INTO author_settings (name, bio, email, is_default)
VALUES ('Jennifer Nensha', 'Romance author crafting tales of love and passion.', 'contact@jennifernens.com', true)
ON CONFLICT (is_default) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 3. SITE SETTINGS EXTENDED TABLE - Stores Extended Site Configuration
-- ============================================================================
DROP TABLE IF EXISTS site_settings_extended CASCADE;

CREATE TABLE site_settings_extended (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title text DEFAULT 'Nensha Jennifer - Romance Author',
  site_tagline text DEFAULT '',
  support_email text DEFAULT '',
  hero_image text,
  is_default boolean DEFAULT true UNIQUE,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "ext_select" ON site_settings_extended;
CREATE POLICY "ext_select" ON site_settings_extended FOR SELECT USING (true);

DROP POLICY IF EXISTS "ext_update" ON site_settings_extended;
CREATE POLICY "ext_update" ON site_settings_extended FOR UPDATE USING (true) WITH CHECK (true);

-- Insert default site data
INSERT INTO site_settings_extended (site_title, site_tagline, support_email, is_default)
VALUES ('Nensha Jennifer - Romance Author', 'Discover captivating romance stories from acclaimed author Jennifer Nensha', 'support@jennifernens.com', true)
ON CONFLICT (is_default) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 4. NOTIFICATION SETTINGS TABLE - Stores Notification Preferences
-- ============================================================================
DROP TABLE IF EXISTS notification_settings CASCADE;

CREATE TABLE notification_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notify_new_subscribers boolean DEFAULT true,
  notify_contact_form boolean DEFAULT true,
  notify_book_views boolean DEFAULT false,
  is_default boolean DEFAULT true UNIQUE,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "notif_select" ON notification_settings;
CREATE POLICY "notif_select" ON notification_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "notif_update" ON notification_settings;
CREATE POLICY "notif_update" ON notification_settings FOR UPDATE USING (true) WITH CHECK (true);

-- Insert default notification settings
INSERT INTO notification_settings (notify_new_subscribers, notify_contact_form, notify_book_views, is_default)
VALUES (true, true, false, true)
ON CONFLICT (is_default) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 5. CONTACT MESSAGES TABLE - Stores Contact Form Submissions
-- ============================================================================
DROP TABLE IF EXISTS contact_messages CASCADE;

CREATE TABLE contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "contact_insert" ON contact_messages;
CREATE POLICY "contact_insert" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select" ON contact_messages;
CREATE POLICY "contact_select" ON contact_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "contact_update" ON contact_messages;
CREATE POLICY "contact_update" ON contact_messages FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. SUBSCRIBERS TABLE - Stores Email Subscriber Information
-- ============================================================================
DROP TABLE IF EXISTS subscribers CASCADE;

CREATE TABLE subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  country text,
  subscribed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX subscribers_email_idx ON subscribers(email);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "sub_insert" ON subscribers;
CREATE POLICY "sub_insert" ON subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sub_select" ON subscribers;
CREATE POLICY "sub_select" ON subscribers FOR SELECT USING (true);

DROP POLICY IF EXISTS "sub_update" ON subscribers;
CREATE POLICY "sub_update" ON subscribers FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. ANALYTICS EVENTS TABLE - Tracks User Engagement
-- ============================================================================
DROP TABLE IF EXISTS analytics_events CASCADE;

CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_agent text,
  ip_address text,
  referrer text,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_created_idx ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies - Allow anyone to insert events (anonymous analytics)
DROP POLICY IF EXISTS "analytics_insert" ON analytics_events;
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_select" ON analytics_events;
CREATE POLICY "analytics_select" ON analytics_events FOR SELECT USING (true);

-- ============================================================================
-- 8. BOOKS TABLE - Stores Book Information
-- ============================================================================
DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  cover_url text,
  book_link text,
  book_platform text,
  total_reads integer DEFAULT 0,
  clicks integer DEFAULT 0,
  likes integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "books_select" ON books;
CREATE POLICY "books_select" ON books FOR SELECT USING (true);

DROP POLICY IF EXISTS "books_insert" ON books;
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "books_update" ON books;
CREATE POLICY "books_update" ON books FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "books_delete" ON books;
CREATE POLICY "books_delete" ON books FOR DELETE USING (true);

-- ============================================================================
-- 9. BOOK COMMENTS TABLE - Stores Book Comments/Reviews
-- ============================================================================
DROP TABLE IF EXISTS book_comments CASCADE;

CREATE TABLE book_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  author text NOT NULL,
  is_admin boolean DEFAULT false,
  content text NOT NULL,
  likes integer DEFAULT 0,
  parent_id uuid REFERENCES book_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX book_comments_book_id_idx ON book_comments(book_id);
CREATE INDEX book_comments_parent_id_idx ON book_comments(parent_id);

ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "comments_select" ON book_comments;
CREATE POLICY "comments_select" ON book_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert" ON book_comments;
CREATE POLICY "comments_insert" ON book_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "comments_update" ON book_comments;
CREATE POLICY "comments_update" ON book_comments FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- VERIFICATION - Check tables were created
-- ============================================================================
-- Run these queries to verify all tables exist:
/*
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;

-- Expected tables:
-- 1. site_settings
-- 2. author_settings  
-- 3. site_settings_extended
-- 4. notification_settings
-- 5. contact_messages
-- 6. subscribers
-- 7. analytics_events
-- 8. books
-- 9. book_comments
*/

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
-- All tables have been created with RLS policies and default data
-- Your database is ready for the NENSHA JENNIFER platform!
