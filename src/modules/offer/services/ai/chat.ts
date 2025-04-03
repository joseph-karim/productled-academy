import { openai, handleOpenAIRequest } from './client';
import type { ChatMessage, OfferAnalysisResult } from './types';

/**
 * Gets a response from the AI coach based on conversation history and analysis context
 */
export async function getAnalysisCoachResponse(
  messages: ChatMessage[],
  analysisContext: OfferAnalysisResult
): Promise<string> {
  // Format scorecard highlights
  const scorecardHighlights = analysisContext.scorecard
    .map(item => `${item.item}: ${item.rating}`)
    .join(', ');
  
  // Extract key feedback points
  const feedback = analysisContext.feedback;
  const strengthsSection = feedback.split('### Areas for Improvement')[0].replace('### Key Strengths', '').trim();
  const improvementSection = feedback.split('### Areas for Improvement')[1]?.split('### Suggested Next Steps')[0]?.trim() || '';
  
  // Format next steps
  const nextStepsList = analysisContext.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n');
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed coach AI assistant, designed to be helpful, knowledgeable, and action-oriented. The user has just completed the Offer Component tool and received an evaluation of their drafted offer.

Here's a summary:
- Scorecard Highlights: ${scorecardHighlights}
- Key Feedback - Strengths: ${strengthsSection}
- Key Feedback - Areas for Improvement: ${improvementSection}
- Suggested Next Steps: 
${nextStepsList}

Your goal is to help the user understand these results, process the feedback, and turn the suggested next steps into a concrete, personal action plan for the next 1-2 weeks. Be encouraging but push for clarity and specific actions.

Start the conversation by asking for their initial reaction to the scorecard and feedback.`
        },
        ...messages
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    }),
    'generating coach response'
  );
}

/**
 * Generates additional actionable steps based on analysis results
 */
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
Next Steps Already Suggested: ${analysisContext.nextSteps.join('\n')}

Please generate 5-7 additional highly specific action steps that would be valuable for implementing these recommendations. 
Each step should:
1. Be extremely specific and concrete (not general advice)
2. Include clear success criteria
3. Be actionable within 1-2 weeks
4. Focus on highest impact improvements first
5. Include effort required (Low/Medium/High) and impact potential (Low/Medium/High)

Format as an array of objects with 'text', 'effort', 'impact', and 'timeframe' properties.`
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
                items: {
                  type: "object",
                  properties: {
                    text: { 
                      type: "string",
                      description: "The specific action step text"
                    },
                    effort: { 
                      type: "string", 
                      enum: ["minimal", "moderate", "significant"],
                      description: "The effort required to complete this step"
                    },
                    impact: { 
                      type: "string", 
                      enum: ["low", "medium", "high"],
                      description: "The potential impact of completing this step"
                    },
                    timeframe: { 
                      type: "string", 
                      enum: ["immediate", "short-term", "long-term"],
                      description: "The timeframe for implementation"
                    }
                  },
                  required: ["text", "effort", "impact", "timeframe"]
                }
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
      return parsed.actionSteps.map((step: any) => step.text);
    }),
    'generating action steps'
  );
}

/**
 * Analyze specific headlines based on ProductLed principles
 */
export async function analyzeHeadlines(
  userSuccessStatement: string,
  headlines: {
    hero: string[];
    problem: string[];
    solution: string[];
  }
): Promise<string> {
  const heroHeadlinesList = headlines.hero.map(h => `- ${h}`).join('\n');
  const problemHeadlinesList = headlines.problem.map(h => `- ${h}`).join('\n');
  const solutionHeadlinesList = headlines.solution.map(h => `- ${h}`).join('\n');
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Content Strategist. You provide concise feedback on offer headlines.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Content Strategist. Analyze the following headlines drafted for different sections of an offer page aiming for '${userSuccessStatement}':

Hero Headlines:
${heroHeadlinesList || "None provided"}

Problem Headlines:
${problemHeadlinesList || "None provided"}

Solution Headlines:
${solutionHeadlinesList || "None provided"}

Evaluate based on:
1. **Clarity:** Is the core message of each headline clear?
2. **Benefit Focus:** Do they emphasize user benefits or outcomes?
3. **Impact & Intrigue:** Are they attention-grabbing?
4. **Consistency:** Do they align with the overall offer goal?

Provide concise feedback as a bulleted list (max 3-4 points total), highlighting strengths and suggesting areas for improvement across the sets.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing headlines'
  );
}

/**
 * Analyze body copy based on ProductLed principles
 */
export async function analyzeBodyCopy(
  userSuccessStatement: string,
  headlines: {
    hero: string[];
    problem: string[];
    solution: string[];
  },
  bodyCopy: {
    hero: string;
    problem: string;
    solution: string;
  }
): Promise<string> {
  const heroHeadlinesList = headlines.hero.join(', ');
  const problemHeadlinesList = headlines.problem.join(', ');
  const solutionHeadlinesList = headlines.solution.join(', ');
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Content Strategist. You provide concise feedback on offer body copy.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Content Strategist. Analyze the following body copy snippets intended to support the headlines for an offer aiming for '${userSuccessStatement}':

- Hero Support Copy: '${bodyCopy.hero}' (supports headlines: ${heroHeadlinesList})
- Problem Support Copy: '${bodyCopy.problem}' (supports headlines: ${problemHeadlinesList})
- Solution Support Copy: '${bodyCopy.solution}' (supports headlines: ${solutionHeadlinesList})

Evaluate based on:
1. **Reinforcement:** Does the body copy effectively expand on and support the promise made in the corresponding headlines?
2. **Clarity & Persuasiveness:** Is the copy clear, easy to read, and persuasive?
3. **Conciseness:** Is there unnecessary jargon or fluff?
4. **Benefit Detail:** Does it provide sufficient detail about benefits or how the solution works?

Provide concise feedback as a bulleted list (max 3-4 points total), suggesting specific improvements for clarity, impact, or conciseness.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing body copy'
  );
} 