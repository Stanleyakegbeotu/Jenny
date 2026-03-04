-- ============================================================================
-- HERO SETTINGS TABLE SETUP
-- ============================================================================
-- This creates the hero_settings table to store hero section configuration
-- including the hero image for the landing page

-- Create hero_settings table
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add comment to table
COMMENT ON TABLE hero_settings IS 'Stores hero section configuration including hero image for the landing page';

-- Enable RLS
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hero_settings
-- SELECT: Allow all users to read hero settings
CREATE POLICY "hero_settings_select" ON hero_settings
  FOR SELECT
  USING (true);

-- INSERT: Allow all users to insert hero settings
CREATE POLICY "hero_settings_insert" ON hero_settings
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow all users to update hero settings
CREATE POLICY "hero_settings_update" ON hero_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow all users to delete hero settings
CREATE POLICY "hero_settings_delete" ON hero_settings
  FOR DELETE
  USING (true);

-- Recreate RLS policies if they already exist
DROP POLICY IF EXISTS "hero_settings_select" ON hero_settings;
DROP POLICY IF EXISTS "hero_settings_insert" ON hero_settings;
DROP POLICY IF EXISTS "hero_settings_update" ON hero_settings;
DROP POLICY IF EXISTS "hero_settings_delete" ON hero_settings;

CREATE POLICY "hero_settings_select" ON hero_settings
  FOR SELECT
  USING (true);

CREATE POLICY "hero_settings_insert" ON hero_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "hero_settings_update" ON hero_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "hero_settings_delete" ON hero_settings
  FOR DELETE
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hero_settings_is_default ON hero_settings(is_default);
CREATE INDEX IF NOT EXISTS idx_hero_settings_updated_at ON hero_settings(updated_at);

-- Grant permissions
GRANT ALL ON hero_settings TO anon, authenticated;
