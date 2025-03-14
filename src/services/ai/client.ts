import OpenAI from 'openai';

// Initialize OpenAI with the API key from environment variables
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'default_key',
  dangerouslyAllowBrowser: true
});

// Check if API key is available
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
}

export async function handleOpenAIRequest<T>(request: Promise<T>, errorContext: string): Promise<T> {
  try {
    return await request;
  } catch (error) {
    console.error(`Error ${errorContext}:`, error);
    
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
        case 429:
          throw new Error('API rate limit exceeded or insufficient quota. Please try again later or check your OpenAI account.');
        case 500:
          throw new Error('OpenAI service error. Please try again later.');
        default:
          throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
    
    throw new Error(`Failed to ${errorContext}. Please try again.`);
  }
}