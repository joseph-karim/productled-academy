-- Secure fix for anonymous scraping

-- Make sure RLS is enabled on the table
ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for anonymous users
DROP POLICY IF EXISTS "Anonymous users can read their records" ON website_scraping;
DROP POLICY IF EXISTS "Anonymous users can read null user_id records" ON website_scraping;

-- Create proper policy for anonymous access with increased debugging info
CREATE POLICY "Anonymous users can read null user_id records" 
  ON website_scraping
  FOR SELECT
  TO public
  USING (user_id IS NULL);

-- Policy for inserting records (already exists but added for completeness)
DROP POLICY IF EXISTS "Users can create website scraping records" ON website_scraping;
CREATE POLICY "Users can create website scraping records"
  ON website_scraping
  FOR INSERT
  TO public
  WITH CHECK (true);

-- This ensures authenticated users can still read their own records
DROP POLICY IF EXISTS "Users can read their own website scraping records" ON website_scraping;
CREATE POLICY "Users can read their own website scraping records"
  ON website_scraping
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id); 