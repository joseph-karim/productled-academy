// Simple test file for debugging website fetching in Edge Functions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Simple test function that just tries to fetch a URL
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }
    
    console.log(`Attempting to fetch URL: ${url}`);
    
    // Try with browser-like headers
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
    
    // Check response status
    const status = response.status;
    const statusText = response.statusText;
    console.log(`Response status: ${status} ${statusText}`);
    
    // Get response headers for debugging
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Get a sample of the response content
    const text = await response.text();
    const contentSample = text.substring(0, 500) + (text.length > 500 ? '...' : '');
    const contentLength = text.length;
    
    return new Response(
      JSON.stringify({ 
        success: response.ok,
        status,
        statusText,
        headers,
        contentLength,
        contentSample
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
}); 