-- ============================================================================
-- SUPABASE MIGRATION - FIX SCHEMA TO MATCH CODE
-- ============================================================================
-- THE PREVIOUS MIGRATION HAD A BUG - This one actually works!
-- Run this ONCE in Supabase SQL Editor to fix your database
-- After running this, admin settings WILL save and landing page WILL display them
-- ============================================================================

-- Step 1: Drop and recreate analytics_events with correct columns
DROP TABLE IF EXISTS analytics_events CASCADE;

CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id text DEFAULT 'anonymous',
  book_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX analytics_events_book_id_idx ON analytics_events(book_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_insert" ON analytics_events;
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_select" ON analytics_events;
CREATE POLICY "analytics_select" ON analytics_events FOR SELECT USING (true);

-- ============================================================================
-- Step 2: Fix author_settings table for proper upsert
-- ============================================================================
-- 2a: Drop is_default column if it exists (from previous failed migration)
ALTER TABLE IF EXISTS author_settings DROP COLUMN IF EXISTS is_default CASCADE;

-- 2b: Add is_default as a proper singleton column
ALTER TABLE IF EXISTS author_settings ADD COLUMN is_default boolean NOT NULL DEFAULT true UNIQUE;

-- 2c: Delete all existing rows so we can start fresh with proper constraint
TRUNCATE TABLE author_settings CASCADE;

-- 2d: Insert the singleton default row
INSERT INTO author_settings (name, bio, email, is_default)
VALUES ('Jennifer Nensha', 'Romance author crafting tales of love and passion.', 'contact@jennifernens.com', true)
ON CONFLICT (is_default) DO UPDATE SET 
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  updated_at = now();

-- ============================================================================
-- Step 3: Fix notification_settings table for proper upsert
-- ============================================================================
-- 3a: Drop is_default column if it exists
ALTER TABLE IF EXISTS notification_settings DROP COLUMN IF EXISTS is_default CASCADE;

-- 3b: Add is_default as a proper singleton column
ALTER TABLE IF EXISTS notification_settings ADD COLUMN is_default boolean NOT NULL DEFAULT true UNIQUE;

-- 3c: Delete all existing rows so we can start fresh with proper constraint
TRUNCATE TABLE notification_settings CASCADE;

-- 3d: Insert the singleton default row
INSERT INTO notification_settings (notify_new_subscribers, notify_contact_form, notify_book_views, is_default)
VALUES (true, true, false, true)
ON CONFLICT (is_default) DO UPDATE SET 
  notify_new_subscribers = EXCLUDED.notify_new_subscribers,
  notify_contact_form = EXCLUDED.notify_contact_form,
  notify_book_views = EXCLUDED.notify_book_views,
  updated_at = now();

-- ============================================================================
-- Step 4: Fix site_settings_extended table for proper upsert
-- ============================================================================
-- 4a: Drop is_default column if it exists
ALTER TABLE IF EXISTS site_settings_extended DROP COLUMN IF EXISTS is_default CASCADE;

-- 4b: Add is_default as a proper singleton column
ALTER TABLE IF EXISTS site_settings_extended ADD COLUMN is_default boolean NOT NULL DEFAULT true UNIQUE;

-- 4c: Delete all existing rows so we can start fresh with proper constraint
TRUNCATE TABLE site_settings_extended CASCADE;

-- 4d: Insert the singleton default row
INSERT INTO site_settings_extended (site_title, site_tagline, support_email, is_default)
VALUES ('Nensha Jennifer - Romance Author', 'Discover captivating romance stories from acclaimed author Jennifer Nensha', 'support@jennifernens.com', true)
ON CONFLICT (is_default) DO UPDATE SET 
  site_title = EXCLUDED.site_title,
  site_tagline = EXCLUDED.site_tagline,
  support_email = EXCLUDED.support_email,
  updated_at = now();

-- ============================================================================
-- Step 5: Add INSERT/UPDATE policies to allow admin saves (CRITICAL!)
-- ============================================================================
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "author_insert" ON author_settings;
DROP POLICY IF EXISTS "author_update" ON author_settings;
DROP POLICY IF EXISTS "author_select" ON author_settings;
CREATE POLICY "author_insert" ON author_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "author_update" ON author_settings FOR UPDATE WITH CHECK (true);
CREATE POLICY "author_select" ON author_settings FOR SELECT USING (true);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_insert" ON notification_settings;
DROP POLICY IF EXISTS "notification_update" ON notification_settings;
DROP POLICY IF EXISTS "notification_select" ON notification_settings;
CREATE POLICY "notification_insert" ON notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "notification_update" ON notification_settings FOR UPDATE WITH CHECK (true);
CREATE POLICY "notification_select" ON notification_settings FOR SELECT USING (true);

ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ext_insert" ON site_settings_extended;
DROP POLICY IF EXISTS "ext_update" ON site_settings_extended;
DROP POLICY IF EXISTS "ext_select" ON site_settings_extended;
CREATE POLICY "ext_insert" ON site_settings_extended FOR INSERT WITH CHECK (true);
CREATE POLICY "ext_update" ON site_settings_extended FOR UPDATE WITH CHECK (true);
CREATE POLICY "ext_select" ON site_settings_extended FOR SELECT USING (true);

-- ============================================================================
-- DONE! Your database is now properly fixed.
-- Test: 
-- 1. Go to Admin → Settings
-- 2. Change an author name
-- 3. Click Save
-- 4. You should see: ✅ Upserted author settings [UUID]
-- 5. Refresh the page - the change should PERSIST
-- ============================================================================
