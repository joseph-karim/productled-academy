import { openai, handleOpenAIRequest } from './client';
import { CoreOfferNucleus, Exclusivity, Bonus, OnboardingStep } from '../../store/offerStore';

interface LandingPageContent {
  hero: {
    headline: string;
    body: string;
    cta: string;
    visualDescription?: string;
  };
  problem: {
    alternativesProblems: string;
    underlyingProblem: string;
  };
  solution: {
    headline: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  riskReversal: {
    objection: string;
    assurance: string;
  };
  cta: {
    buttonText: string;
    surroundingCopy: string;
  };
}

/**
 * Generate a complete landing page based on the core offer and enhancers
 */
export async function generateLandingPage(
  coreOffer: CoreOfferNucleus,
  exclusivity: Exclusivity,
  bonuses: Bonus[],
  onboardingSteps: OnboardingStep[] = []
): Promise<LandingPageContent> {
  // Construct the product-specific research context
  const productContext = `
Product specific research Strategy Context:

- Product: ${coreOffer.productName || 'Your product'}

- Target Audience: ${coreOffer.targetAudience}

- Desired Result: ${coreOffer.desiredResult}

- Unique Advantage: ${coreOffer.keyAdvantage}

- Number 1 barrier: ${coreOffer.biggestBarrier}

- How it overcomes that barrier: ${coreOffer.assurance}

${onboardingSteps.length > 0 ? `- Value path (steps provided to get to value):
${onboardingSteps.map((step, index) => `  ${index + 1}. ${step.description} (${step.timeEstimate})`).join('\n')}` : ''}

${exclusivity.hasLimit ? `- Scarcity: Limited to ${exclusivity.capacityLimit} because ${exclusivity.validReason}` : ''}

${bonuses.length > 0 ? `- Enhancers:
${bonuses.map(bonus => `  - ${bonus.name}: ${bonus.benefit}`).join('\n')}` : ''}
`;

  // The comprehensive landing page prompt
  const landingPagePrompt = `
I've done extensive research on landing page best practices and created a comprehensive guide, which I'll share with you below. Using this research and the following strategy outline, please build the most effective possible landing page, and added product specific research to apply this to.

${productContext}

{Landing page Research Doc:}

Building a High-Converting B2B SaaS Landing Page: A Comprehensive Tactical Guide
Executive Summary
This guide provides a step-by-step blueprint for designing a high-converting landing page tailored to B2B SaaS products. We'll cover core principles (like focusing on one conversion goal and a clear value proposition), break down each page section, and share copywriting formulas (PAS, AIDA, 4U) that boost conversion rates. You'll learn how to apply conversion psychology for qualified B2B leads – addressing their pains, establishing trust, and emphasizing ROI – all backed by insights from industry experts (Joanna Wiebe, Oli Gardner, Peep Laja) and best practices from top SaaS companies (Slack, Zoom, HubSpot). We also dive into visual and mobile-responsive design, CTA optimization, social proof elements, form design, A/B testing, and even provide an annotated wireframe template for quick implementation. By following this guide's actionable tactics and examples, you can craft a landing page that turns B2B visitors into valuable leads and customers.

[...abbreviated for brevity...]

Please create a complete, detailed landing page structure with:

All section headings and subheadings
Complete copy for each section (not placeholder text)
Clear descriptions of visual elements
CTA text and placement
Implementation notes for best practices
Focus on creating compelling, concise copy that drives action. Make it skimmable, benefit-focused, and emotionally resonant.

The landing page structure will follow this format:

Hero Section
Problem Section
Solution Section
Risk Reversal
Final CTA Section
`;

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert ProductLed Copywriter, specializing in creating high-converting landing pages for Product-Led Growth companies. Your goal is to generate concise, compelling, and customer-centric copy points based on the provided Core Offer details and the ProductLed Landing Page Outline framework.

Follow these principles:
- Focus relentlessly on the customer's desired **Result** and "Aha moment."
- Clearly articulate the unique **Advantage** and how the **Solution** delivers the result better than alternatives.
- Directly address the customer's **Problem** and pain points, showing empathy ("get them").
- Counter the main **Risk/Objection** with a clear **Assurance/Risk Reversal**.
- Ensure all copy is benefit-driven, clear, and concise.
- Use strong verbs and active voice.
- Output should be structured clearly, providing distinct copy points suitable for direct use or easy editing for each specified landing page section.`
        },
        {
          role: "user",
          content: landingPagePrompt
        }
      ],
      functions: [
        {
          name: "generate_landing_page",
          description: "Generate a complete landing page with all required sections",
          parameters: {
            type: "object",
            properties: {
              hero: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Primary headline for the hero section (concise, impactful, focused on Result)"
                  },
                  body: {
                    type: "string",
                    description: "Supporting subheadline that expands on the value proposition"
                  },
                  cta: {
                    type: "string",
                    description: "Call-to-action button text"
                  },
                  visualDescription: {
                    type: "string",
                    description: "Description of the ideal hero image or visual element"
                  }
                },
                required: ["headline", "body", "cta"]
              },
              problem: {
                type: "object",
                properties: {
                  alternativesProblems: {
                    type: "string",
                    description: "Description of problems with alternative solutions"
                  },
                  underlyingProblem: {
                    type: "string",
                    description: "Description of the deeper underlying problem or pain point"
                  }
                },
                required: ["alternativesProblems", "underlyingProblem"]
              },
              solution: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Headline for the solution section"
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "Title of the solution step"
                        },
                        description: {
                          type: "string",
                          description: "Description of the solution step"
                        }
                      },
                      required: ["title", "description"]
                    },
                    description: "3-5 steps that explain how the solution works"
                  }
                },
                required: ["headline", "steps"]
              },
              riskReversal: {
                type: "object",
                properties: {
                  objection: {
                    type: "string",
                    description: "The main objection or risk that might prevent conversion"
                  },
                  assurance: {
                    type: "string",
                    description: "The assurance or guarantee that addresses the objection"
                  }
                },
                required: ["objection", "assurance"]
              },
              cta: {
                type: "object",
                properties: {
                  buttonText: {
                    type: "string",
                    description: "Final call-to-action button text"
                  },
                  surroundingCopy: {
                    type: "string",
                    description: "Copy surrounding the CTA button that reinforces the value proposition"
                  }
                },
                required: ["buttonText", "surroundingCopy"]
              }
            },
            required: ["hero", "problem", "solution", "riskReversal", "cta"]
          }
        }
      ],
      function_call: { name: "generate_landing_page" },
      temperature: 0.7,
      max_tokens: 2000
    })
  ).then(response => {
    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "generate_landing_page") {
      return JSON.parse(functionCall.arguments) as LandingPageContent;
    }
    throw new Error("Failed to generate landing page content");
  });
}
