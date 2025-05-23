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

  // Step 1: Generate the scorecard
  const scorecard = await handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating a user's draft offer based on the ProductLed Irresistible Offer checklist. Analyze the provided inputs and assign ratings.`
        },
        {
          role: "user",
          content: `
You are evaluating a user's draft offer based on the ProductLed Irresistible Offer checklist. Analyze the following inputs:
- User Success: '${inputData.userSuccess.statement}'
- Top Results: Tangible: '${inputData.topResults.tangible}', Intangible: '${inputData.topResults.intangible}', Improvement: '${inputData.topResults.improvement}'
- Advantages: 
${formattedAdvantages}
- Risks and Assurances: 
${risksWithAssurances}
- Hero Section: 
  Tagline: '${inputData.heroSection.tagline}'
  Sub-copy: '${inputData.heroSection.subCopy}'
  CTA Text: '${inputData.heroSection.ctaText}'
- Problem Section:
  Alternatives Problems: '${inputData.problemSection.alternativesProblems}'
  Underlying Problem: '${inputData.problemSection.underlyingProblem}'
- Solution Section:
  Steps: 
${formattedSolutionSteps}
- Social Proof: 
${formattedSocialProof || "No social proof provided"}
- CTA Section:
  Main CTA Text: '${inputData.ctaSection.mainCtaText}'
  ${inputData.ctaSection.surroundingCopy ? `Surrounding Copy: '${inputData.ctaSection.surroundingCopy}'` : ''}

For each checklist item below, evaluate how well the inputs meet the criteria and assign ONE rating (Poor, Fair, Good, Excellent). Provide a brief justification (1 concise sentence) for each rating.

Checklist Items:
1. Result clarity?
2. Advantage/differentiation clarity?
3. Risk reduction/assurance clarity & sufficiency?
4. Hero section communication effectiveness?
5. Problem section resonance?
6. Solution section clarity?
7. Social proof compelling & authentic?
8. Call to action clarity and effectiveness?
9. Visual design likely to amplify message? (Evaluate based on content structure/clarity if visuals unknown)

Output ONLY a valid JSON array of objects. Do not include any other text before or after.`
        }
      ],
      functions: [
        {
          name: "provide_analysis_scorecard",
          description: "Provide structured analysis scorecard for the offer",
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
              }
            },
            required: ["scorecard"]
          }
        }
      ],
      function_call: { name: "provide_analysis_scorecard" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No scorecard received");
      return JSON.parse(result).scorecard;
    }),
    'generating offer scorecard'
  );
  
  // Step 2: Generate feedback & next steps
  const feedbackAndNextSteps = await handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed coach AI. Based on user inputs for an offer and the scorecard, provide actionable feedback and next steps.`
        },
        {
          role: "user",
          content: `
You are a ProductLed coach AI. Based ONLY on the user inputs previously provided and the scorecard ratings, perform the following:

User Inputs:
- User Success: '${inputData.userSuccess.statement}'
- Top Results: Tangible: '${inputData.topResults.tangible}', Intangible: '${inputData.topResults.intangible}', Improvement: '${inputData.topResults.improvement}'
- Advantages: 
${formattedAdvantages}
- Risks and Assurances: 
${risksWithAssurances}
- Hero Section: 
  Tagline: '${inputData.heroSection.tagline}'
  Sub-copy: '${inputData.heroSection.subCopy}'
  CTA Text: '${inputData.heroSection.ctaText}'
- Problem Section:
  Alternatives Problems: '${inputData.problemSection.alternativesProblems}'
  Underlying Problem: '${inputData.problemSection.underlyingProblem}'
- Solution Section:
  Steps: 
${formattedSolutionSteps}
- Social Proof: 
${formattedSocialProof || "No social proof provided"}
- CTA Section:
  Main CTA Text: '${inputData.ctaSection.mainCtaText}'
  ${inputData.ctaSection.surroundingCopy ? `Surrounding Copy: '${inputData.ctaSection.surroundingCopy}'` : ''}

Scorecard:
${JSON.stringify(scorecard)}

1. **Overall Feedback:** Write 2-3 bullet points summarizing key strengths of the defined offer components. Write 2-3 bullet points summarizing key areas needing improvement or refinement. Be constructive.

2. **Suggested Next Steps:** Generate a list of 3-5 concrete, actionable next steps the user should take in the next 1-2 weeks to validate or refine this offer concept further. Focus on actions like testing specific messages, conducting targeted customer interviews, or creating minimal assets for testing.

Output this feedback and the next steps list using Markdown formatting. Start with "### Key Strengths" followed by "### Areas for Improvement" and "### Suggested Next Steps".`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || '';
    }),
    'generating offer feedback and next steps'
  );

  // Return the combined analysis
  return {
    scorecard,
    feedback: feedbackAndNextSteps,
    nextSteps: extractNextSteps(feedbackAndNextSteps)
  };
}

/**
 * Helper function to extract next steps from the feedback markdown
 */
function extractNextSteps(feedbackMarkdown: string): string[] {
  const nextStepsSection = feedbackMarkdown.split('### Suggested Next Steps')[1];
  if (!nextStepsSection) return [];
  
  // Extract bullet points following the heading
  const bulletPoints = nextStepsSection.match(/[-*]\s+(.+?)(?=\n[-*]|\n\n|$)/g) || [];
  return bulletPoints.map(bullet => bullet.replace(/^[-*]\s+/, '').trim());
}

/**
 * Analyze initial context to provide preliminary rating and feedback
 */
export async function analyzeInitialContext(
  websiteUrl: string,
  initialContext: {
    currentOffer: string;
    targetAudience: string;
    problemSolved: string;
  },
  websiteScrapingData?: {
    coreOffer: string;
    targetAudience: string;
    keyProblem: string;
    valueProposition: string;
    keyFeatures: string[];
  }
): Promise<{
  rating: number;
  feedback: string;
  suggestions: string[];
}> {
  try {
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a ProductLed Offer Coach. You analyze initial context about a product/service to provide an initial rating and feedback to help improve their offer.`
          },
          {
            role: "user",
            content: `
Analyze the following initial context about a product/service:

Website URL: ${websiteUrl || 'Not provided'}
Current Offer/Product: ${initialContext.currentOffer || 'Not specified'}
Target Audience: ${initialContext.targetAudience || 'Not specified'}
Problem Solved: ${initialContext.problemSolved || 'Not specified'}

${websiteScrapingData ? `
We've also analyzed their website and found:
Core Offer/Product: ${websiteScrapingData.coreOffer || 'Not found'}
Target Audience: ${websiteScrapingData.targetAudience || 'Not found'}
Key Problem: ${websiteScrapingData.keyProblem || 'Not found'}
Value Proposition: ${websiteScrapingData.valueProposition || 'Not found'}
Key Features/Benefits: 
${websiteScrapingData.keyFeatures?.map(feature => `- ${feature}`).join('\n') || 'None found'}
` : ''}

Based on this ${websiteScrapingData ? 'combined' : 'limited'} information, provide:
1. A preliminary rating (1-5) of their current offer
2. Brief, constructive feedback about what you can see from this context
3. Three specific suggestions to help them improve their offer as they continue building it`
          }
        ],
        functions: [
          {
            name: "provide_initial_analysis",
            description: "Provide initial analysis of the offer context",
            parameters: {
              type: "object",
              properties: {
                rating: {
                  type: "number",
                  description: "Rating from 1-5, where 1 is very poor and 5 is excellent"
                },
                feedback: {
                  type: "string",
                  description: "Brief, constructive feedback based on the context provided"
                },
                suggestions: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Specific suggestions to help improve the offer"
                }
              },
              required: ["rating", "feedback", "suggestions"]
            }
          }
        ],
        function_call: { name: "provide_initial_analysis" }
      }).then(completion => {
        const result = completion.choices[0].message.function_call?.arguments;
        if (!result) throw new Error("Failed to analyze initial context");
        
        return JSON.parse(result);
      }),
      'analyzing initial context'
    );
  } catch (error) {
    console.error("Error analyzing initial context:", error);
    return {
      rating: 3,
      feedback: "We couldn't analyze your context at this time. Please continue building your offer.",
      suggestions: [
        "Make sure your offer clearly communicates the main benefit",
        "Ensure your target audience is well-defined",
        "Highlight how you solve the problem better than alternatives"
      ]
    };
  }
}
