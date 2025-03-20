/*
  # Add analysis_results column

  1. Changes
    - Add analysis_results column to analyses table
    - Make it JSONB type to store analysis results
    - Make it nullable since it's populated after initial creation

  2. Security
    - No additional security needed - uses existing RLS policies
*/

-- Add analysis_results column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'analysis_results'
  ) THEN
    ALTER TABLE analyses ADD COLUMN analysis_results jsonb;
  END IF;
END $$;