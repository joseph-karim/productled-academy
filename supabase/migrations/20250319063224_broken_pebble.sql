/*
  # Add sharing functionality to analyses

  1. Changes
    - Add share_id column (uuid) with default random UUID
    - Add is_public column (boolean) defaulting to false
    - Create index on share_id for faster lookups
    - Add RLS policy for owners to toggle sharing

  2. Security
    - Only owners can toggle sharing status
    - Sharing operations preserve data integrity
*/

-- Add sharing columns
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS share_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS analyses_share_id_idx ON analyses(share_id);

-- Add policy for updating share status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Users can toggle sharing for own analyses'
  ) THEN
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
  END IF;
END $$;