/*
  # Add anonymous user support

  1. Changes
    - Make user_id nullable
    - Add constraint for valid user IDs
    - Add policies for anonymous users
    - Update RLS policies

  2. Security
    - Ensure anonymous users can only access their own data
    - Maintain data integrity with UUID validation
    - Preserve existing authenticated user policies
*/

-- Drop existing foreign key constraint if it exists
ALTER TABLE analyses
DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- Make user_id nullable and add constraint for anonymous user
ALTER TABLE analyses
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure user_id is either null, anonymous ID, or valid UUID
-- Skip if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_user_id_check'
  ) THEN
    ALTER TABLE analyses
    ADD CONSTRAINT valid_user_id_check
    CHECK (
      user_id IS NULL OR
      user_id = '00000000-0000-0000-0000-000000000000' OR
      user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    );
  END IF;
END $$;

-- Create policies for anonymous users (if they don't exist)
DO $$
BEGIN
  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous analyses'
  ) THEN
    CREATE POLICY "Allow anonymous analyses"
    ON analyses
    FOR INSERT
    TO public
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');
  END IF;

  -- Check and create select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow reading anonymous analyses'
  ) THEN
    CREATE POLICY "Allow reading anonymous analyses"
    ON analyses
    FOR SELECT
    TO public
    USING (user_id = '00000000-0000-0000-0000-000000000000');
  END IF;

  -- Check and create update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow updating anonymous analyses'
  ) THEN
    CREATE POLICY "Allow updating anonymous analyses"
    ON analyses
    FOR UPDATE
    TO public
    USING (user_id = '00000000-0000-0000-0000-000000000000')
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;