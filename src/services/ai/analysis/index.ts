import { openai, handleOpenAIRequest } from '../client';
import { systemPrompt, generateUserPrompt } from './prompts';
import { analysisFunction } from './functions';
import type { AnalysisInput } from './types';
import type { Analysis } from '../../../types';

export async function analyzeFormData(input: AnalysisInput): Promise<Analysis> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        systemPrompt,
        generateUserPrompt(input)
      ],
      functions: [analysisFunction],
      function_call: { name: "provide_analysis" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No analysis received");
      return JSON.parse(result);
    }),
    'analyzing form data'
  );
}

export * from './types';