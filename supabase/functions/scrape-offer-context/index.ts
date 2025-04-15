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

    async function scrapeWebsiteWithCrawl4ai(url: string, maxRetries = 1) {
      let lastError;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt + 1} to scrape ${url} with crawl4ai`);

          const crawlServiceUrl = Deno.env.get('CRAWL4AI_SERVICE_URL') || 'http://localhost:8000';
          const authToken = Deno.env.get('CRAWL4AI_AUTH_TOKEN') || '2080526ca47212486f0f655572b6c6c2af4257af71a93c78dfe77258e07e287a';

          // Use AbortController for timeout control
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const response = await fetch(`${crawlServiceUrl}/api/v1/scrape`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({
              url: url,
              javascript_enabled: true,
              wait_for_selector: 'body',
              timeout: 15000, // Reduced timeout
              max_retries: 1,  // Reduced retries
              // Only get essential content
              extract_rules: {
                title: 'title',
                headings: 'h1, h2',
                meta: 'meta[name="description"], meta[name="keywords"]',
                main_content: 'main, article, .content, #content, .main'
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

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
            await new Promise(resolve => setTimeout(resolve, 500)); // Reduced wait time
          }
        }
      }
      throw lastError;
    }

    async function fetchWithRetry(url: string, maxRetries = 2) {
      // Optimized fetch function with faster fallback strategy
      let lastError;

      // Use a more aggressive timeout to fail faster
      const timeoutMs = 20000; // 20 seconds timeout

      // Try direct fetch first with fewer retries
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          console.log(`Attempt ${attempt + 1} to fetch ${url} directly`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            redirect: 'follow',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

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
          if (attempt < 1) {
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // If direct fetch failed, immediately try crawl4ai
      try {
        console.log('Direct fetch failed, trying crawl4ai as fallback');
        return await scrapeWebsiteWithCrawl4ai(url, 1); // Only 1 retry for crawl4ai
      } catch (crawlError) {
        console.error('Both direct fetch and crawl4ai failed:', crawlError);
        throw lastError || crawlError;
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
        // Optimize text extraction by focusing on high-value elements

        // Function to clean text (remove extra whitespace, normalize)
        const cleanText = (text) => {
          if (!text) return '';
          return text.replace(/\s+/g, ' ').trim();
        };

        // Parallel processing for faster extraction
        const [
          headings,
          metaTagsContent,
          heroSection,
          featuresSection,
          pricingSection,
          aboutSection
        ] = await Promise.all([
          // Extract headings (most important content indicators)
          Promise.resolve(Array.from(document.querySelectorAll('h1, h2')).map(el => cleanText(el.textContent)).join(' | ')),

          // Extract meta tags (SEO-optimized content summary)
          Promise.resolve(Array.from(document.querySelectorAll('meta[name="keywords"], meta[name="description"], meta[property="og:description"]'))
            .map(el => cleanText(el.getAttribute('content'))).filter(Boolean).join(' | ')),

          // Extract hero section (usually contains value proposition)
          Promise.resolve(cleanText(document.querySelector('header, .hero, [class*="hero"], [id*="hero"]')?.textContent || '')),

          // Extract features section (contains benefits)
          Promise.resolve(cleanText(document.querySelector('.features, [class*="feature"], [id*="feature"]')?.textContent || '')),

          // Extract pricing section (contains offer details)
          Promise.resolve(cleanText(document.querySelector('.pricing, [class*="price"], [id*="price"]')?.textContent || '')),

          // Extract about section (contains company info)
          Promise.resolve(cleanText(document.querySelector('.about, [class*="about"], [id*="about"]')?.textContent || ''))
        ]);

        // Prioritize content by importance and limit size
        const prioritizedContent = [
          headings,                                // Highest priority - headings capture main points
          metaTagsContent,                        // High priority - meta tags are concise summaries
          heroSection.substring(0, 500),          // High priority - hero section has value proposition
          featuresSection.substring(0, 500),      // Medium priority - features section has benefits
          pricingSection.substring(0, 300),       // Medium priority - pricing has offer details
          aboutSection.substring(0, 300),         // Lower priority - about section has company info
          mainText.substring(0, 1000)             // Fallback - general content if specific sections not found
        ].filter(Boolean);

        // Combine and limit total size to 3000 chars for faster API processing
        const cleanedText = prioritizedContent.join('\n').substring(0, 3000);

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
                model: 'gpt-4o', // Keep using gpt-4o as requested
                temperature: 0.1, // Even lower temperature for faster, more deterministic results
                max_tokens: 250, // Further limit response size for faster processing
                top_p: 0.9, // Slightly reduce diversity for faster responses
                messages: [
                  {
                    role: 'system',
                    content: `You are a precise marketing data extractor. Extract only the requested fields from website content. Be extremely concise. Use "Not found" for missing information. Format as valid JSON only.`
                  },
                  {
                    role: 'user',
                    content: `Extract marketing data from this website:

Title: ${title}
Meta: ${metaDescription}
Content: ${cleanedText}

Return ONLY a JSON object with these exact keys:
"coreOffer": (string) Main product/service
"targetAudience": (string) Target users
"problemSolved": (string) Main problem
"valueProposition": (string) Core value
"keyBenefits": (array) 3 benefits
"keyPhrases": (array) 2-3 phrases
"onboardingSteps": (array) 3-5 steps as {"description": string, "timeEstimate": string}
"competitiveAdvantages": (array) 2-3 advantages

Be extremely concise. Use "Not found" for missing data.`
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
            // Faster response handling with less logging
            const content = completion.choices[0].message.content;

            // Parse the content if it's a string, otherwise use it directly
            analysisResult = typeof content === 'string' ? JSON.parse(content) : content;

            // Quick validation of the result
            if (!analysisResult || typeof analysisResult !== 'object') {
              throw new Error('Invalid response format');
            }

            // Ensure all required fields exist (add defaults if missing)
            const requiredFields = ['coreOffer', 'targetAudience', 'problemSolved', 'valueProposition', 'keyBenefits'];
            for (const field of requiredFields) {
              if (!analysisResult[field]) {
                analysisResult[field] = 'Not found';
              }
            }

            // Ensure arrays are arrays
            if (!Array.isArray(analysisResult.keyBenefits)) analysisResult.keyBenefits = [];
            if (!Array.isArray(analysisResult.keyPhrases)) analysisResult.keyPhrases = [];
            if (!Array.isArray(analysisResult.onboardingSteps)) analysisResult.onboardingSteps = [];
            if (!Array.isArray(analysisResult.competitiveAdvantages)) analysisResult.competitiveAdvantages = [];
          } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError.message);
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
  // Optimized status update function
  const timestamp = new Date().toISOString();

  // Simplified logging
  if (status === 'failed') {
    console.log(`Updating scraping status for ID ${id} to failed: ${errorMessage || 'Unknown error'}`);
  }

  try {
    // Simplified update payload
    const updatePayload = {
      status: status,
      error: errorMessage,
      completed_at: timestamp
    };

    // Only add analysis_result for failed status
    if (status === 'failed') {
      updatePayload.analysis_result = {
        status: 'failed',
        error_message: errorMessage,
        scraped_at: timestamp
      };
    }

    // Execute the update
    const { error } = await supabase
      .from('website_scraping')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error.message);
    }
  } catch (error) {
    // Just log the error but don't throw to prevent cascading failures
    console.error('Failed to update status:', error.message);
  }
}
