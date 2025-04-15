-- Enable Row Level Security on the website_scraping table
ALTER TABLE website_scraping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to website_scraping" ON website_scraping;
DROP POLICY IF EXISTS "Allow authenticated read access to website_scraping" ON website_scraping;

-- Create a policy that allows anyone to read from the website_scraping table
CREATE POLICY "Allow anonymous read access to website_scraping" 
ON website_scraping
FOR SELECT
USING (true);

-- Create a policy that allows authenticated users to read from the website_scraping table
CREATE POLICY "Allow authenticated read access to website_scraping" 
ON website_scraping
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create a policy that allows the service role to do anything
CREATE POLICY "Allow service role full access to website_scraping" 
ON website_scraping
USING (auth.role() = 'service_role');
