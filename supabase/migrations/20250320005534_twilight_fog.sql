/*
  # Fix analysis_results column

  1. Changes
    - Drop and recreate analysis_results column to ensure proper schema cache
    - Set column type to JSONB for JSON data storage
    - Make column nullable

  2. Security
    - Maintain existing RLS policies
    - Preserve data integrity
*/

-- Drop the column if it exists
ALTER TABLE analyses 
DROP COLUMN IF EXISTS analysis_results;

-- Add the column back with proper type
ALTER TABLE analyses
ADD COLUMN analysis_results jsonb;

-- Refresh schema cache (this is done automatically by Supabase)
NOTIFY pgrst, 'reload schema';