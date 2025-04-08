-- More permissive policy for debugging

-- Drop existing policies
DROP POLICY IF EXISTS "Anonymous users can read their records" ON website_scraping;
DROP POLICY IF EXISTS "Users can read their own website scraping records" ON website_scraping;

-- Create a temporary fully permissive policy for debugging
CREATE POLICY "Temporary allow all reads" 
  ON website_scraping
  FOR SELECT
  TO public
  USING (true);

-- Verify RLS is still enabled
ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY; 