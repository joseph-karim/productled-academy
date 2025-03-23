-- Add title column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'title'
  ) THEN
    ALTER TABLE analyses ADD COLUMN title text DEFAULT 'Untitled Analysis';
  END IF;
END $$;

-- Update existing analyses without titles
UPDATE analyses 
SET title = 'Untitled Analysis'
WHERE title IS NULL;