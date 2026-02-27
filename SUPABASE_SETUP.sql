-- ============================================================================
-- NENSHA JENNIFER - Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor
-- ============================================================================

-- 1. BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  author TEXT DEFAULT 'NENSHA JENNIFER',
  genre TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  total_reads INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  platform_links JSONB DEFAULT '{}',
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  duration INT, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  country TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}'
);

-- 4. BOOK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS book_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  likes INT DEFAULT 0,
  parent_comment_id UUID REFERENCES book_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BOOK INTERACTIONS TABLE (likes, reads, clicks)
CREATE TABLE IF NOT EXISTS book_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- can be anonymous identifier or user UUID
  interaction_type TEXT NOT NULL, -- 'read', 'click', 'like', 'comment'
  liked_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'book_view', 'book_read', 'subscriber_signup', 'comment_posted', 'like_added'
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  user_identifier TEXT, -- anonymous ID or subscriber email
  country TEXT,
  device_info JSONB, -- {browser, device_type, os}
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- unread, read, replied
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_book_comments_book_id ON book_comments(book_id);
CREATE INDEX idx_book_comments_parent_id ON book_comments(parent_comment_id);
CREATE INDEX idx_book_interactions_book_id ON book_interactions(book_id);
CREATE INDEX idx_book_interactions_user_id ON book_interactions(user_id);
CREATE INDEX idx_analytics_book_id ON analytics_events(book_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- ============================================================================
-- REAL-TIME CONFIGURATION
-- ============================================================================

-- Enable real-time on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE book_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE book_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE books;

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read policy for books
CREATE POLICY "Allow public read books" ON books FOR SELECT USING (status = 'published');

-- Public read policy for chapters
CREATE POLICY "Allow public read chapters" ON chapters FOR SELECT USING (true);

-- Public read policy for comments
CREATE POLICY "Allow public read comments" ON book_comments FOR SELECT USING (true);

-- Allow inserting comments (no auth required)
CREATE POLICY "Allow public insert comments" ON book_comments FOR INSERT WITH CHECK (true);

-- Allow reading interactions
CREATE POLICY "Allow public read interactions" ON book_interactions FOR SELECT USING (true);

-- Allow inserting interactions
CREATE POLICY "Allow public insert interactions" ON book_interactions FOR INSERT WITH CHECK (true);

-- Allow updating own interactions
CREATE POLICY "Allow update own interactions" ON book_interactions FOR UPDATE USING (true);

-- Allow inserting subscribers
CREATE POLICY "Allow public insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);

-- Allow reading site settings
CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT USING (true);

-- Allow inserting contact messages
CREATE POLICY "Allow public insert contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- Allow inserting analytics events
CREATE POLICY "Allow public insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SEED DATA (OPTIONAL)
-- ============================================================================

-- Insert sample book if needed
-- INSERT INTO books (title, description, cover_url, genre, status)
-- VALUES (
--   'Sample Romance Novel',
--   'A captivating tale of passion and love',
--   'https://images.unsplash.com/...',
--   'Romance',
--   'published'
-- );
