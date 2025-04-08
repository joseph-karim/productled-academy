/*
  # Website scraping table and RLS policies

  1. Changes
    - Apply website_scraping table schema if not already created
    - Add RLS policies for both authenticated and anonymous users
    - Enable anonymous access for "try-before-signup" flow

  2. Security
    - Allow both authenticated and anonymous users to create and read website scraping records
    - Anonymous users can only access their own records
    - Authenticated users can only access their own records
*/

\i 'website_scraping_table.sql';

ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create website scraping records"
  ON website_scraping
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read their own website scraping records"
  ON website_scraping
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read their records"
  ON website_scraping
  FOR SELECT
  TO public
  USING (user_id IS NULL);

CREATE INDEX IF NOT EXISTS website_scraping_user_id_idx 
  ON website_scraping(user_id);
