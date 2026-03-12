-- ============================================================================
-- Supabase Storage Policies (Public Buckets)
-- ============================================================================
-- Run this in Supabase SQL Editor after creating buckets.
-- Buckets: author-images, hero-images, book-covers, chapter-previews

-- Author images
DROP POLICY IF EXISTS "public_select_author_images" ON storage.objects;
DROP POLICY IF EXISTS "public_insert_author_images" ON storage.objects;
DROP POLICY IF EXISTS "public_update_author_images" ON storage.objects;
CREATE POLICY "public_select_author_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'author-images');
CREATE POLICY "public_insert_author_images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'author-images');
CREATE POLICY "public_update_author_images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'author-images') WITH CHECK (bucket_id = 'author-images');

-- Hero images
DROP POLICY IF EXISTS "public_select_hero_images" ON storage.objects;
DROP POLICY IF EXISTS "public_insert_hero_images" ON storage.objects;
DROP POLICY IF EXISTS "public_update_hero_images" ON storage.objects;
CREATE POLICY "public_select_hero_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY "public_insert_hero_images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hero-images');
CREATE POLICY "public_update_hero_images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'hero-images') WITH CHECK (bucket_id = 'hero-images');

-- Book covers
DROP POLICY IF EXISTS "public_select_book_covers" ON storage.objects;
DROP POLICY IF EXISTS "public_insert_book_covers" ON storage.objects;
DROP POLICY IF EXISTS "public_update_book_covers" ON storage.objects;
CREATE POLICY "public_select_book_covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "public_insert_book_covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-covers');
CREATE POLICY "public_update_book_covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'book-covers') WITH CHECK (bucket_id = 'book-covers');

-- Chapter previews
DROP POLICY IF EXISTS "public_select_chapter_previews" ON storage.objects;
DROP POLICY IF EXISTS "public_insert_chapter_previews" ON storage.objects;
DROP POLICY IF EXISTS "public_update_chapter_previews" ON storage.objects;
CREATE POLICY "public_select_chapter_previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'chapter-previews');
CREATE POLICY "public_insert_chapter_previews" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chapter-previews');
CREATE POLICY "public_update_chapter_previews" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chapter-previews') WITH CHECK (bucket_id = 'chapter-previews');
