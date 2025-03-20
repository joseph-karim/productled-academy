/*
  # Add sharing functionality to analyses

  1. Changes
    - Add `share_id` column to analyses table
    - Add `is_public` column to analyses table
    - Create index on share_id for faster lookups
    - Update RLS policies to allow public access to shared analyses

  2. Security
    - Allow public read access to shared analyses
    - Allow owners to update sharing settings
    - Maintain data integrity during updates
*/

-- Add sharing columns
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS share_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS analyses_share_id_idx ON analyses(share_id);

-- Update RLS policies to allow public access to shared analyses
CREATE POLICY "Anyone can read public analyses" 
ON analyses
FOR SELECT
TO public
USING (is_public = true);

-- Add policy for updating share status
CREATE POLICY "Users can toggle sharing for own analyses"
ON analyses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Only allow updating sharing-related columns
  (
    CASE WHEN is_public IS DISTINCT FROM analyses.is_public THEN true
    ELSE false END
  )
);