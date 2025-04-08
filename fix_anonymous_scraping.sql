-- Fix Anonymous Scraping Feature

-- Drop the existing policy for anonymous users
DROP POLICY IF EXISTS "Anonymous users can read their records" ON website_scraping;

-- Create new policy checking only for NULL user_id
CREATE POLICY "Anonymous users can read their records"
  ON website_scraping
  FOR SELECT
  TO public
  USING (user_id IS NULL);

-- Additional policy for anonymous users to view their own created records
CREATE POLICY "Anonymous users can insert records" 
  ON website_scraping
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY; 