import { openai, handleOpenAIRequest } from './client';
import type { ChatMessage, OfferAnalysisResult } from './types';

export async function getAnalysisCoachResponse(
  messages: ChatMessage[],
  analysisContext: OfferAnalysisResult
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed coach AI assistant. You are helping a user process feedback on their offer and create an action plan based on a detailed analysis.

Analysis Context:
- Scorecard: ${JSON.stringify(analysisContext.scorecard)}
- Feedback: ${analysisContext.feedback}
- Next Steps: ${analysisContext.nextSteps.join(', ')}

Your goals:
1. Help the user understand the scorecard and feedback
2. Prioritize which improvements to focus on first
3. Provide specific, actionable guidance on implementing the next steps
4. Be encouraging, supportive, and positive, even when discussing areas for improvement
5. Keep responses concise (2-4 sentences) and focused on the user's specific questions
6. If the user asks something outside the scope of the offer analysis, gently guide them back to the topic

Respond in a conversational, coaching style that's helpful and practical.`
        },
        ...messages
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    }),
    'generating coach response'
  );
}

export async function generateActionSteps(analysisContext: OfferAnalysisResult): Promise<string[]> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed strategy expert. You need to convert analysis into specific, actionable steps. Each step should be concrete and implementable.`
        },
        {
          role: "user",
          content: `Based on this analysis:
            
Scorecard: ${JSON.stringify(analysisContext.scorecard)}
Feedback: ${analysisContext.feedback}
Next Steps: ${analysisContext.nextSteps.join('\n')}

Please generate 5-7 additional highly specific action steps that would be valuable for implementing these recommendations. 
Each step should:
1. Be extremely specific and concrete (not general advice)
2. Include clear success criteria
3. Be actionable within 1-2 weeks
4. Focus on highest impact improvements first

Format as simple bullet points.`
        }
      ],
      functions: [
        {
          name: "provide_action_steps",
          description: "Provide specific action steps based on the analysis",
          parameters: {
            type: "object",
            properties: {
              actionSteps: {
                type: "array",
                items: { type: "string" },
                description: "List of specific, concrete action steps"
              }
            },
            required: ["actionSteps"]
          }
        }
      ],
      function_call: { name: "provide_action_steps" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No action steps received");
      const parsed = JSON.parse(result);
      return parsed.actionSteps;
    }),
    'generating action steps'
  );
} 