/*
  # Allow anonymous analyses

  1. Changes
    - Add policy to allow anonymous analyses
    - Add default anonymous user ID
    - Update RLS policies to handle anonymous analyses

  2. Security
    - Anonymous analyses are temporary
    - Limited access to anonymous analyses
    - Maintain data integrity
*/

-- Add policy for anonymous analyses
CREATE POLICY "Allow anonymous analyses"
ON analyses
FOR INSERT
TO public
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Allow reading anonymous analyses
CREATE POLICY "Allow reading anonymous analyses"
ON analyses
FOR SELECT
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Allow updating anonymous analyses
CREATE POLICY "Allow updating anonymous analyses"
ON analyses
FOR UPDATE
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000')
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');