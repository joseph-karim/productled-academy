-- Enable Row Level Security on website_scraping
ALTER TABLE public.website_scraping ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to insert their own records
CREATE POLICY "Allow users to insert their own website_scraping records"
ON public.website_scraping
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000000' OR -- Anonymous user special ID
  user_id IS NULL -- Also allow NULL user_id for anonymous users
);

-- Create policy to allow users to select their own records
CREATE POLICY "Allow users to select their own website_scraping records"
ON public.website_scraping
FOR SELECT
TO public
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000000' OR -- Anonymous user special ID
  user_id IS NULL -- Also allow NULL user_id for anonymous users
);

-- Create policy to allow users to update their own records
CREATE POLICY "Allow users to update their own website_scraping records"
ON public.website_scraping
FOR UPDATE
TO public
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000000' OR -- Anonymous user special ID
  user_id IS NULL -- Also allow NULL user_id for anonymous users
);

-- Create policy for service role access (for edge functions)
CREATE POLICY "Service role can access all website_scraping records"
ON public.website_scraping
FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 