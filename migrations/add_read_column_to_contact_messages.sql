-- Add missing 'read' column to contact_messages table
-- This migration adds the read status column if it doesn't exist

-- Add column if it doesn't exist
ALTER TABLE contact_messages
ADD COLUMN read boolean DEFAULT false;

-- Create index on read column for efficient queries if it doesn't exist
CREATE INDEX IF NOT EXISTS contact_messages_read_idx ON contact_messages(read);
