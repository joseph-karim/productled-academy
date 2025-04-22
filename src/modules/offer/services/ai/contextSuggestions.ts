import { openai, handleOpenAIRequest } from './client';
import type { InitialContext, WebsiteScrapingData, AISuggestion } from './types';

export interface WebsiteAnalysisContext {
  coreOffer: string;
  targetAudience: string;
  problemSolved: string;
  keyBenefits: string[];
  valueProposition: string;
  // RARA framework fields from improved analysis
  desiredResult?: string | null;
  keyAdvantage?: string | null;
  biggestBarrier?: string | null;
  assurance?: string | null;
  // Suggestion arrays for each field
  targetAudienceSuggestions?: string[] | null;
  desiredResultSuggestions?: string[] | null;
  keyAdvantageSuggestions?: string[] | null;
  biggestBarrierSuggestions?: string[] | null;
  assuranceSuggestions?: string[] | null;
  // Other fields
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

export interface SuggestionWithReasoning {
  text: string;
  reasoning: string;
}

export async function generateSuggestions(
  field: 'targetAudience' | 'desiredResult' | 'keyAdvantage' | 'biggestBarrier' | 'assurance' | 'onboardingStep',
  initialContext: InitialContext,
  websiteFindings: WebsiteAnalysisContext | null,
  transcriptData?: any | null,
  raraStage?: number
): Promise<SuggestionWithReasoning[]> {
  try {
    // Determine which previous fields we have data for
    const hasTargetAudience = initialContext.targetAudience ||
                             (websiteFindings?.targetAudience) ||
                             (transcriptData?.targetAudience);

    const hasDesiredResult = field !== 'targetAudience' && (
                            initialContext.currentOffer ||
                            (websiteFindings?.valueProposition) ||
                            (transcriptData?.desiredResult));

    const hasKeyAdvantage = field !== 'targetAudience' &&
                          field !== 'desiredResult' &&
                          (websiteFindings?.keyBenefits?.length > 0 ||
                           transcriptData?.keyAdvantage);

    const hasBiggestBarrier = field !== 'targetAudience' &&
                            field !== 'desiredResult' &&
                            field !== 'keyAdvantage' &&
                            (websiteFindings?.problemSolved ||
                             transcriptData?.biggestBarrier);

    // Build a context-aware system prompt based on the field and available data
    let systemPrompt = "You are an expert ProductLed Offer Strategist. ";

    if (field === 'targetAudience') {
      systemPrompt += "Your role is to help users define their ideal Target Audience based on ProductLed principles. ";
      systemPrompt += "Act as a brainstorming partner to identify who would gain the most significant value or solve their biggest pain point with this product. ";
      systemPrompt += "Focus on roles, primary goals, or the 'job' they are trying to get done, not just demographics.";
    }
    else if (field === 'desiredResult') {
      systemPrompt += "Your role is to help users define the core Result their target audience achieves based on ProductLed principles. ";
      systemPrompt += "Focus on the single most desirable outcome or transformation they experience. ";
      systemPrompt += "The Result should be clear, compelling, and focused on what the user truly wants.";
    }
    else if (field === 'keyAdvantage') {
      systemPrompt += "Your role is to help users define their key Advantage based on ProductLed principles. ";
      systemPrompt += "Focus on what makes their solution 5-10x better than alternatives. ";
      systemPrompt += "Consider speed, ease, cost savings, unique technology/methodology, better support, or elimination of specific pains.";
    }
    else if (field === 'biggestBarrier') {
      systemPrompt += "Your role is to help users identify the biggest perceived Risk or objection that might stop their target audience from signing up. ";
      systemPrompt += "Focus on the #1 barrier - what would make someone hesitate? ";
      systemPrompt += "Consider setup complexity, cost concerns, integration worries, trust issues, or doubts about achieving the promised result.";
    }
    else if (field === 'assurance') {
      systemPrompt += "Your role is to help users create a compelling Assurance that directly counters their identified risk. ";
      systemPrompt += "Focus on how they can reverse the risk and build trust. ";
      systemPrompt += "Consider guarantees, easy onboarding promises, clear proof points, trial conditions, or success metrics.";
    }
    else if (field === 'onboardingStep') {
      systemPrompt += "Your role is to help users define clear onboarding steps that users need to take to get value from the product. ";
      systemPrompt += "Focus on actionable steps with realistic time estimates. ";
      systemPrompt += "Steps should be clear, sequential, and focused on getting the user to their first success moment.";
    }

    systemPrompt += "\n\nBased on the context provided, generate 2-3 distinct and specific suggestions for the requested component. ";
    systemPrompt += "For each suggestion, include a brief explanation of why it would be effective.";

    // Build a context-aware user prompt based on the field and available data
    let userPrompt = `Based on this context:\n\n`;

    // Add basic context
    userPrompt += `Current Offer: ${initialContext.currentOffer || 'Not specified'}\n`;
    userPrompt += `Target Audience: ${initialContext.targetAudience || 'Not specified'}\n`;
    userPrompt += `Problem Solved: ${initialContext.problemSolved || 'Not specified'}\n`;

    // Add website findings if available
    if (websiteFindings) {
      userPrompt += `\nWebsite Analysis:\n`;
      userPrompt += `Core Offer: ${websiteFindings.coreOffer || 'Not found'}\n`;
      userPrompt += `Target Audience: ${websiteFindings.targetAudience || 'Not found'}\n`;
      userPrompt += `Problem Solved: ${websiteFindings.problemSolved || 'Not found'}\n`;
      userPrompt += `Value Proposition: ${websiteFindings.valueProposition || 'Not found'}\n`;

      // Add RARA framework fields if available
      const hasImprovedAnalysis = websiteFindings.desiredResult ||
                                websiteFindings.keyAdvantage ||
                                websiteFindings.biggestBarrier ||
                                websiteFindings.assurance;

      if (hasImprovedAnalysis) {
        userPrompt += `\nR-A-R-A Framework Analysis:\n`;
        userPrompt += `Desired Result: ${websiteFindings.desiredResult || 'Not found'}\n`;
        userPrompt += `Key Advantage: ${websiteFindings.keyAdvantage || 'Not found'}\n`;
        userPrompt += `Biggest Barrier: ${websiteFindings.biggestBarrier || 'Not found'}\n`;
        userPrompt += `Assurance: ${websiteFindings.assurance || 'Not found'}\n`;
      }

      if (websiteFindings.onboardingSteps && websiteFindings.onboardingSteps.length > 0) {
        userPrompt += `\nOnboarding Steps:\n`;
        userPrompt += websiteFindings.onboardingSteps.map((step, index) =>
          `${index + 1}. ${step.description} (${step.timeEstimate})`).join('\n');
      }
    }

    // Add transcript data if available
    if (transcriptData) {
      userPrompt += `\nCustomer Call Transcript Analysis:\n`;
      userPrompt += `Target Audience: ${transcriptData.targetAudience || 'Not identified'}\n`;
      userPrompt += `Problem Solved: ${transcriptData.problemSolved || 'Not identified'}\n`;
      userPrompt += `Desired Result: ${transcriptData.desiredResult || 'Not identified'}\n`;
      userPrompt += `Key Advantage: ${transcriptData.keyAdvantage || 'Not identified'}\n`;
      userPrompt += `Biggest Barrier: ${transcriptData.biggestBarrier || 'Not identified'}\n`;
      userPrompt += `Assurance: ${transcriptData.assurance || 'Not identified'}\n`;

      if (transcriptData.keyPhrases && transcriptData.keyPhrases.length > 0) {
        userPrompt += `\nKey Customer Phrases:\n`;
        userPrompt += transcriptData.keyPhrases.map((phrase, index) =>
          `${index + 1}. "${phrase}"`).join('\n');
      }

      if (transcriptData.customerQuotes && transcriptData.customerQuotes.length > 0) {
        userPrompt += `\nNotable Customer Quotes:\n`;
        userPrompt += transcriptData.customerQuotes.map((quote, index) =>
          `${index + 1}. "${quote}"`).join('\n');
      }
    }

    // Add field-specific instructions
    if (field === 'targetAudience') {
      userPrompt += `\nBased on the product description, let's clarify who this is truly for. `;
      userPrompt += `Suggest 2-3 specific Ideal User profiles who would gain the most significant value or solve their biggest pain point. `;
      userPrompt += `Focus on their role, primary goal, or the 'job' they are trying to get done, not just demographics.`;
    }
    else if (field === 'desiredResult') {
      userPrompt += `\nNow, for the Ideal User '${hasTargetAudience || 'we identified'}', what is the single most desirable Result they achieve using this product? `;
      userPrompt += `Focus on the core transformation or ultimate benefit. `;
      userPrompt += `Suggest 2-3 distinct ways to frame this core Result statement clearly and compellingly.`;
    }
    else if (field === 'keyAdvantage') {
      userPrompt += `\nConsidering how this product helps '${hasTargetAudience || 'the target audience'}' achieve '${hasDesiredResult || 'their desired result'}', `;
      userPrompt += `what is the key Advantage or unique mechanism that makes this solution significantly better (5-10x) than alternatives? `;
      userPrompt += `Suggest 2-3 distinct potential core Advantages.`;
    }
    else if (field === 'biggestBarrier') {
      userPrompt += `\nWhat is the biggest perceived Risk or objection that might stop '${hasTargetAudience || 'the target audience'}' `;
      userPrompt += `from adopting this solution to get '${hasDesiredResult || 'their desired result'}', `;
      userPrompt += `even knowing the advantage is '${hasKeyAdvantage || 'significant'}'? `;
      userPrompt += `Suggest 1-2 primary Risks.`;
    }
    else if (field === 'assurance') {
      userPrompt += `\nTo directly counter the primary risk of '${hasBiggestBarrier || 'customer hesitation'}', `;
      userPrompt += `how can you best Assure '${hasTargetAudience || 'the target audience'}' and reverse that risk? `;
      userPrompt += `Suggest 2-3 concrete Assurance strategies or statements.`;
    }
    else if (field === 'onboardingStep') {
      userPrompt += `\nWhat are the key steps users need to take to get value from this product? `;
      userPrompt += `Suggest 2-3 clear, actionable onboarding steps with realistic time estimates.`;
    }

    userPrompt += `\n\nFor each suggestion, include a brief explanation of why it would be effective.`;

    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        functions: [
          {
            name: "provide_field_suggestions",
            description: `Provide suggestions with reasoning for the ${field} field`,
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: {
                        type: "string",
                        description: "The suggestion text that could be directly used in the offer"
                      },
                      reasoning: {
                        type: "string",
                        description: "Brief explanation of why this suggestion would be effective"
                      }
                    },
                    required: ["text", "reasoning"]
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
