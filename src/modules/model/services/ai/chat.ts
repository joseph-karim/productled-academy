import { openai, handleOpenAIRequest } from './client';

export async function generateFromChat(
  responses: Record<string, string>
): Promise<{
  productDescription?: string;
  beginnerOutcome?: string;
  intermediateOutcome?: string;
  advancedOutcome?: string;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist. Based on the user's responses, generate concise content for their product (2-3 sentences max per section).

Your task is to craft:
1. A clear product description that effectively communicates:
   - The core problem solved
   - The primary value proposition
   - What makes the product unique

2. User outcomes that show clear progression (2-3 sentences each):
   - Beginner: First valuable outcome achieved quickly
   - Intermediate: Team-wide benefits and scaled usage
   - Advanced: Enterprise-level results and strategic impact

Guidelines:
- Be extremely concise
- Use metrics when possible (e.g., "3x faster", "50% reduction")
- Focus on benefits over features
- Use active voice
- Avoid jargon`
        },
        {
          role: "user",
          content: `Here are the responses to generate content from:

${Object.entries(responses).map(([key, value]) => `${key}: ${value}`).join('\n\n')}

Please generate the appropriate content based on these responses.`
        }
      ],
      functions: [
        {
          name: "generate_content",
          description: "Generate product description and user outcomes",
          parameters: {
            type: "object",
            properties: {
              productDescription: {
                type: "string",
                description: "The final 2-3 sentence product description"
              },
              beginnerOutcome: {
                type: "string",
                description: "Outcome for beginner users (2-3 sentences)"
              },
              intermediateOutcome: {
                type: "string",
                description: "Outcome for intermediate users (2-3 sentences)"
              },
              advancedOutcome: {
                type: "string",
                description: "Outcome for advanced users (2-3 sentences)"
              }
            }
          }
        }
      ],
      function_call: { name: "generate_content" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No content generated");
      return JSON.parse(result);
    }),
    'generating from chat'
  );
}