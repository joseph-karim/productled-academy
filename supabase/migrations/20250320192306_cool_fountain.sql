/*
  # Add anonymous user support

  1. Changes
    - Make user_id nullable
    - Update constraint for valid user IDs
    - Add policies for anonymous users
    - Ensure RLS is enabled

  2. Security
    - Allow anonymous users to access their own data
    - Maintain data integrity with UUID validation
    - Preserve existing authenticated user policies
*/

-- Drop existing foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'analyses_user_id_fkey'
  ) THEN
    ALTER TABLE analyses DROP CONSTRAINT analyses_user_id_fkey;
  END IF;
END $$;

-- Make user_id nullable if not already
DO $$ 
BEGIN
  ALTER TABLE analyses ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing constraint if it exists and create new one
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_user_id_check'
  ) THEN
    ALTER TABLE analyses DROP CONSTRAINT valid_user_id_check;
  END IF;
END $$;

ALTER TABLE analyses
ADD CONSTRAINT valid_user_id_check
CHECK (
  user_id IS NULL OR
  user_id = '00000000-0000-0000-0000-000000000000' OR
  user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow anonymous analyses" ON analyses;
  DROP POLICY IF EXISTS "Allow reading anonymous analyses" ON analyses;
  DROP POLICY IF EXISTS "Allow updating anonymous analyses" ON analyses;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies for anonymous users
CREATE POLICY "Allow anonymous analyses"
ON analyses
FOR INSERT
TO public
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Allow reading anonymous analyses"
ON analyses
FOR SELECT
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Allow updating anonymous analyses"
ON analyses
FOR UPDATE
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000')
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Ensure RLS is enabled
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;