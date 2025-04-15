import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.28.0';

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
    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured on the server' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Parse the request body
    const requestData = await req.json();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: requestData.model || 'gpt-4o',
      messages: requestData.messages,
      temperature: requestData.temperature,
      max_tokens: requestData.max_tokens,
      function_call: requestData.function_call,
      response_format: requestData.response_format
    });

    // Return the response
    return new Response(
      JSON.stringify(completion),
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
