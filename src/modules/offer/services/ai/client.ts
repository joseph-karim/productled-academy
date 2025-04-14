import OpenAI from 'openai';
import { callOpenAI, handleOpenAIProxyRequest } from '../../../../services/openai-proxy';

// Create a mock OpenAI client that uses the proxy
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

export async function handleOpenAIRequest<T>(request: Promise<T>, errorContext: string): Promise<T> {
  return handleOpenAIProxyRequest(async () => request, errorContext);
}