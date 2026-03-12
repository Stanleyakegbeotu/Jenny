-- ============================================================================
-- Migration: Add book_interactions table (likes/reads/clicks)
-- Safe to run multiple times.
-- ============================================================================

CREATE TABLE IF NOT EXISTS book_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  user_id text DEFAULT 'anonymous',
  interaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS book_interactions_book_id_idx ON book_interactions(book_id);
CREATE INDEX IF NOT EXISTS book_interactions_type_idx ON book_interactions(interaction_type);

ALTER TABLE book_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interactions_select" ON book_interactions;
CREATE POLICY "interactions_select" ON book_interactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "interactions_insert" ON book_interactions;
CREATE POLICY "interactions_insert" ON book_interactions
  FOR INSERT WITH CHECK (true);
