import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { OpenAI } from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, offerId, userId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

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
        user_id: userId,
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
        const response = await fetch(url);
        const html = await response.text();
        
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
              content: 'You are an expert at analyzing websites and extracting key business information. Extract structured data from the provided website content.'
            },
            {
              role: 'user',
              content: `Analyze this website content and extract the following information:
              1. Core Offer/Product: What is the main product or service being offered?
              2. Target Audience: Who is the product/service for?
              3. Key Problem: What problem does this product/service solve?
              4. Value Proposition: What is the main value proposition?
              5. Key Features/Benefits: What are the main features or benefits?
              
              Website Title: ${title}
              Meta Description: ${metaDescription}
              
              Content: ${cleanedText}
              
              Return ONLY a JSON object with these keys: coreOffer, targetAudience, keyProblem, valueProposition, keyFeatures (array)`
            }
          ],
          response_format: { type: 'json_object' }
        });
        
        const analysisResult = JSON.parse(completion.choices[0].message.content);
        
        await supabase
          .from('website_scraping')
          .update({
            status: 'completed',
            analysis_result: analysisResult,
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

async function updateScrapingStatus(supabase, id, status, error = null) {
  await supabase
    .from('website_scraping')
    .update({
      status: status,
      error: error,
      completed_at: new Date().toISOString()
    })
    .eq('id', id);
}
