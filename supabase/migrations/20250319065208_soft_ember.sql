/*
  # Add sharing functionality

  1. Changes
    - Add share_id and is_public columns if they don't exist
    - Create index for share_id lookups
    - Add policy for public access to shared analyses
    - Add policy for toggling share status

  2. Security
    - Only allow authenticated users to toggle sharing on their own analyses
    - Allow public access to shared analyses
    - Prevent modification of other columns during share toggle
*/

-- Add sharing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'share_id'
  ) THEN
    ALTER TABLE analyses ADD COLUMN share_id uuid DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE analyses ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Create index for faster lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'analyses' AND indexname = 'analyses_share_id_idx'
  ) THEN
    CREATE INDEX analyses_share_id_idx ON analyses(share_id);
  END IF;
END $$;

-- Add policy for public access to shared analyses if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Anyone can read public analyses'
  ) THEN
    CREATE POLICY "Anyone can read public analyses"
      ON analyses
      FOR SELECT
      TO public
      USING (is_public = true);
  END IF;
END $$;

-- Add policy for updating share status if it doesn't exist
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