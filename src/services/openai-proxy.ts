import { supabase } from './supabase';

// Type definitions for OpenAI API
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  function_call?: { name: string } | 'auto' | 'none';
  response_format?: { type: 'json_object' | 'text' };
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
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
 * Makes a secure OpenAI API call through the Supabase Edge Function
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
    
    return data as ChatCompletionResponse;
  } catch (error) {
    console.error('Error in callOpenAI:', error);
    throw error;
  }
}

/**
 * Helper function to handle OpenAI requests with error handling
 */
export async function handleOpenAIProxyRequest<T>(
  requestFn: () => Promise<T>, 
  errorContext: string
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    console.error(`Error ${errorContext}:`, error);
    throw new Error(`Failed while ${errorContext}: ${error.message}`);
  }
}
