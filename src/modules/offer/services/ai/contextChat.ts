import { openai, handleOpenAIRequest } from './client';
import type { ChatMessage } from '../../store/offerStore';
import type { InitialContext } from './types';
import type { TranscriptData } from './transcriptProcessor';

// Use console for logging
const log = console.log;

export interface WebsiteFindings {
  coreOffer: string | null;
  targetAudience: string | null;
  problemSolved: string | null;
  keyBenefits: string[] | null;
  valueProposition: string | null;
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
  cta: string | null;
  tone: string | null;
  missingInfo: string[] | null;
}

/**
 * Generate clarifying questions based on comparing user input with website findings
 */
export async function generateClarifyingQuestions(
  userContext: InitialContext,
  websiteFindings: WebsiteFindings | null
): Promise<string> {
  log('generateClarifyingQuestions - userContext:', userContext);
  log('generateClarifyingQuestions - websiteFindings:', websiteFindings);
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
${websiteFindings.onboardingSteps && websiteFindings.onboardingSteps.length > 0 ? `
- Onboarding Steps:
${websiteFindings.onboardingSteps.map((step, index) => `  ${index + 1}. ${step.description} (${step.timeEstimate})`).join('\n')}` : ''}
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
      log('generateClarifyingQuestions - API response:', completion);
      return completion.choices[0].message.content || "I couldn't generate clarifying questions. Let's continue with defining your offer.";
    }).catch(error => {
      log('generateClarifyingQuestions - API error:', error);
      return "I couldn't generate clarifying questions. Let's continue with defining your offer.";
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
  websiteFindings: WebsiteFindings | null,
  transcriptData?: TranscriptData | null
): Promise<string> {
  log('generateChatResponse - messages:', messages);
  log('generateChatResponse - userContext:', userContext);
  log('generateChatResponse - websiteFindings:', websiteFindings);
  log('generateChatResponse - transcriptData:', transcriptData);

  // Build the system message content
  let systemContent = `You are a ProductLed Offer Coach AI. You are helping the user refine their offer based on their manual input`;

  if (websiteFindings) systemContent += `, website analysis`;
  if (transcriptData) systemContent += `, and customer call transcript analysis`;
  systemContent += `.\n\n`;

  // Add user context
  systemContent += `User's Initial Context:\n`;
  systemContent += `- Current Offer: ${userContext.currentOffer || 'Not provided'}\n`;
  systemContent += `- Target Audience: ${userContext.targetAudience || 'Not provided'}\n`;
  systemContent += `- Problem Solved: ${userContext.problemSolved || 'Not provided'}\n\n`;

  // Add website findings if available
  if (websiteFindings) {
    systemContent += `Website Analysis Findings:\n`;
    systemContent += `- Core Offer: ${websiteFindings.coreOffer || 'Not found'}\n`;
    systemContent += `- Target Audience: ${websiteFindings.targetAudience || 'Not found'}\n`;
    systemContent += `- Problem Solved: ${websiteFindings.problemSolved || 'Not found'}\n`;
    systemContent += `- Value Proposition: ${websiteFindings.valueProposition || 'Not found'}\n`;
    systemContent += `- Key Benefits: ${websiteFindings.keyBenefits?.join(', ') || 'None found'}\n`;

    if (websiteFindings.onboardingSteps && websiteFindings.onboardingSteps.length > 0) {
      systemContent += `- Onboarding Steps:\n`;
      systemContent += websiteFindings.onboardingSteps.map((step, index) =>
        `  ${index + 1}. ${step.description} (${step.timeEstimate})`
      ).join('\n') + '\n';
    }

    systemContent += `- Missing Information: ${websiteFindings.missingInfo?.join(', ') || 'None identified'}\n\n`;
  } else {
    systemContent += `No website analysis available.\n\n`;
  }

  // Add transcript data if available
  if (transcriptData) {
    systemContent += `Customer Call Transcript Analysis:\n`;
    systemContent += `- Target Audience: ${transcriptData.targetAudience || 'Not identified'}\n`;
    systemContent += `- Problem Solved: ${transcriptData.problemSolved || 'Not identified'}\n`;
    systemContent += `- Desired Result: ${transcriptData.desiredResult || 'Not identified'}\n`;
    systemContent += `- Key Advantage: ${transcriptData.keyAdvantage || 'Not identified'}\n`;
    systemContent += `- Biggest Barrier: ${transcriptData.biggestBarrier || 'Not identified'}\n`;
    systemContent += `- Assurance: ${transcriptData.assurance || 'Not identified'}\n`;

    if (transcriptData.keyPhrases && transcriptData.keyPhrases.length > 0) {
      systemContent += `- Key Customer Phrases:\n`;
      systemContent += transcriptData.keyPhrases.map((phrase, index) =>
        `  ${index + 1}. "${phrase}"`
      ).join('\n') + '\n';
    }

    if (transcriptData.customerQuotes && transcriptData.customerQuotes.length > 0) {
      systemContent += `- Notable Customer Quotes:\n`;
      systemContent += transcriptData.customerQuotes.map((quote, index) =>
        `  ${index + 1}. "${quote}"`
      ).join('\n') + '\n';
    }

    systemContent += '\n';
  }

  // Add structured guidance based on ProductLed principles
  systemContent += `You are an expert ProductLed Offer Strategist. Your role is to help users define the core components of their offer (Target Audience, Result, Advantage, Risk, Assurance) based on ProductLed principles.\n\n`;

  systemContent += `Follow this step-by-step approach to guide the user:\n\n`;

  systemContent += `STAGE 1: TARGET AUDIENCE & RESULT\n`;
  systemContent += `- Target Audience: Who is the Ideal User that experiences the most significant transformation or solves the biggest pain with this? Think beyond demographics – what job are they trying to get done?\n`;
  systemContent += `- Result: For that ideal user, what is the single most desirable Result or outcome they achieve? Focus on the transformation or ultimate benefit, not just features.\n\n`;

  systemContent += `STAGE 2: ADVANTAGE\n`;
  systemContent += `- Advantage: What is your key Advantage or unique mechanism? Why are you 5-10x better? Consider speed, ease, cost, unique tech/method, better support, eliminating specific pains.\n\n`;

  systemContent += `STAGE 3: RISK & ASSURANCE\n`;
  systemContent += `- Risk: What's the most likely #1 perceived Risk or objection for your audience? Why wouldn't they sign up?\n`;
  systemContent += `- Assurance: Based on that likely risk, what are distinct ways to Assure the user or reverse the risk?\n\n`;

  systemContent += `For each component, suggest 2-3 specific options based on the user's product/service and available context. Present these as clear, actionable suggestions the user can select or refine.\n\n`;

  systemContent += `Be conversational, supportive, and specific in your advice. Act as a brainstorming partner and guide. Ask clarifying questions if the user's input is vague. Your goal is to provide insightful suggestions that empower the user to articulate their own compelling offer components.`;

  const systemMessage = {
    role: "system" as const,
    content: systemContent
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
      log('generateChatResponse - API response:', completion);
      return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response. Let's continue with defining your offer.";
    }).catch(error => {
      log('generateChatResponse - API error:', error);
      return "I'm sorry, I couldn't generate a response. Let's continue with defining your offer.";
    }),
    'generating chat response'
  );
}
