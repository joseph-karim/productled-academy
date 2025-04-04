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
    
    (async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        if (!html || html.length < 100) {
          throw new Error('Website returned empty or very small content');
        }
        
        let document;
        try {
          const parser = new DOMParser();
          document = parser.parseFromString(html, 'text/html');
          
          if (!document) {
            throw new Error('Failed to parse HTML');
          }
        } catch (parseError) {
          console.error('HTML parsing error:', parseError);
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', `Failed to parse HTML: ${parseError.message}`);
          return;
        }
        
        let title = '';
        let metaDescription = '';
        
        try {
          title = document.querySelector('title')?.textContent || '';
          metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        } catch (extractError) {
          console.error('Metadata extraction error:', extractError);
          // Continue anyway, these are optional
        }
        
        let cleanedText = '';
        try {
          const bodyText = document.querySelector('body')?.textContent || '';
          const mainText = document.querySelector('main')?.textContent || bodyText;
          
          cleanedText = mainText
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 15000); // Limit to 15K chars for OpenAI
            
          if (cleanedText.length < 100) {
            throw new Error('Extracted text is too short for analysis');
          }
        } catch (contentError) {
          console.error('Content extraction error:', contentError);
          await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', `Failed to extract content: ${contentError.message}`);
          return;
        }
        
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
              content: `You are an expert marketing and offer analyst. Your task is to meticulously analyze the provided website text content to understand the core offer being presented. Extract the key components and structure your findings strictly as a JSON object.`
            },
            {
              role: 'user',
              content: `
Analyze this website content and extract the following information:

Website Title: ${title}
Meta Description: ${metaDescription}

Content: ${cleanedText}

Extract and return a JSON object with these keys:
- "coreOffer": The primary product or service being offered. Be concise.
- "targetAudience": The specific group of people or businesses the offer appears intended for.
- "problemSolved": The main pain point or challenge the offer claims to address for the target audience.
- "keyBenefits": List the distinct, primary benefits or key features highlighted in the text.
- "valueProposition": Identify the core value proposition if explicitly stated or clearly implied. Summarize the main promise.
- "cta": The main call(s) to action presented on the page (e.g., "Sign Up", "Learn More", "Request Demo").
- "tone": Describe the overall tone and style of the language used (e.g., "Formal", "Casual", "Technical", "Benefit-Driven", "Humorous").
- "missingInfo": List any crucial offer components (like pricing, clear success metrics, guarantees) that seem absent or unclear from the provided text.

If a specific piece of information is not clearly present, use null or an empty array for the corresponding key. Do not invent information.`
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
        await updateScrapingStatus(supabase, scrapingRecord.id, 'failed', error.message);
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
