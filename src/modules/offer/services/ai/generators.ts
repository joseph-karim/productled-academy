import { openai, handleOpenAIRequest } from './client';

/**
 * Generate hero section content based on user success and advantages
 */
export async function generateHeroSection(
  userSuccessStatement: string,
  advantages: { id: string; text: string; description?: string }[]
): Promise<{
  tagline: string;
  subCopy: string;
  ctaText: string;
  visualDesc: string;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter specializing in landing page hero sections for the ProductLed System™. Your feedback should align with principles of creating irresistible, product-led offers.`
        },
        {
          role: "user",
          content: `
Generate a compelling hero section based on this information:

User Success Statement:
${userSuccessStatement}

Key Advantages:
${advantages.map(adv => `- ${adv.text}${adv.description ? ` (${adv.description})` : ''}`).join('\n')}

Generate:
1. A punchy, attention-grabbing headline/tagline (under 10 words)
2. A supporting subheadline that explains the value proposition (1-2 sentences)
3. A call-to-action button text (3-5 words)
4. A description of what visual would best support this hero section`
        }
      ],
      functions: [
        {
          name: "generate_hero_section",
          description: "Generate hero section content",
          parameters: {
            type: "object",
            properties: {
              tagline: {
                type: "string",
                description: "The main headline/tagline for the hero section (under 10 words)"
              },
              subCopy: {
                type: "string",
                description: "Supporting subheadline explaining the value proposition (1-2 sentences)"
              },
              ctaText: {
                type: "string",
                description: "Call-to-action button text (3-5 words)"
              },
              visualDesc: {
                type: "string",
                description: "Description of what visual would best support this hero section"
              }
            },
            required: ["tagline", "subCopy", "ctaText", "visualDesc"]
          }
        }
      ],
      function_call: { name: "generate_hero_section" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("Failed to generate hero section content");
      return JSON.parse(result);
    }),
    'generating hero section'
  );
}

/**
 * Generate features based on advantages and top results
 */
export async function generateFeatures(
  advantages: { id: string; text: string; description?: string }[],
  topResults: { tangible: string; intangible: string; improvement: string }
): Promise<{
  title: string;
  description: string;
  features: { id: string; title: string; description: string }[];
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product marketing and feature communication for the ProductLed System™. You'll help convert product advantages and results into compelling feature descriptions.`
        },
        {
          role: "user",
          content: `
Generate a features section based on these advantages and results:

Key Advantages:
${advantages.map(adv => `- ${adv.text}${adv.description ? ` (${adv.description})` : ''}`).join('\n')}

Top Results:
- Tangible: ${topResults.tangible}
- Intangible: ${topResults.intangible}
- Improvement: ${topResults.improvement}

Generate:
1. A compelling section title
2. A brief section description (1-2 sentences)
3. 4-6 feature cards, each with a title and description`
        }
      ],
      functions: [
        {
          name: "generate_features",
          description: "Generate features section content",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title for the features section"
              },
              description: {
                type: "string",
                description: "Brief description for the features section (1-2 sentences)"
              },
              features: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique ID for the feature"
                    },
                    title: {
                      type: "string",
                      description: "Feature title (2-5 words)"
                    },
                    description: {
                      type: "string",
                      description: "Feature description (1-2 sentences)"
                    }
                  },
                  required: ["id", "title", "description"]
                }
              }
            },
            required: ["title", "description", "features"]
          }
        }
      ],
      function_call: { name: "generate_features" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("Failed to generate features content");
      const parsed = JSON.parse(result);
      
      // Ensure each feature has a unique ID
      parsed.features = parsed.features.map((feature: any, index: number) => ({
        ...feature,
        id: `feature-${Date.now()}-${index}`
      }));
      
      return parsed;
    }),
    'generating features'
  );
}

/**
 * Generate problem section content based on user success
 */
export async function generateProblemSection(userSuccessStatement: string): Promise<{
  alternativesProblems: string;
  underlyingProblem: string;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Customer Empathy Analyst. You'll help articulate the problems that a product solves in a way that resonates with users. Focus on creating problem statements that build rapport and agitate the pain.`
        },
        {
          role: "user",
          content: `
Generate a compelling problem section based on this user success statement:

User Success Statement:
${userSuccessStatement}

Generate:
1. A description of problems with current alternatives (what's wrong with the status quo) - 2-3 sentences
2. A description of the underlying problem (the deeper issue that makes this worth solving) - 2-3 sentences

Focus on:
- Resonance: Ensure the problem resonates deeply with target users
- Clarity & Specificity: Articulate the pain clearly and specifically
- Connection: Set up the need for the user's unique solution`
        }
      ],
      functions: [
        {
          name: "generate_problem_section",
          description: "Generate problem section content",
          parameters: {
            type: "object",
            properties: {
              alternativesProblems: {
                type: "string",
                description: "Description of problems with current alternatives (2-3 sentences)"
              },
              underlyingProblem: {
                type: "string",
                description: "Description of the underlying problem (2-3 sentences)"
              }
            },
            required: ["alternativesProblems", "underlyingProblem"]
          }
        }
      ],
      function_call: { name: "generate_problem_section" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("Failed to generate problem section content");
      return JSON.parse(result);
    }),
    'generating problem section'
  );
}

/**
 * Generate testimonial based on user success and results
 */
export async function generateTestimonial(
  userSuccessStatement: string,
  topResults: { tangible: string; intangible: string; improvement: string }
): Promise<{
  testimonial: string;
  author: string;
  company: string;
  role: string;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in creating realistic and compelling customer testimonials for the ProductLed System™. Create a testimonial that sounds authentic, specific, and highlights concrete results.`
        },
        {
          role: "user",
          content: `
Generate a realistic and compelling testimonial based on:

User Success Statement:
${userSuccessStatement}

Top Results:
- Tangible: ${topResults.tangible}
- Intangible: ${topResults.intangible}
- Improvement: ${topResults.improvement}

Generate:
1. A realistic testimonial quote (3-5 sentences) that mentions specific results
2. A fictional but realistic author name
3. A company name
4. A job title/role`
        }
      ],
      functions: [
        {
          name: "generate_testimonial",
          description: "Generate a testimonial",
          parameters: {
            type: "object",
            properties: {
              testimonial: {
                type: "string",
                description: "The testimonial quote (3-5 sentences)"
              },
              author: {
                type: "string",
                description: "The fictional author's name"
              },
              company: {
                type: "string",
                description: "The company name"
              },
              role: {
                type: "string",
                description: "The author's job title/role"
              }
            },
            required: ["testimonial", "author", "company", "role"]
          }
        }
      ],
      function_call: { name: "generate_testimonial" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("Failed to generate testimonial");
      return JSON.parse(result);
    }),
    'generating testimonial'
  );
}

/**
 * Analyze results based on ProductLed principles
 */
export async function analyzeResults(
  userSuccessStatement: string,
  results: { tangible: string; intangible: string; improvement: string }
): Promise<string> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Offer Coach. You provide concise, actionable feedback on offer results.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Offer Coach. The user is defining the top 3 results for their offer, which aims to achieve '${userSuccessStatement}'.

Their current results are:
- Tangible: '${results.tangible}'
- Intangible: '${results.intangible}'
- Improvement Metric: '${results.improvement}'

Analyze these results based on ProductLed principles:
1. **Clarity & Specificity:** Are they clear, specific, and easily understood?
2. **Impact:** Do they represent significant value or progress for the target user?
3. **Alignment:** Do they logically contribute to the overall User Success Statement?
4. **Distinctness:** Are the three types of results clearly different from each other?

Provide concise, actionable feedback as a bulleted list (max 3-4 points), suggesting specific refinements if necessary. Focus on making the results more compelling and believable.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing results'
  );
}

/**
 * Analyze advantages based on ProductLed principles
 */
export async function analyzeAdvantages(
  userSuccessStatement: string,
  results: { tangible: string; intangible: string; improvement: string },
  advantages: { id: string; text: string; description?: string }[]
): Promise<string> {
  const formattedAdvantages = advantages.map((adv, idx) => 
    `${idx + 1}. '${adv.text}${adv.description ? ` (${adv.description})` : ''}'`
  ).join('\n');
  
  const topResultsSummary = `${results.tangible}, ${results.intangible}, and ${results.improvement}`;
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Competitive Analyst. You provide concise, actionable feedback on offer advantages.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Competitive Analyst. The user is defining the top advantages for their offer, which aims for '${userSuccessStatement}' and delivers results like '${topResultsSummary}'.

Their listed advantages are:
${formattedAdvantages}

Analyze these advantages:
1. **Uniqueness/Differentiation:** How distinct are these advantages compared to common market alternatives (e.g., manual methods, general-purpose tools, direct competitors - use general knowledge if specific competitors aren't provided)?
2. **Strength & Believability:** Are the advantages significant (e.g., 5-10x better as suggested in ProductLed framework)? Are they believable?
3. **Clarity:** Are they clearly stated?
4. **Quantification:** Could any be improved by adding specific numbers or data?

Provide concise, actionable feedback as a bulleted list (max 3-4 points), suggesting ways to strengthen or clarify the advantages.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing advantages'
  );
}

/**
 * Suggest assurances for risks based on ProductLed principles
 */
export async function suggestRiskAssurances(
  userSuccessStatement: string,
  risks: { id: string; text: string }[]
): Promise<Record<string, string[]>> {
  const formattedRisks = risks.map((risk, idx) => `${idx + 1}. '${risk.text}'`).join('\n');
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Risk Mitigation Specialist. You provide specific, concrete assurances to mitigate customer perceived risks.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Risk Mitigation Specialist. A user developing an offer aiming for '${userSuccessStatement}' has identified these top perceived customer risks before signup:
${formattedRisks}

For *each* risk, suggest 1-2 specific, concrete Assurances the business could offer to mitigate that specific risk. Examples include guarantees, specific social proof types (testimonials addressing the risk), setup assistance, certifications, clear support policies, ROI calculators, etc. Tailor suggestions where possible.

Output the suggestions as a JSON object where keys are the risks and values are arrays of suggested assurance strings.`
        }
      ],
      functions: [
        {
          name: "suggest_assurances",
          description: "Suggest assurances for each risk",
          parameters: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: {
                type: "string"
              }
            }
          }
        }
      ],
      function_call: { name: "suggest_assurances" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("Failed to generate assurance suggestions");
      return JSON.parse(result);
    }),
    'suggesting risk assurances'
  );
}

/**
 * Analyze hero section based on ProductLed principles
 */
export async function analyzeHeroSection(
  userSuccessStatement: string,
  topResults: { tangible: string; intangible: string; improvement: string },
  heroSection: {
    tagline: string;
    subCopy: string;
    ctaText: string;
  },
  idealUser?: string
): Promise<string> {
  const topResultsSummary = `${topResults.tangible}, ${topResults.intangible}, and ${topResults.improvement}`;
  const idealUserContext = idealUser ? `(Target user: '${idealUser}')` : '';
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Conversion Copywriter. You provide concise, actionable feedback on hero section copy.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Conversion Copywriter. Analyze the following draft Hero Section copy for an offer aiming for '${userSuccessStatement}' and delivering results like '${topResultsSummary}'. ${idealUserContext}

- Tagline: '${heroSection.tagline}'
- Sub-copy: '${heroSection.subCopy}'
- CTA Text: '${heroSection.ctaText}'

Evaluate based on:
1. **Clarity:** Is it immediately clear what the offer is about and who it's for?
2. **Compelling Value:** Does it highlight the main result or benefit effectively? Does it hook the user?
3. **Alignment:** Does the sub-copy support the tagline? Is the CTA clear and logical?
4. **Conciseness:** Is it easy to understand quickly?

Provide concise, actionable feedback as a bulleted list (max 3-4 points), suggesting specific wording improvements or alternative angles.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing hero section'
  );
}

/**
 * Analyze problem section based on ProductLed principles
 */
export async function analyzeProblemSection(
  userSuccessStatement: string,
  problemSection: {
    alternativesProblems: string;
    underlyingProblem: string;
  },
  idealUser?: string
): Promise<string> {
  const idealUserContext = idealUser ? `(Ideal User: '${idealUser}')` : '';
  
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ProductLed Customer Empathy Analyst. You provide concise feedback on problem framing.`
        },
        {
          role: "user",
          content: `
You are a ProductLed Customer Empathy Analyst. Analyze the following Problem Section copy for an offer targeting users seeking '${userSuccessStatement}' ${idealUserContext}.

- Problems with Alternatives: '${problemSection.alternativesProblems}'
- Underlying Problem Statement: '${problemSection.underlyingProblem}'

Evaluate based on:
1. **Resonance:** Does the underlying problem likely resonate deeply with the target user's experience and challenges? Does it build rapport ('get them')?
2. **Clarity & Specificity:** Is the pain articulated clearly and specifically?
3. **Connection:** Does describing problems with alternatives effectively set up the need for the user's unique solution?

Provide concise feedback as a bulleted list (max 2-3 points), focusing on whether the problem framing effectively agitates the pain the offer solves.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "No content returned from AI";
    }),
    'analyzing problem section'
  );
} 