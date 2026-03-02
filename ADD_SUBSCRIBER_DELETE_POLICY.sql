-- ============================================================================
-- ADD MISSING DELETE POLICY TO SUBSCRIBERS TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor to allow admin to delete subscribers
-- This was missing from the original setup
-- ============================================================================

-- Add DELETE policy to subscribers table (for admin to delete subscribers)
DROP POLICY IF EXISTS "sub_delete" ON subscribers;
CREATE POLICY "sub_delete" ON subscribers FOR DELETE USING (true);

-- Verify policy was created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'subscribers'
ORDER BY policyname;

-- Test: Try to delete and re-insert a test subscriber (should work now)
-- DELETE FROM subscribers WHERE email = 'test@example.com';
-- This policy allows deletion when the condition (true) is met for all rows.
