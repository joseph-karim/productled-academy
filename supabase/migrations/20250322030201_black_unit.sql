-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read public analyses" ON analyses;
  DROP POLICY IF EXISTS "Allow reading anonymous analyses" ON analyses;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create updated policies for shared and anonymous analyses
CREATE POLICY "Anyone can read public analyses" 
ON analyses
FOR SELECT
TO public
USING (
  is_public = true OR 
  user_id = '00000000-0000-0000-0000-000000000000'
);

-- Add index for faster lookups of public analyses
CREATE INDEX IF NOT EXISTS idx_analyses_public ON analyses(is_public) WHERE is_public = true;

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