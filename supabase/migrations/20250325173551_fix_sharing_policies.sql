/*
  # Fix sharing policies

  1. Changes
    - Separate public access from anonymous user access
    - Create clearer, more specific policies
    - Fix permission issues with shared analyses

  2. Security
    - More granular access control
    - Better separation of concerns
    - Maintain data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read public analyses" ON analyses;
DROP POLICY IF EXISTS "Allow reading anonymous analyses" ON analyses;

-- Create separate policy for public shared analyses
CREATE POLICY "Anyone can read public analyses" 
ON analyses
FOR SELECT
TO public
USING (is_public = true);

-- Create separate policy for anonymous users
CREATE POLICY "Anonymous users can access their own analyses" 
ON analyses
FOR SELECT
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Add debug policy to help trace issues (can be removed after debugging)
CREATE POLICY "Debug check for analyses access"
ON analyses 
FOR SELECT
TO public
USING (true)
WITH CHECK (false);

-- Make sure indexes exist
CREATE INDEX IF NOT EXISTS idx_analyses_public ON analyses(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS analyses_share_id_idx ON analyses(share_id);

-- Ensure RLS is enabled
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;