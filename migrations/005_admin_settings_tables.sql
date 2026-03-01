-- ============================================================================
-- Admin Settings Tables for Persistent Configuration
-- ============================================================================

-- Author Settings Table
CREATE TABLE IF NOT EXISTS author_settings (
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
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings Table (already exists, adding new fields if needed)
CREATE TABLE IF NOT EXISTS site_settings_extended (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title text DEFAULT 'Nensha Jennifer - Romance Author',
  site_tagline text DEFAULT '',
  support_email text DEFAULT '',
  hero_image text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notify_new_subscribers boolean DEFAULT true,
  notify_contact_form boolean DEFAULT true,
  notify_book_views boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read author settings"
  ON author_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update author settings"
  ON author_settings FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read site settings"
  ON site_settings_extended FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings_extended FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can read notification settings"
  ON notification_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update notification settings"
  ON notification_settings FOR UPDATE
  USING (true);

-- Insert default rows
INSERT INTO author_settings (name, bio, email) 
VALUES ('Jennifer Nensha', 'Romance author crafting tales of love and passion.', 'contact@jennifernens.com')
ON CONFLICT DO NOTHING;

INSERT INTO site_settings_extended (site_title, site_tagline, support_email)
VALUES ('Nensha Jennifer - Romance Author', 'Discover captivating romance stories from acclaimed author Jennifer Nensha', 'support@jennifernens.com')
ON CONFLICT DO NOTHING;

INSERT INTO notification_settings (notify_new_subscribers, notify_contact_form, notify_book_views)
VALUES (true, true, false)
ON CONFLICT DO NOTHING;
