import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { OpenAI } from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  // Check if this is a request to get a scraping result
  const requestUrl = new URL(req.url);
  console.log('Request URL:', requestUrl.pathname);
  if (requestUrl.pathname.includes('/result')) {
    try {
      const { scrapingId } = await req.json();

      if (!scrapingId) {
        return new Response(
          JSON.stringify({ error: 'Scraping ID is required' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
        );
      }

      const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

      console.log(`Using Supabase URL: ${supabaseUrl}`);
      console.log(`Service role key available: ${!!supabaseKey}`);

      if (!supabaseUrl || !supabaseKey) {
        return new Response(
          JSON.stringify({ error: 'Missing Supabase environment variables' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Query the database for the scraping result
      const { data, error } = await supabase
        .from('website_scraping')
        .select('*')
        .eq('id', scrapingId)
        .single();

      if (error) {
        console.error('Error fetching scraping result:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Scraping result not found' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
        );
      }

      // Return the scraping result
      return new Response(
        JSON.stringify(data),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    } catch (error) {
      console.error('Error retrieving scraping result:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
  }

  // If we get here, this is a request to start a new scraping job
  try {
    const { url, offerId, userId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    const effectiveUserId = userId || null;

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    console.log(`Using Supabase URL: ${supabaseUrl}`);
    console.log(`Service role key available: ${!!supabaseKey}`);

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: scrapingRecord, error: insertError } = await supabase
      .from('website_scraping')
      .insert({
        offer_id: offerId,
        user_id: effectiveUserId,
        url: url,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create scraping record', details: insertError }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    async function scrapeWebsiteWithCrawl4ai(url: string, maxRetries = 2) {
      let lastError;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt + 1} to scrape ${url} with crawl4ai`);

          const crawlServiceUrl = Deno.env.get('CRAWL4AI_SERVICE_URL') || 'http://localhost:8000';
          const authToken = Deno.env.get('CRAWL4AI_AUTH_TOKEN') || '2080526ca47212486f0f655572b6c6c2af4257af71a93c78dfe77258e07e287a';

          const response = await fetch(`${crawlServiceUrl}/api/v1/scrape`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              url: url,
              javascript_enabled: true,
              wait_for_selector: 'body',
              timeout: 30000,
              max_retries: 2
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (!result.html) {
            throw new Error('No HTML content returned from crawl4ai');
          }

          return result.html;
        } catch (error) {
          console.error(`Attempt ${attempt + 1} failed:`, error);
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      throw lastError;
    }

    async function fetchWithRetry(url: string, maxRetries = 3) {
      // Try to use crawl4ai first, then fall back to direct fetch if that fails
      let lastError;

      // First try direct fetch with multiple retries
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt + 1} to fetch ${url} directly`);
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Referer': 'https://www.google.com/'
            },
            redirect: 'follow',
            // Increase timeout for slow sites
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();
          if (!html || html.trim().length < 100) {
            throw new Error('Empty or too small HTML response');
          }

          console.log(`Successfully fetched ${url} with ${html.length} bytes`);
          return html;
        } catch (error) {
          console.error(`Direct fetch attempt ${attempt + 1} failed:`, error);
          lastError = error;
          if (attempt < maxRetries) {
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 500;
            console.log(`Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // If direct fetch failed, try using crawl4ai as a fallback
      try {
        console.log('Direct fetch failed, trying crawl4ai as fallback');
        return await fetchWithCrawl4ai(url);
      } catch (crawlError) {
        console.error('Both direct fetch and crawl4ai failed:', crawlError);
        // Throw the original error from direct fetch
        throw lastError;
      }
    }

    (async () => {
      try {
        const html = await fetchWithRetry(url);

        const parser = new DOMParser();
        const document = parser.parseFromString(html, 'text/html');

        if (!document) {
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', 'Failed to parse HTML');
          return;
        }

        const title = document.querySelector('title')?.textContent || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        const bodyText = document.querySelector('body')?.textContent || '';
        const mainText = document.querySelector('main')?.textContent || bodyText;

        // Extract only the most important content for faster processing
        // First try to get the most relevant sections
        const h1Text = Array.from(document.querySelectorAll('h1, h2, h3')).map(el => el.textContent).join(' ');
        const metaTags = Array.from(document.querySelectorAll('meta[name="keywords"], meta[name="description"]'))
          .map(el => el.getAttribute('content')).filter(Boolean).join(' ');

        // Get first 1000 chars of main content + headings + meta tags for a focused analysis
        const cleanedText = [h1Text, metaTags, mainText.substring(0, 3000)]
          .join('\n')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 4000);

        console.log('Calling OpenAI proxy for analysis...');
        try {
          // Call the openai-proxy Edge Function instead of using the OpenAI API directly
          const response = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/openai-proxy`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
              },
              body: JSON.stringify({
                model: 'gpt-4o', // Using the most capable model for best results
                temperature: 0.2, // Lower temperature for more deterministic results
                max_tokens: 300, // Limit response size for faster processing
                messages: [
                  {
                    role: 'system',
                    content: `Extract key marketing information from website content. Be concise and accurate.`
                  },
                  {
                    role: 'user',
                    content: `
Analyze this website content and extract key information:

Website: ${title}
Description: ${metaDescription}
Content: ${cleanedText}

Return a JSON object with these keys:
- "coreOffer": Main product/service offered
- "targetAudience": Who it's for
- "problemSolved": Main problem it solves
- "valueProposition": Core value proposition
- "keyBenefits": List of 3 main benefits (array)
- "keyPhrases": 2-3 key phrases from the content (array)

Keep it concise. Use "Not found" if information is missing.`
                  }
                ],
                response_format: { type: 'json_object' }
              })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI proxy error: ${response.status} ${errorText}`);
          }

          const completion = await response.json();

          console.log('OpenAI API response received');

          let analysisResult;
          try {
            // Check if the response is already a JSON object
            const content = completion.choices[0].message.content;
            console.log('Raw OpenAI response:', content);

            if (typeof content === 'string') {
              analysisResult = JSON.parse(content);
            } else {
              // If it's already an object, use it directly
              analysisResult = content;
            }

            console.log('Successfully parsed OpenAI response:', analysisResult);

            // Ensure the result has the expected structure
            if (!analysisResult || typeof analysisResult !== 'object') {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            console.error('Raw response:', completion.choices[0].message.content);
            await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', 'Failed to parse OpenAI response');
            return;
          }

          console.log('Updating scraping record with analysis results...');
          const { error: updateError } = await supabase
            .from('website_scraping')
            .update({
              status: 'completed',
              analysis_result: {
                status: 'complete',
                error_message: null,
                analyzed_url: url,
                findings: analysisResult,
                scraped_at: new Date().toISOString()
              },
              title: title,
              meta_description: metaDescription,
              completed_at: new Date().toISOString()
            })
            .eq('id', scrapingRecord.id);

          if (updateError) {
            console.error('Error updating scraping record:', updateError);
            await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', 'Failed to update scraping record');
            return;
          }

          console.log('Website scraping completed successfully');
        } catch (openaiError) {
          console.error('OpenAI API error:', openaiError);
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', `OpenAI API error: ${openaiError.message || 'Unknown error'}`);
          return;
        }

      } catch (error) {
        console.error('Scraping error:', error);
        let errorMessage = error.message || 'Unknown error during website scraping';

        if (error.name === 'AbortError') {
          errorMessage = `Request timed out while fetching ${url}`;
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = `Domain not found: ${url}`;
        } else if (error.message && error.message.includes('ssl')) {
          errorMessage = `SSL certificate error for ${url}`;
        }

        console.log(`Updating scraping status to failed: ${errorMessage}`);
        try {
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', errorMessage);
          console.log('Status updated successfully');
        } catch (updateError) {
          console.error('Failed to update scraping status:', updateError);
        }
      }
    })();

    return new Response(
      JSON.stringify({
        message: 'Website scraping started',
        scrapingId: scrapingRecord.id,
        status: 'processing'
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});

async function updateScrapingStatus(supabase, id, status, errorMessage = null) {
  const timestamp = new Date().toISOString();

  console.log(`Updating scraping status for ID ${id} to ${status}${errorMessage ? ': ' + errorMessage : ''}`);

  try {
    const { error } = await supabase
      .from('website_scraping')
      .update({
        status: status,
        error: errorMessage,
        analysis_result: status === 'failed' ? {
          status: 'failed',
          error_message: errorMessage,
          analyzed_url: null,
          findings: null,
          scraped_at: timestamp
        } : null,
        completed_at: timestamp
      })
      .eq('id', id);

    if (error) {
      console.error(`Error updating scraping status: ${error.message}`);
      throw error;
    }

    console.log(`Successfully updated scraping status for ID ${id}`);
  } catch (error) {
    console.error(`Failed to update scraping status for ID ${id}:`, error);
    throw error;
  }
}
