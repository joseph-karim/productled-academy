/*
  # Fix sharing policies for analyses

  1. Changes
    - Update sharing policies to handle both authenticated and anonymous users
    - Ensure proper access control for sharing operations
    - Add indexes for performance optimization

  2. Security
    - Allow sharing for both authenticated users and anonymous analyses
    - Maintain data integrity
    - Optimize query performance
*/

-- Drop existing sharing-related policies
DROP POLICY IF EXISTS "Users can toggle sharing for own analyses" ON analyses;
DROP POLICY IF EXISTS "Anyone can read public analyses" ON analyses;

-- Create updated policies for sharing
CREATE POLICY "Users can toggle sharing for own analyses"
ON analyses
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (user_id = '00000000-0000-0000-0000-000000000000')
)
WITH CHECK (
  ((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000')) AND
  (
    CASE WHEN is_public IS DISTINCT FROM analyses.is_public THEN true
    ELSE false END
  )
);

-- Allow reading public and anonymous analyses
CREATE POLICY "Anyone can read public analyses" 
ON analyses
FOR SELECT
TO public
USING (
  is_public = true OR 
  user_id = '00000000-0000-0000-0000-000000000000'
);

-- Add index for faster lookups of public analyses if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'analyses' AND indexname = 'idx_analyses_public'
  ) THEN
    CREATE INDEX idx_analyses_public ON analyses(is_public) WHERE is_public = true;
  END IF;
END $$;

-- Add index for share_id lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'analyses' AND indexname = 'analyses_share_id_idx'
  ) THEN
    CREATE INDEX analyses_share_id_idx ON analyses(share_id);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;