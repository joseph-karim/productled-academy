/*
  # Add pricing strategy column

  1. Changes
    - Add pricing_strategy column to analyses table
    - Column type is JSONB to store pricing strategy data
    - Make column nullable since it's optional initially

  2. Security
    - No additional security needed - uses existing RLS policies
    - Column is protected by existing table-level security
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

-- Update RLS policies to include new column
DO $$ 
BEGIN
  -- Policies are already in place and will automatically cover the new column
  -- No need to modify existing policies
  NULL;
END $$;