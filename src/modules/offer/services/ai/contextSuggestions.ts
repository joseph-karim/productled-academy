import { openai, handleOpenAIRequest } from './client';
import type { InitialContext, WebsiteScrapingData, AISuggestion } from './types';

export interface WebsiteAnalysisContext {
  coreOffer: string;
  targetAudience: string;
  problemSolved: string;
  keyBenefits: string[];
  valueProposition: string;
  keyPhrases?: string[] | null;
  onboardingSteps?: Array<{
    description: string;
    timeEstimate: string;
  }> | null;
  cta?: string | null;
  tone?: string | null;
  missingInfo?: string[] | null;
}

export async function generateUserSuccessSuggestions(
  initialContext: InitialContext,
  websiteScraping?: WebsiteScrapingData | null
): Promise<Omit<AISuggestion, 'id' | 'createdAt'>[]> {
  try {
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You're an assistant helping craft a strong user success statement for a product offer. Generate 3 specific, compelling suggestions."
          },
          {
            role: "user",
            content: `
            Based on this context:

            Current Offer: ${initialContext.currentOffer || 'Not specified'}
            Target Audience: ${initialContext.targetAudience || 'Not specified'}
            Problem Solved: ${initialContext.problemSolved || 'Not specified'}
            ${websiteScraping ? `
            Website Analysis:
            Core Offer: ${websiteScraping.coreOffer || 'Not found'}
            Target Audience: ${websiteScraping.targetAudience || 'Not found'}
            Problem Solved: ${websiteScraping.keyProblem || 'Not found'}
            Value Proposition: ${websiteScraping.valueProposition || 'Not found'}
            ` : ''}

            Generate 3 different compelling user success statements. Each should be a specific, measurable outcome that users will achieve with this product/service. Format each as a JSON object with "text" field.`
          }
        ],
        functions: [
          {
            name: "provide_success_suggestions",
            description: "Provide user success statement suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" }
                    },
                    required: ["text"]
                  }
                }
              },
              required: ["suggestions"]
            }
          }
        ],
        function_call: { name: "provide_success_suggestions" }
      }).then(completion => {
        const result = completion.choices[0].message.function_call?.arguments;
        if (!result) throw new Error("No suggestions received");

        const parsed = JSON.parse(result);
        return parsed.suggestions.map((s: any) => ({
          type: 'userSuccess',
          text: s.text
        }));
      }),
      'generating user success suggestions'
    );
  } catch (error) {
    console.error('Error generating user success suggestions:', error);
    return [];
  }
}

export async function generateTopResultsSuggestions(
  initialContext: InitialContext,
  userSuccess: string,
  websiteScraping?: WebsiteScrapingData | null
): Promise<Omit<AISuggestion, 'id' | 'createdAt'>[]> {
  try {
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You're an assistant helping identify top results for a product offer. Generate specific, compelling suggestions for tangible, intangible, and improvement results."
          },
          {
            role: "user",
            content: `
            Based on this context:

            Current Offer: ${initialContext.currentOffer || 'Not specified'}
            Target Audience: ${initialContext.targetAudience || 'Not specified'}
            Problem Solved: ${initialContext.problemSolved || 'Not specified'}
            User Success Statement: ${userSuccess || 'Not specified'}
            ${websiteScraping ? `
            Website Analysis:
            Core Offer: ${websiteScraping.coreOffer || 'Not found'}
            Target Audience: ${websiteScraping.targetAudience || 'Not found'}
            Problem Solved: ${websiteScraping.keyProblem || 'Not found'}
            Value Proposition: ${websiteScraping.valueProposition || 'Not found'}
            ` : ''}

            Generate 3 suggestions for top results users will achieve with this product/service:
            1. One tangible result (something measurable)
            2. One intangible result (emotional/psychological benefit)
            3. One improvement result (how something gets better)

            Format as JSON objects with "type" and "text" fields.`
          }
        ],
        functions: [
          {
            name: "provide_results_suggestions",
            description: "Provide top results suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["tangible", "intangible", "improvement"]
                      },
                      text: { type: "string" }
                    },
                    required: ["type", "text"]
                  }
                }
              },
              required: ["suggestions"]
            }
          }
        ],
        function_call: { name: "provide_results_suggestions" }
      }).then(completion => {
        const result = completion.choices[0].message.function_call?.arguments;
        if (!result) throw new Error("No suggestions received");

        const parsed = JSON.parse(result);
        return parsed.suggestions.map((s: any) => ({
          type: 'topResults',
          text: s.text,
          metadata: { resultType: s.type }
        }));
      }),
      'generating top results suggestions'
    );
  } catch (error) {
    console.error('Error generating top results suggestions:', error);
    return [];
  }
}

export async function generateSuggestions(
  field: 'targetAudience' | 'desiredResult' | 'keyAdvantage' | 'biggestBarrier' | 'assurance' | 'onboardingStep',
  initialContext: InitialContext,
  websiteFindings: WebsiteAnalysisContext | null
): Promise<string[]> {
  try {
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You're an assistant helping create a compelling offer. Generate 3-5 specific, actionable suggestions for the ${field} field.`
          },
          {
            role: "user",
            content: `
            Based on this context:

            Current Offer: ${initialContext.currentOffer || 'Not specified'}
            Target Audience: ${initialContext.targetAudience || 'Not specified'}
            Problem Solved: ${initialContext.problemSolved || 'Not specified'}
            ${websiteFindings ? `
            Website Analysis:
            Core Offer: ${websiteFindings.coreOffer || 'Not found'}
            Target Audience: ${websiteFindings.targetAudience || 'Not found'}
            Problem Solved: ${websiteFindings.problemSolved || 'Not found'}
            Value Proposition: ${websiteFindings.valueProposition || 'Not found'}
            ${websiteFindings.onboardingSteps && websiteFindings.onboardingSteps.length > 0 ? `
            Onboarding Steps:
            ${websiteFindings.onboardingSteps.map((step, index) => `${index + 1}. ${step.description} (${step.timeEstimate})`).join('\n')}` : ''}
            ` : ''}

            Generate 3-5 specific, compelling suggestions for the "${field}" field of my offer.
            For targetAudience: Focus on specific demographics, roles, or situations.
            For desiredResult: Focus on specific, measurable outcomes.
            For keyAdvantage: Focus on unique selling points or competitive advantages.
            For biggestBarrier: Focus on common objections or hesitations.
            For assurance: Focus on guarantees, social proof, or risk reversals.
            For onboardingStep: Focus on clear, actionable steps users need to take to get value from the product, with time estimates.

            Format as a JSON array of strings.`
          }
        ],
        functions: [
          {
            name: "provide_field_suggestions",
            description: `Provide suggestions for the ${field} field`,
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                }
              },
              required: ["suggestions"]
            }
          }
        ],
        function_call: { name: "provide_field_suggestions" }
      }).then(completion => {
        const result = completion.choices[0].message.function_call?.arguments;
        if (!result) throw new Error("No suggestions received");

        const parsed = JSON.parse(result);
        return parsed.suggestions;
      }),
      `generating ${field} suggestions`
    );
  } catch (error) {
    console.error(`Error generating ${field} suggestions:`, error);
    return [];
  }
}

export async function generateRiskReversalSuggestions(
  riskText: string
): Promise<Omit<AISuggestion, 'id' | 'createdAt'>[]> {
  try {
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You're an assistant helping craft compelling risk reversals for a product offer. Given a specific customer risk/hesitation, generate 1-2 concise suggestions to mitigate or reverse that risk. Focus on guarantees, clear processes, support, security, ease of use, etc."
          },
          {
            role: "user",
            content: `
            The customer's potential risk/hesitation is: "${riskText}"

            Generate 1-2 concise risk reversal statements to address this specific concern. Format each as a JSON object with a "text" field.`
          }
        ],
        functions: [
          {
            name: "provide_risk_reversal_suggestions",
            description: "Provide risk reversal suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" }
                    },
                    required: ["text"]
                  }
                }
              },
              required: ["suggestions"]
            }
          }
        ],
        function_call: { name: "provide_risk_reversal_suggestions" }
      }).then(completion => {
        const result = completion.choices[0].message.function_call?.arguments;
        if (!result) throw new Error("No suggestions received");

        const parsed = JSON.parse(result);
        // Ensure suggestions is always an array, even if only one is returned
        const suggestionsArray = Array.isArray(parsed.suggestions) ? parsed.suggestions : [parsed.suggestions].filter(Boolean);

        return suggestionsArray.map((s: any) => ({
          type: 'riskReversal', // Assuming this type exists or is appropriate
          text: s.text
        }));
      }),
      'generating risk reversal suggestions'
    );
  } catch (error) {
    console.error('Error generating risk reversal suggestions:', error);
    return [];
  }
}
