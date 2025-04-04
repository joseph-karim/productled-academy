import { openai, handleOpenAIRequest } from './client';
import type { ChatMessage } from '../../store/offerStore';
import type { InitialContext } from './types';

export interface WebsiteFindings {
  coreOffer: string | null;
  targetAudience: string | null;
  problemSolved: string | null;
  keyBenefits: string[] | Array<{
    benefit: string;
    problemRelation?: string;
    metrics?: string;
    isUnique?: boolean;
  }> | null;
  valueProposition: string | null;
  cta: string | {
    primary: string;
    secondary?: string[];
    action?: string;
    urgency?: string;
  } | null;
  tone: string | {
    overall: string;
    socialProof?: string;
    emotionalAppeals?: string;
    technicalLevel?: string;
    storytelling?: boolean;
  } | null;
  missingInfo: string[] | null;
  keyPhrases?: string[] | null;
  competitiveAdvantages?: string[] | null;
}

/**
 * Generate clarifying questions based on comparing user input with website findings
 */
export async function generateClarifyingQuestions(
  userContext: InitialContext,
  websiteFindings: WebsiteFindings | null
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Offer Coach AI. The user has provided initial answers about their offer and we have also analyzed their current website.
          
Your goal is to help the user clarify their offer and bridge any gaps between their stated goals and their website's current presentation.`
        },
        {
          role: "user",
          content: `
User's Answers:
- Current Offer: ${userContext.currentOffer || 'Not provided'}
- Target Audience: ${userContext.targetAudience || 'Not provided'}
- Problem Solved: ${userContext.problemSolved || 'Not provided'}

Website Analysis Findings:
${websiteFindings ? `
- Core Offer: ${websiteFindings.coreOffer || 'Not found'}
- Target Audience: ${websiteFindings.targetAudience || 'Not found'}
- Problem Solved: ${websiteFindings.problemSolved || 'Not found'}
- Value Proposition: ${websiteFindings.valueProposition || 'Not found'}
- Key Benefits: ${websiteFindings.keyBenefits?.join(', ') || 'None found'}
- Missing Information: ${websiteFindings.missingInfo?.join(', ') || 'None identified'}
` : 'No website analysis available.'}

Based on the comparison above:
1. Briefly acknowledge the website analysis if available.
2. Identify 1-2 key areas of potential discrepancy, missing information, or points needing clarification revealed by comparing the user's answers and the website analysis. Prioritize clarifications that will help define the Core Offer in the next steps.
3. Ask 2-3 specific, open-ended questions to prompt the user for more detail on these areas. Frame the questions constructively.

Example areas to look for:
- Mismatch between stated audience/problem and website tone/benefits.
- Value proposition difference.
- Missing key benefits mentioned by the user on the site.
- Unclear connection between features/benefits and the core problem.

Start the conversation now.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "I couldn't generate clarifying questions. Let's continue with defining your offer.";
    }),
    'generating clarifying questions'
  );
}

/**
 * Generate AI response to user message
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  userContext: InitialContext,
  websiteFindings: WebsiteFindings | null
): Promise<string> {
  const systemMessage = {
    role: "system" as const,
    content: `You are a ProductLed Offer Coach AI. You are helping the user refine their offer based on their manual input and website analysis.
          
User's Initial Context:
- Current Offer: ${userContext.currentOffer || 'Not provided'}
- Target Audience: ${userContext.targetAudience || 'Not provided'}
- Problem Solved: ${userContext.problemSolved || 'Not provided'}

${websiteFindings ? `Website Analysis Findings:
- Core Offer: ${websiteFindings.coreOffer || 'Not found'}
- Target Audience: ${websiteFindings.targetAudience || 'Not found'}
- Problem Solved: ${websiteFindings.problemSolved || 'Not found'}
- Value Proposition: ${websiteFindings.valueProposition || 'Not found'}
- Key Benefits: ${websiteFindings.keyBenefits?.join(', ') || 'None found'}
- Missing Information: ${websiteFindings.missingInfo?.join(', ') || 'None identified'}
` : 'No website analysis available.'}

Your goal is to help the user refine their offer by:
1. Identifying strengths and weaknesses in their current offer
2. Suggesting specific improvements to make the offer more compelling
3. Helping them clarify their value proposition and target audience
4. Providing actionable advice they can implement immediately

Be conversational, supportive, and specific in your advice. Focus on helping them create an irresistible offer that converts.`
  };
  
  const formattedMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : msg.sender === 'ai' ? 'assistant' as const : 'system' as const,
    content: msg.content
  }));
  
  const apiMessages = [systemMessage, ...formattedMessages];
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages
    }).then(completion => {
      return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response. Let's continue with defining your offer.";
    }),
    'generating chat response'
  );
}
