/*
  # Create analyses tables

  1. New Tables
    - `analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_description` (text)
      - `ideal_user` (jsonb)
      - `outcomes` (jsonb)
      - `challenges` (jsonb)
      - `solutions` (jsonb)
      - `selected_model` (text)
      - `features` (jsonb)
      - `user_journey` (jsonb)
      - `analysis_results` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `analyses` table
    - Add policies for authenticated users to:
      - Read their own analyses
      - Create new analyses
      - Update their own analyses
      - Delete their own analyses
*/

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_description text NOT NULL,
  ideal_user jsonb,
  outcomes jsonb,
  challenges jsonb,
  solutions jsonb,
  selected_model text,
  features jsonb,
  user_journey jsonb,
  analysis_results jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own analyses"
  ON analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analyses"
  ON analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE
  ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();