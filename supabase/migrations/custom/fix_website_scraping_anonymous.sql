/*
  # Fix Website Scraping for Anonymous Users
  
  1. Changes
    - Drop existing anonymous access policy
    - Create new policy that only checks for NULL user_id
    - Required for proper handling of anonymous website scraping
    
  2. Security
    - Still enforces separation between authenticated and anonymous users
    - Anonymous users can only access records with NULL user_id
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anonymous users can read their records" ON website_scraping;

-- Create new policy checking only for NULL user_id
CREATE POLICY "Anonymous users can read their records"
  ON website_scraping
  FOR SELECT
  TO public
  USING (user_id IS NULL); 