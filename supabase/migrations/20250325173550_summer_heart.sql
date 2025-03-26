/*
  # Fix pricing strategy storage

  1. Changes
    - Add pricing_strategy column to analyses table
    - Ensure column is properly typed as JSONB
    - Update RLS policies to include new column

  2. Security
    - Maintain existing RLS policies
    - Preserve data integrity
*/

-- Add pricing_strategy column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'pricing_strategy'
  ) THEN
    ALTER TABLE analyses ADD COLUMN pricing_strategy jsonb;
  END IF;
END $$;

-- Ensure RLS policies cover the new column
DO $$ 
BEGIN
  -- Drop existing policies if they need to be updated
  DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
  
  -- Recreate the policy to explicitly include pricing_strategy
  CREATE POLICY "Users can update own analyses"
    ON analyses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_pricing_strategy 
ON analyses USING gin(pricing_strategy);