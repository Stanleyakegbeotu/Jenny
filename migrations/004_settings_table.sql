-- ============================================================================
-- Settings Table for Storing Configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  description text,
  setting_type text DEFAULT 'text', -- 'text', 'url', 'number', 'boolean'
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX site_settings_key_idx ON site_settings(setting_key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and update settings
CREATE POLICY "Authenticated users can read settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON site_settings FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON site_settings FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Insert Default Settings
-- ============================================================================

INSERT INTO site_settings (setting_key, setting_value, description, setting_type)
VALUES
  ('formspree_contact_form_url', '', 'Formspree endpoint for contact form (https://formspree.io/f/xxxxxxx)', 'url'),
  ('admin_notification_email', '', 'Email address to receive admin notifications', 'text'),
  ('site_name', 'NENSHA JENNIFER', 'Site name for emails and headers', 'text'),
  ('site_email', 'info@nenshasworld.com', 'Sender email address', 'text')
ON CONFLICT (setting_key) DO NOTHING;
