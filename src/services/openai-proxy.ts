import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
export async function callOpenAI(params: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: params
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(`OpenAI proxy error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in callOpenAI:', error);
    throw error;
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
