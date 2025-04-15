import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// For local development, use the local Supabase instance
// For production, use the environment variables
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const supabaseUrl = isLocalDevelopment
  ? 'http://127.0.0.1:54321'
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isLocalDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log(`OpenAI Proxy using Supabase URL: ${supabaseUrl}`);
console.log(`OpenAI Proxy using ${isLocalDevelopment ? 'local development' : 'production'} environment`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Types
export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatCompletionMessage[];
  function_call?: { name: string } | 'auto' | 'none';
  response_format?: { type: 'json_object' | 'text' };
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenAI API through Supabase Edge Function
 * This prevents exposing the OpenAI API key in client-side code
 */
// Fallback OpenAI API key - ONLY FOR DEVELOPMENT/DEMO
// In production, this should be handled by the Edge Function
const FALLBACK_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export async function callOpenAI(params: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  // First try using the Supabase Edge Function
  try {
    console.log('Attempting to call OpenAI via Supabase Edge Function');
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: params
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(`OpenAI proxy error: ${error.message}`);
    }

    return data;
  } catch (edgeFunctionError) {
    console.error('Edge Function error:', edgeFunctionError);

    // If Edge Function fails and we have a fallback API key, try direct API call
    if (FALLBACK_OPENAI_API_KEY) {
      console.log('Attempting direct OpenAI API call as fallback');
      try {
        // Make direct API call to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FALLBACK_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            ...params,
            // Always use gpt-4o for best results
            model: 'gpt-4o'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        return await response.json();
      } catch (directApiError) {
        console.error('Direct OpenAI API call failed:', directApiError);
        throw new Error(`Both Edge Function and direct API call failed: ${directApiError.message}`);
      }
    } else {
      // No fallback available
      console.error('No fallback API key available');
      throw new Error(`OpenAI proxy error and no fallback available: ${edgeFunctionError.message}`);
    }
  }
}

/**
 * Generate a chat completion using the OpenAI API
 * This is a wrapper around callOpenAI that provides a simpler interface
 */
export async function generateChatCompletion(
  messages: ChatCompletionMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    function_call?: { name: string } | 'auto' | 'none';
    response_format?: { type: 'json_object' | 'text' };
  } = {}
): Promise<string> {
  try {
    const response = await callOpenAI({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      function_call: options.function_call,
      response_format: options.response_format
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
}

/**
 * Handle OpenAI proxy requests with error handling
 */
export async function handleOpenAIProxyRequest<T>(
  requestFn: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    console.error(`Error ${errorContext}:`, error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Authentication error. Please check your API key configuration.');
      } else if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded or insufficient quota. Please try again later.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
    }

    throw new Error(`Failed to ${errorContext}. Please try again.`);
  }
}
