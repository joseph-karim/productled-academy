/*
  # Fix anonymous analyses support

  1. Changes
    - Drop foreign key constraint on user_id
    - Add new constraint that allows anonymous user ID
    - Update RLS policies for anonymous access

  2. Security
    - Maintain data integrity while allowing anonymous analyses
    - Preserve existing user relationships
    - Enable proper access control
*/

-- Drop existing foreign key constraint
ALTER TABLE analyses
DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- Add new constraint that allows anonymous user
ALTER TABLE analyses
ADD CONSTRAINT analyses_user_id_check
CHECK (
  user_id = '00000000-0000-0000-0000-000000000000' OR  -- Allow anonymous user
  EXISTS (                                              -- Or valid auth user
    SELECT 1 FROM auth.users WHERE id = user_id
  )
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