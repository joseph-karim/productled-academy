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
          content: `You are an expert copywriter specializing in landing page hero sections. You'll generate compelling hero section content based on the provided information.`
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
          content: `You are an expert in product marketing and feature communication. You'll help convert product advantages and results into compelling feature descriptions.`
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
          content: `You are an expert in problem-centric marketing and messaging. You'll help articulate the problems that a product solves in a way that resonates with users.`
        },
        {
          role: "user",
          content: `
Generate a compelling problem section based on this user success statement:

User Success Statement:
${userSuccessStatement}

Generate:
1. A description of problems with current alternatives (what's wrong with the status quo)
2. A description of the underlying problem (the deeper issue that makes this worth solving)`
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
          content: `You are an expert in creating realistic and compelling customer testimonials. Create a testimonial that sounds authentic and specific.`
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