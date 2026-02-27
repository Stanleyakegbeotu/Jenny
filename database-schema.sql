-- ============================================================================
-- Supabase Database Schema for Cinematic Landing Page
-- ============================================================================
-- Run these commands in your Supabase SQL Editor to create the database schema
-- https://supabase.com/dashboard/project/YOUR-PROJECT/sql/new

-- ============================================================================
-- 1. BOOKS TABLE
-- ============================================================================
CREATE TABLE books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  cover_url text,
  inkitt_url text,
  wattpad_url text,
  audio_url text,
  featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on featured and created_at for better query performance
CREATE INDEX books_featured_idx ON books(featured);
CREATE INDEX books_created_at_idx ON books(created_at DESC);

-- ============================================================================
-- 2. CHAPTERS TABLE
-- ============================================================================
CREATE TABLE chapters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  preview_text text,
  order integer NOT NULL,
  audio_url text,
  duration_seconds integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on book_id and order
CREATE INDEX chapters_book_id_idx ON chapters(book_id);
CREATE INDEX chapters_order_idx ON chapters(book_id, order);

-- ============================================================================
-- 3. SUBSCRIBERS TABLE
-- ============================================================================
CREATE TABLE subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  unsubscribed_at timestamp with time zone,
  preferences jsonb DEFAULT '{"language": "en", "frequency": "weekly"}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email and unsubscribed_at for efficient queries
CREATE INDEX subscribers_email_idx ON subscribers(email);
CREATE INDEX subscribers_unsubscribed_at_idx ON subscribers(unsubscribed_at);

-- ============================================================================
-- 4. CONTACT MESSAGES TABLE
-- ============================================================================
CREATE TABLE contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  read boolean DEFAULT false,
  replied_at timestamp with time zone,
  reply_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email and read status
CREATE INDEX contact_messages_email_idx ON contact_messages(email);
CREATE INDEX contact_messages_read_idx ON contact_messages(read);
CREATE INDEX contact_messages_sent_at_idx ON contact_messages(sent_at DESC);

-- ============================================================================
-- 5. ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id text,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for analytics queries
CREATE INDEX analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_book_id_idx ON analytics_events(book_id);
CREATE INDEX analytics_events_timestamp_idx ON analytics_events(timestamp DESC);
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);

-- ============================================================================
-- 6. STORAGE BUCKETS (via Supabase Dashboard)
-- ============================================================================
-- These buckets need to be created via the Supabase Dashboard:
-- 1. book-covers (public, for book cover images)
-- 2. chapter-previews (private, for chapter preview files)
-- 3. chapter-audio (private, for audio files)
--
-- You can also create them via SQL if needed using:
-- SELECT storage.create_bucket('book-covers', public := true);
-- SELECT storage.create_bucket('chapter-previews', public := false);
-- SELECT storage.create_bucket('chapter-audio', public := false);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Books table - Public read, authenticated write
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create books"
  ON books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  USING (true);

-- Chapters table - Public read, authenticated write
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on chapters"
  ON chapters FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create chapters"
  ON chapters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters"
  ON chapters FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete chapters"
  ON chapters FOR DELETE
  USING (true);

-- Subscribers table - Public create, private read
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on subscribers"
  ON subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read subscribers"
  ON subscribers FOR SELECT
  USING (true);

CREATE POLICY "Users can update their subscription"
  ON subscribers FOR UPDATE
  USING (true);

-- Contact messages table - Public create, authenticated read/update
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on contact_messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages FOR UPDATE
  USING (true);

-- Analytics events table - Public insert, authenticated read
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on analytics_events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read analytics"
  ON analytics_events FOR SELECT
  USING (true);

-- ============================================================================
-- 8. SAMPLE DATA (OPTIONAL - for testing)
-- ============================================================================
-- Uncomment the following to insert sample data:

/*
INSERT INTO books (title, description, cover_url, inkitt_url, wattpad_url, featured)
VALUES 
  ('The Silent Witness', 'A gripping thriller about secrets and betrayal', 'https://via.placeholder.com/300x400', 'https://inkitt.com', 'https://wattpad.com', true),
  ('Beneath the Stars', 'A romantic adventure across continents', 'https://via.placeholder.com/300x400', 'https://inkitt.com', 'https://wattpad.com', true),
  ('Shadow Protocol', 'An intense spy thriller with unexpected twists', 'https://via.placeholder.com/300x400', 'https://inkitt.com', 'https://wattpad.com', false);

INSERT INTO chapters (book_id, title, content, preview_text, order)
VALUES 
  ((SELECT id FROM books WHERE title = 'The Silent Witness'), 'Chapter 1: Discovery', 'Full chapter content here...', 'Preview of chapter 1...', 1),
  ((SELECT id FROM books WHERE title = 'The Silent Witness'), 'Chapter 2: Secrets Revealed', 'Full chapter content here...', 'Preview of chapter 2...', 2);
*/

-- ============================================================================
-- 9. FUNCTIONS (Optional - for advanced features)
-- ============================================================================

-- Function to increment book view count
CREATE OR REPLACE FUNCTION increment_book_views(book_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE books SET views_count = views_count + 1 WHERE id = book_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get book statistics
CREATE OR REPLACE FUNCTION get_book_statistics()
RETURNS TABLE (
  book_id uuid,
  title text,
  total_views integer,
  chapter_count integer,
  subscriber_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.views_count,
    COUNT(DISTINCT c.id)::integer,
    COUNT(DISTINCT s.id)::integer
  FROM books b
  LEFT JOIN chapters c ON b.id = c.book_id
  LEFT JOIN subscribers s ON true
  GROUP BY b.id, b.title, b.views_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
