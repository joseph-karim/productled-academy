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

  try {
    const { url, offerId, userId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }
    
    const effectiveUserId = userId || null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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
    
    async function fetchWithRetry(url: string, maxRetries = 2) {
      try {
        return await scrapeWebsiteWithCrawl4ai(url, maxRetries);
      } catch (crawlError) {
        console.error('crawl4ai scraping failed, falling back to direct fetch:', crawlError);
        
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempt ${attempt + 1} to fetch ${url} directly`);
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.google.com/'
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.text();
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
        
        const cleanedText = mainText
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 15000); // Limit to 15K chars for OpenAI
        
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        
        if (!openaiApiKey) {
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', 'Missing OpenAI API key');
          return;
        }
        
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert marketing and offer analyst with deep expertise in product-led growth strategies. Your task is to meticulously analyze the provided website text content to understand the core offer being presented. Extract the key components with high precision and detail, structuring your findings strictly as a JSON object. Be thorough in your analysis, looking for both explicit statements and implicit indicators in the content.`
            },
            {
              role: 'user',
              content: `
Analyze this website content and extract the following information with as much detail as possible:

Website Title: ${title}
Meta Description: ${metaDescription}

Content: ${cleanedText}

Extract and return a JSON object with these keys:

- "coreOffer": The primary product or service being offered. Be specific about what it is, what it does, and how it's delivered (SaaS, physical product, service, etc.). Include pricing model if mentioned (subscription, one-time, etc.).

- "targetAudience": The specific group of people or businesses the offer is intended for. Include:
  * Demographics (if mentioned)
  * Job titles or roles
  * Industry verticals
  * Company size (if B2B)
  * Pain points specific to this audience
  * Level of technical expertise required

- "problemSolved": The main pain points or challenges the offer claims to address. Include:
  * Primary problem
  * Secondary problems
  * How the problem impacts the target audience
  * Current alternatives or workarounds mentioned
  * Cost of inaction (if mentioned)

- "keyBenefits": A comprehensive list of benefits or features highlighted in the text. For each, include:
  * The specific benefit
  * How it relates to solving the problem
  * Any metrics or statistics mentioned (e.g., "saves 30% time")
  * Whether it's unique or differentiated from competitors

- "valueProposition": The core value proposition, including:
  * The main promise to customers
  * The transformation or outcome offered
  * Timeframe for results (if mentioned)
  * Risk reduction elements (guarantees, free trials, etc.)

- "cta": All calls to action presented on the page, including:
  * Primary CTA text
  * Secondary CTAs
  * The action users are asked to take
  * Any urgency or scarcity tactics used

- "tone": Detailed analysis of the communication style:
  * Overall tone (formal, casual, technical, etc.)
  * Use of social proof or authority
  * Emotional appeals used
  * Level of technical language
  * Use of storytelling or case studies

- "missingInfo": Crucial offer components that seem absent or unclear:
  * Pricing details
  * Implementation requirements
  * Technical specifications
  * Success metrics or case studies
  * Support or onboarding information
  * Comparison with alternatives

- "keyPhrases": Extract 5-10 exact phrases or sentences that best capture the core messaging of the offer.

- "competitiveAdvantages": Any explicit or implicit statements about how this offer differs from alternatives or competitors.

If a specific piece of information is not clearly present, provide your best inference based on context, but mark it as inferred. If you cannot make a reasonable inference, use null or an empty array for the corresponding key. Prioritize accuracy over completeness.`
            }
          ],
          response_format: { type: 'json_object' }
        });
        
        const analysisResult = JSON.parse(completion.choices[0].message.content);
        
        await supabase
          .from('website_scraping')
          .update({
            status: 'completed',
            analysis_result: {
              status: 'complete',
              error_message: null,
              analyzed_url: url,
              findings: JSON.parse(completion.choices[0].message.content),
              scraped_at: new Date().toISOString()
            },
            title: title,
            meta_description: metaDescription,
            completed_at: new Date().toISOString()
          })
          .eq('id', scrapingRecord.id);
          
      } catch (error) {
        console.error('Scraping error:', error);
        let errorMessage = error.message || 'Unknown error during website scraping';
        
        if (error.name === 'AbortError') {
          errorMessage = `Request timed out while fetching ${url}`;
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = `Domain not found: ${url}`;
        } else if (error.message.includes('ssl')) {
          errorMessage = `SSL certificate error for ${url}`;
        }
        
        await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', errorMessage);
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
  
  await supabase
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
}
