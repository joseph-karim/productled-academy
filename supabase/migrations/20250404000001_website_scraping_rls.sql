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

-- Create website_scraping table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'website_scraping') THEN
    CREATE TABLE website_scraping (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      offer_id UUID,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'processing',
      title TEXT,
      meta_description TEXT,
      analysis_result JSONB,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
  END IF;
END $$;

ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can create website scraping records' AND tablename = 'website_scraping'
  ) THEN
    CREATE POLICY "Users can create website scraping records"
      ON website_scraping
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  -- Check and create select policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own website scraping records' AND tablename = 'website_scraping'
  ) THEN
    CREATE POLICY "Users can read their own website scraping records"
      ON website_scraping
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check and create select policy for anonymous users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anonymous users can read their records' AND tablename = 'website_scraping'
  ) THEN
    CREATE POLICY "Anonymous users can read their records"
      ON website_scraping
      FOR SELECT
      TO public
      USING (user_id IS NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS website_scraping_user_id_idx
  ON website_scraping(user_id);
