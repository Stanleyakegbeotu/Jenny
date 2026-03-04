-- ============================================================================
-- TEST WRITE PERMISSIONS - Run each query one at a time
-- This will tell us if RLS is blocking INSERT/UPDATE operations
-- ============================================================================

-- Query 1: Try to INSERT a test book
INSERT INTO books (title, description, cover_url) 
VALUES ('Test Book', 'Test Description', 'https://example.com/cover.jpg')
RETURNING id, title;

-- Did it work? If you get an error like "new row violates row-level security policy"
-- then RLS is blocking INSERT

-- Query 2: If Query 1 worked, try to UPDATE the existing author settings
UPDATE author_settings 
SET name = 'Test Update - ' || NOW()::text
WHERE id = (SELECT id FROM author_settings LIMIT 1)
RETURNING id, name;

-- Did it work? If you get an error like "policy ... violates"
-- then RLS is blocking UPDATE

-- Query 3: If Query 1 worked, try to INSERT a test chapter
INSERT INTO chapters (book_id, title, content, chapter_number)
VALUES (
  (SELECT id FROM books LIMIT 1),
  'Test Chapter',
  'Test content',
  1
)
RETURNING id, book_id, title;

-- Share the EXACT results or error messages for each query!
-- This will tell us if RLS policies are configured correctly
