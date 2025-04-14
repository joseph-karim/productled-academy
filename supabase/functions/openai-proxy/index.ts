import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { model, messages, function_call, response_format } = await req.json();
    
    if (!model || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters. Required: model, messages (array)' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured on the server' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    // Prepare the request parameters
    const requestParams: any = {
      model,
      messages
    };
    
    // Add optional parameters if provided
    if (function_call) {
      requestParams.function_call = function_call;
    }
    
    if (response_format) {
      requestParams.response_format = response_format;
    }
    
    // Make the OpenAI API call
    const completion = await openai.chat.completions.create(requestParams);
    
    // Return the response
    return new Response(
      JSON.stringify(completion),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error processing OpenAI request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error processing OpenAI request',
        message: error.message || 'Unknown error'
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
