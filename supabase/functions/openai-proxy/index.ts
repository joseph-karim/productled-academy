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
    // For local development, you can set a dummy key or your actual key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    console.log(`OpenAI API key available: ${!!openaiApiKey}`);

    if (!openaiApiKey) {
      console.error('CRITICAL ERROR: OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured on the server',
          message: 'Please check the Edge Function configuration and ensure the OPENAI_API_KEY is set correctly.'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Log a safe version of the key for debugging
    console.log(`Using key starting with: ${openaiApiKey.substring(0, 7)}...`);
    console.log('Key length:', openaiApiKey.length);

    // Initialize OpenAI client with proper configuration
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: false, // This is a server environment
      maxRetries: 3, // Add retries for better reliability
      timeout: 30000 // 30 second timeout
    });

    // Parse the request body
    const requestData = await req.json();

    // For local development, check if we're using the dummy key
    let completion;

    if (openaiApiKey === 'sk-dummy-key-for-local-development') {
      console.log('Using mock OpenAI response for local development');
      console.log('Request data:', JSON.stringify(requestData));

      // Create a mock response
      completion = {
        id: 'mock-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: requestData.model || 'gpt-4o',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a mock response from the local development environment. The OpenAI API was not actually called.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      };
    } else {
      // Call the actual OpenAI API with proper handling of all parameters
      console.log('Calling OpenAI API with model:', requestData.model || 'gpt-4o');

      // Prepare the API call parameters
      const apiParams = {
        model: requestData.model || 'gpt-4o',
        messages: requestData.messages,
        temperature: requestData.temperature,
        max_tokens: requestData.max_tokens,
        top_p: requestData.top_p,
        frequency_penalty: requestData.frequency_penalty,
        presence_penalty: requestData.presence_penalty,
        stop: requestData.stop,
        stream: false // We don't support streaming in this proxy
      };

      // Handle function calling if present
      if (requestData.functions || requestData.function_call) {
        console.log('Function calling detected');
        if (requestData.functions) {
          apiParams.functions = requestData.functions;
        }
        if (requestData.function_call) {
          apiParams.function_call = requestData.function_call;
        }
      }

      // Handle response format if present
      if (requestData.response_format) {
        apiParams.response_format = requestData.response_format;
      }

      // Make the API call
      completion = await openai.chat.completions.create(apiParams);

      console.log('OpenAI API call successful');
    }

    // Return the response
    return new Response(
      JSON.stringify(completion),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error('Error in OpenAI proxy:', error);

    // Log detailed error information
    if (error.response) {
      console.error('OpenAI API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    // Create a more informative error message
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
    const errorType = error.response?.data?.error?.type || 'api_error';
    const statusCode = error.response?.status || 500;

    return new Response(
      JSON.stringify({
        error: errorMessage,
        error_type: errorType,
        status: statusCode,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: statusCode }
    );
  }
});
