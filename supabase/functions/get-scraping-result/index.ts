import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Get the Supabase URL and service role key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured on the server' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { scrapingId } = await req.json();
    
    if (!scrapingId) {
      return new Response(
        JSON.stringify({ error: 'Missing scrapingId parameter' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }
    
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
      JSON.stringify({
        id: data.id,
        status: data.status,
        url: data.url,
        title: data.title,
        meta_description: data.meta_description,
        analysis_result: data.analysis_result,
        error: data.error,
        created_at: data.created_at,
        completed_at: data.completed_at
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
