/*
  # Fix sharing permissions

  1. Changes
    - Update RLS policies to handle both authenticated and anonymous users
    - Add policy for sharing anonymous analyses
    - Ensure proper ownership checks

  2. Security
    - Allow anonymous users to share their analyses
    - Maintain data integrity
    - Preserve existing authenticated user policies
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

-- Ensure RLS is enabled
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;