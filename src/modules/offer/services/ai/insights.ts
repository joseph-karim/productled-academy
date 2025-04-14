import { openai, handleOpenAIRequest } from './client';
import type { InsightCategory, InsightResult } from '../../components/insights/types';
import type { CoreOfferNucleus } from '../../store/offerStore';

/**
 * Generates alternative options for a specific insight category
 */
export async function generateInsightOptions(
  category: InsightCategory,
  currentValue: string,
  offerContext: {
    targetAudience?: string;
    desiredResult?: string;
    keyAdvantage?: string;
    biggestBarrier?: string;
  }
): Promise<string[]> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create compelling product offers. 
          Generate alternative options for the ${category} category based on the current value and offer context.
          Provide options that are specific, compelling, and aligned with the offer context.`
        },
        {
          role: "user",
          content: `
          I need alternative options for the "${category}" category of my product offer.
          
          Current value: "${currentValue}"
          
          Offer context:
          - Target Audience: ${offerContext.targetAudience || 'Not specified'}
          - Desired Result: ${offerContext.desiredResult || 'Not specified'}
          - Key Advantage: ${offerContext.keyAdvantage || 'Not specified'}
          - Biggest Barrier: ${offerContext.biggestBarrier || 'Not specified'}
          
          Generate 2 alternative options that are specific, compelling, and aligned with my offer context.
          Return only the options as plain text, one per line.
          `
        }
      ]
    }).then(response => {
      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0);
    }),
    'generating insight options'
  );
}

/**
 * Processes user feedback on insight options and generates a follow-up question
 */
export async function processInsightFeedback(
  category: InsightCategory,
  selectedOption: string,
  feedback: Record<string, 'positive' | 'negative' | null>
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create compelling product offers.
          Based on user feedback on options for the ${category} category, generate a follow-up question
          to gather more information and refine the offer.`
        },
        {
          role: "user",
          content: `
          I've selected this option for the "${category}" category:
          "${selectedOption}"
          
          My feedback on the options:
          ${Object.entries(feedback)
            .map(([id, value]) => `- Option ${id}: ${value || 'No feedback'}`)
            .join('\n')}
          
          Generate a follow-up question to help refine this aspect of my offer.
          The question should be specific, actionable, and help me improve this part of my offer.
          Return only the question as plain text.
          `
        }
      ]
    }).then(response => {
      return response.choices[0].message.content || 'How could you make this more specific to your target audience?';
    }),
    'generating follow-up question'
  );
}

/**
 * Processes the user's answer to a follow-up question and provides a recommendation
 */
export async function processFollowUpAnswer(
  category: InsightCategory,
  selectedOption: string,
  followUpQuestion: string,
  followUpAnswer: string
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create compelling product offers.
          Based on the user's answer to a follow-up question, provide a recommendation
          to improve their offer.`
        },
        {
          role: "user",
          content: `
          For the "${category}" category, I selected:
          "${selectedOption}"
          
          You asked: "${followUpQuestion}"
          
          My answer: "${followUpAnswer}"
          
          Provide a brief recommendation (1-2 sentences) on how to improve this aspect of my offer
          based on my answer. Be specific and actionable.
          `
        }
      ]
    }).then(response => {
      return response.choices[0].message.content || '';
    }),
    'processing follow-up answer'
  );
}

/**
 * Generates a summary of all insights and recommendations
 */
export async function generateInsightsSummary(
  results: Record<InsightCategory, InsightResult | null>,
  offerNucleus: CoreOfferNucleus
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create compelling product offers.
          Generate a summary of insights and recommendations based on the user's selections
          and feedback across all categories.`
        },
        {
          role: "user",
          content: `
          Here's my current offer nucleus:
          - Target Audience: ${offerNucleus.targetAudience}
          - Desired Result: ${offerNucleus.desiredResult}
          - Key Advantage: ${offerNucleus.keyAdvantage}
          - Biggest Barrier: ${offerNucleus.biggestBarrier}
          - Assurance: ${offerNucleus.assurance}
          
          And here are my insights selections:
          ${Object.entries(results)
            .filter(([_, result]) => result !== null)
            .map(([category, result]) => {
              if (!result) return '';
              return `
              Category: ${category}
              Selected: ${result.selectedOption}
              Follow-up Q: ${result.followUpAnswer || 'Not provided'}
              `;
            })
            .join('\n')}
          
          Generate a concise summary (3-5 bullet points) of insights and recommendations
          to improve my offer based on this information. Focus on actionable advice.
          `
        }
      ]
    }).then(response => {
      return response.choices[0].message.content || '';
    }),
    'generating insights summary'
  );
}
