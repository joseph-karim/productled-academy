import { callOpenAI, handleOpenAIProxyRequest } from '../../../../services/openai-proxy';

// Mock OpenAI client for compatibility with existing code
export const openai = {
  chat: {
    completions: {
      create: async (params: any) => {
        try {
          return await callOpenAI(params);
        } catch (error) {
          console.error('Error calling OpenAI proxy:', error);
          throw error;
        }
      }
    }
  }
};

/**
 * Handles OpenAI requests through the secure proxy
 * This prevents exposing the OpenAI API key in client-side code
 */
export async function handleOpenAIRequest<T>(request: Promise<T>, errorContext: string): Promise<T> {
  return handleOpenAIProxyRequest(async () => request, errorContext);
}