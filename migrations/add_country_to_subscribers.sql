-- ============================================================================
-- Add country column to subscribers table
-- ============================================================================
-- This migration adds the country column that was defined in the interface
-- but missing from the actual database table

-- Add country column if it doesn't exist
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS country text;

-- Create index on country for efficient queries
CREATE INDEX IF NOT EXISTS subscribers_country_idx ON subscribers(country);
