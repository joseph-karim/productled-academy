-- Drop the column if it exists
ALTER TABLE analyses 
DROP COLUMN IF EXISTS analysis_results;

-- Add the column back with proper type
ALTER TABLE analyses
ADD COLUMN analysis_results jsonb;

-- Refresh schema cache (this is done automatically by Supabase)
NOTIFY pgrst, 'reload schema';