# Web Scraper Functionality

## Overview

The web scraper is a key component of the ProductLed Academy platform that analyzes website content to extract marketing insights. It helps users understand their offer by analyzing their website and providing AI-assisted suggestions.

## Architecture

The web scraper consists of three main components:

1. **Client-side code**: Handles user input, displays results, and manages the chat interface
2. **Edge Functions**: Process the website content and generate insights using AI
3. **Database**: Stores scraping results and makes them available to authenticated and unauthenticated users

## Edge Functions

### 1. scrape-offer-context

This Edge Function is responsible for:
- Fetching the HTML content from the provided URL
- Parsing the HTML to extract relevant content
- Analyzing the content using OpenAI's GPT-4.1-nano model
- Storing the results in the Supabase database

**Performance Optimizations:**
- Extracts only the most important content from the webpage (headings, meta tags, and first 3000 chars)
- Limits the total content to 4000 characters for faster processing
- Uses the gpt-4.1-nano-2025-04-14 model for a balance of speed and quality
- Sets temperature to 0.2 for more deterministic results
- Limits max_tokens to 300 for faster responses

### 2. get-scraping-result

This Edge Function retrieves the scraping results from the database:
- Takes a scraping ID as input
- Queries the database for the corresponding record
- Returns the scraping status and results

### 3. openai-proxy

This Edge Function acts as a proxy for OpenAI API calls:
- Securely handles the OpenAI API key on the server side
- Forwards requests to the OpenAI API
- Returns the responses to the client

## Database Schema

The web scraper uses a `website_scraping` table with the following structure:

- `id`: UUID (primary key)
- `status`: String ('idle', 'processing', 'completed', 'failed')
- `url`: String (the URL being analyzed)
- `title`: String (the website title)
- `meta_description`: String (the website meta description)
- `analysis_result`: JSON (contains the AI analysis)
- `error`: String (error message if scraping failed)
- `created_at`: Timestamp
- `completed_at`: Timestamp
- `user_id`: UUID (foreign key to auth.users, can be null for unauthenticated users)

## Row Level Security (RLS)

The `website_scraping` table has RLS policies that allow:
- Unauthenticated users to read and create records
- Authenticated users to read their own records
- Service role to have full access to all records

## Usage Flow

1. User enters a website URL in the AnalyzeHomepageStep component
2. The client calls the scrape-offer-context Edge Function
3. The Edge Function returns a scraping ID and sets status to 'processing'
4. The client polls the get-scraping-result Edge Function until the status is 'completed' or 'failed'
5. When completed, the client displays the results and launches the inline chat
6. The inline chat uses the scraping results to provide personalized suggestions

## Troubleshooting

If the web scraper is not working as expected:

1. Check the browser console for error messages
2. Verify that the Edge Functions are deployed correctly
3. Ensure the RLS policies are properly configured
4. Check that the OpenAI API key is set correctly in the Supabase secrets

## Maintenance

To maintain optimal performance:

1. Keep the Edge Functions updated with the latest OpenAI models
2. Monitor the database size and clean up old scraping records if necessary
3. Regularly test the scraper with different types of websites
4. Update the content extraction logic if needed to handle new website structures
