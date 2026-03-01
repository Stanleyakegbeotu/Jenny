-- ============================================================================
-- Add DELETE policy for subscribers table
-- ============================================================================
-- This migration adds the missing DELETE policy so admins can delete subscribers

-- Add DELETE policy for authenticated users on subscribers table
CREATE POLICY "Authenticated users can delete subscribers"
  ON subscribers FOR DELETE
  USING (true);

-- Verify the policy was created
-- SELECT * FROM pg_policies WHERE tablename = 'subscribers';
