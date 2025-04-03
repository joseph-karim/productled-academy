import { openai, handleOpenAIRequest } from './client';
import type { OfferAnalysisInput, OfferAnalysisResult, ScorecardItem } from './types';

export async function analyzeOffer(inputData: OfferAnalysisInput): Promise<OfferAnalysisResult> {
  // Validate required fields
  if (!inputData.title || !inputData.userSuccess.statement || !inputData.heroSection.tagline) {
    throw new Error('Missing required fields for offer analysis');
  }

  // Format advantages
  const formattedAdvantages = inputData.advantages.map(adv => 
    `- ${adv.text}${adv.description ? ` (${adv.description})` : ''}`
  ).join('\n');

  // Format risks and assurances
  const risksWithAssurances = inputData.risks.map(risk => {
    const relatedAssurances = inputData.assurances
      .filter(a => a.riskId === risk.id)
      .map(a => `  * Assurance: ${a.text}`)
      .join('\n');
    
    return `- Risk: ${risk.text}\n${relatedAssurances}`;
  }).join('\n');

  // Format solution steps
  const formattedSolutionSteps = inputData.solutionSection.steps.map(step => 
    `- ${step.title}: ${step.description}`
  ).join('\n');

  // Format features
  const formattedFeatures = inputData.featuresSection.features.map(feature => 
    `- ${feature.title}: ${feature.description}`
  ).join('\n');

  // Format social proof
  const formattedSocialProof = [
    ...inputData.socialProof.testimonials.map(t => `- Testimonial: ${t}`),
    ...inputData.socialProof.caseStudies.map(c => `- Case Study: ${c}`),
    ...inputData.socialProof.numbers.map(n => `- Social Proof Metric: ${n}`)
  ].join('\n');

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product marketing, sales, and offer optimization. You will analyze the provided offer details and provide a comprehensive assessment with actionable feedback.

Your analysis should evaluate:
1. Overall offer effectiveness and compelling nature
2. Clarity of value proposition and user success
3. Strength of risk mitigation strategies
4. Landing page effectiveness (hero, features, problem, solution sections)
5. Social proof integration and credibility
6. Call-to-action effectiveness

Provide your analysis in a specific format:
1. A scorecard (9 items) rating different aspects as Poor, Fair, Good, or Excellent with justification
2. Detailed feedback highlighting strengths and areas for improvement (formatted as markdown)
3. A list of specific next steps the user can take to improve their offer (5-10 actionable items)`
        },
        {
          role: "user",
          content: `
# Offer Analysis Request

## Offer Details
Title: ${inputData.title}

## User Success
Success Statement: ${inputData.userSuccess.statement}

## Top Results
- Tangible: ${inputData.topResults.tangible}
- Intangible: ${inputData.topResults.intangible}
- Improvement: ${inputData.topResults.improvement}

## Advantages
${formattedAdvantages || "No advantages provided"}

## Risks and Assurances
${risksWithAssurances || "No risks provided"}

## Hero Section
- Tagline: ${inputData.heroSection.tagline}
- Sub Copy: ${inputData.heroSection.subCopy}
- CTA Text: ${inputData.heroSection.ctaText}
${inputData.heroSection.visualDesc ? `- Visual Description: ${inputData.heroSection.visualDesc}` : ''}
${inputData.heroSection.socialProofExample ? `- Social Proof Example: ${inputData.heroSection.socialProofExample}` : ''}

## Features Section
- Title: ${inputData.featuresSection.title}
- Description: ${inputData.featuresSection.description}
- Features:
${formattedFeatures || "No features provided"}

## Problem Section
- Alternatives Problems: ${inputData.problemSection.alternativesProblems}
- Underlying Problem: ${inputData.problemSection.underlyingProblem}

## Solution Section
- Steps:
${formattedSolutionSteps || "No solution steps provided"}

## Social Proof
${formattedSocialProof || "No social proof provided"}

## CTA Section
- Main CTA Text: ${inputData.ctaSection.mainCtaText}
${inputData.ctaSection.surroundingCopy ? `- Surrounding Copy: ${inputData.ctaSection.surroundingCopy}` : ''}

Please analyze this offer and provide a comprehensive assessment with actionable feedback.`
        }
      ],
      functions: [
        {
          name: "provide_offer_analysis",
          description: "Provide structured analysis of the offer with scorecard, feedback and next steps",
          parameters: {
            type: "object",
            properties: {
              scorecard: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    rating: { type: "string", enum: ["Poor", "Fair", "Good", "Excellent"] },
                    justification: { type: "string" }
                  },
                  required: ["item", "rating", "justification"]
                }
              },
              feedback: {
                type: "string",
                description: "Detailed feedback in markdown format with strengths and areas for improvement"
              },
              nextSteps: {
                type: "array",
                items: { type: "string" },
                description: "List of specific actionable next steps to improve the offer"
              }
            },
            required: ["scorecard", "feedback", "nextSteps"]
          }
        }
      ],
      function_call: { name: "provide_offer_analysis" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No analysis received");
      return JSON.parse(result);
    }),
    'analyzing offer'
  );
} 