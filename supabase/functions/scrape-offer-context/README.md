# Website Scraping Edge Function

This Supabase Edge Function provides website scraping functionality for the ProductLed Academy Offer Module. It allows users to analyze websites to extract key information about product offers.

## Features

- Scrapes websites using crawl4ai service
- Extracts key information using OpenAI's GPT-4o model
- Stores results in Supabase database
- Supports both authenticated and anonymous users
- Includes retry mechanism for reliability

## Environment Variables

The function requires the following environment variables:

```
SUPABASE_URL - Supabase project URL
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
OPENAI_API_KEY - OpenAI API key
CRAWL4AI_SERVICE_URL - URL of the crawl4ai service (default: http://localhost:8000)
CRAWL4AI_AUTH_TOKEN - Authentication token for crawl4ai service
```

## API

### POST /scrape-offer-context

Scrapes a website and analyzes its content.

**Request Body:**

```json
{
  "url": "https://example.com",
  "offerId": "optional-offer-id",
  "userId": "optional-user-id"
}
```

**Response:**

```json
{
  "message": "Website scraping started",
  "scrapingId": "uuid",
  "status": "processing"
}
```

## Implementation Details

1. The function creates a record in the `website_scraping` table
2. It uses crawl4ai to scrape the website content
3. The HTML is parsed to extract text content
4. OpenAI analyzes the content to extract key information
5. Results are stored in the database

## Error Handling

The function includes comprehensive error handling for:
- Missing URL
- Missing environment variables
- Scraping failures
- HTML parsing errors
- OpenAI API errors

Results are stored with appropriate status and error messages.
