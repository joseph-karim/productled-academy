/*
  # Fix anonymous analyses support

  1. Changes
    - Drop foreign key constraint on user_id
    - Make user_id nullable to support anonymous users
    - Update RLS policies for anonymous access

  2. Security
    - Allow anonymous analyses with special UUID
    - Maintain data integrity
    - Enable proper access control for both anonymous and authenticated users
*/

-- Drop existing foreign key constraint
ALTER TABLE analyses
DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- Make user_id nullable and add constraint for anonymous user
ALTER TABLE analyses
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure user_id is either null, anonymous ID, or valid UUID
ALTER TABLE analyses
ADD CONSTRAINT valid_user_id_check
CHECK (
  user_id IS NULL OR
  user_id = '00000000-0000-0000-0000-000000000000' OR
  user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Recreate RLS policies
DROP POLICY IF EXISTS "Allow anonymous analyses" ON analyses;
DROP POLICY IF EXISTS "Allow reading anonymous analyses" ON analyses;
DROP POLICY IF EXISTS "Allow updating anonymous analyses" ON analyses;

-- Create updated policies
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