import { openai, handleOpenAIRequest } from './client';

// Define UserLevel inline
type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export async function identifyIdealUser(
  productDescription: string
): Promise<{
  idealUser: {
    title: string;
    description: string;
    motivation: 'Low' | 'Medium' | 'High';
    ability: 'Low' | 'Medium' | 'High';
  };
  traits: string[];
  impact: string;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a product strategist specializing in ideal user identification. Based on the product description, identify the single most suitable ideal user.

Consider:
- Who would get the most value from this product?
- Who would find success most quickly?
- Who would be most likely to become a paying customer?

Focus on motivation (how motivated they are to solve the problem) and ability (how easy it is for them to use the product).

Keep your analysis concise and focused. The ideal user should be specific enough to guide product decisions but not so narrow that it limits growth potential.`
        },
        {
          role: "user",
          content: `Based on this product description, identify the ideal user:

${productDescription}

Please provide the ideal user profile, key traits, and business impact.`
        }
      ],
      functions: [
        {
          name: "identify_ideal_user",
          description: "Identify the ideal user for a product",
          parameters: {
            type: "object",
            properties: {
              idealUser: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  motivation: { 
                    type: "string",
                    enum: ["Low", "Medium", "High"]
                  },
                  ability: { 
                    type: "string",
                    enum: ["Low", "Medium", "High"]
                  }
                },
                required: ["title", "description", "motivation", "ability"]
              },
              traits: {
                type: "array",
                items: { type: "string" },
                description: "3-5 key traits of the ideal user"
              },
              impact: {
                type: "string",
                description: "Brief description of business impact"
              }
            },
            required: ["idealUser", "traits", "impact"]
          }
        }
      ],
      function_call: { name: "identify_ideal_user" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No ideal user identification received");
      return JSON.parse(result);
    }),
    'identifying ideal user'
  );
}

export async function suggestUserEndgame(
  level: UserLevel,
  productDescription: string
): Promise<{
  suggestion: string;
  breakdown: {
    how: string;
    who: string;
    why: string;
    results: string;
  };
  roles?: {
    individual: string;
    manager?: string;
    director?: string;
  };
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product strategy and user journey mapping. Generate a detailed user endgame for ${level} users based on the product description. Keep responses concise (2-3 sentences per section).

Consider the user's progression:
- Beginner: First-time users learning the basics
- Intermediate: Regular users expanding capabilities
- Advanced: Power users scaling usage

Structure the outcome around:
1. How: Key features/approaches enabling transformation
2. Who: Target audience and their needs
3. Why: Problems solved and pain points addressed
4. Results: Specific, measurable outcomes

Make suggestions:
- Beginner: Focus on quick wins and immediate value
- Intermediate: Emphasize workflow integration and efficiency
- Advanced: Highlight scaling and strategic impact`
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}

Generate a detailed ${level} user endgame that shows their transformation and success with the product.`
        }
      ],
      functions: [
        {
          name: "suggest_user_endgame",
          description: "Suggest user endgame outcomes",
          parameters: {
            type: "object",
            properties: {
              suggestion: {
                type: "string",
                description: "Complete suggested outcome text (2-3 sentences)"
              },
              breakdown: {
                type: "object",
                properties: {
                  how: { type: "string" },
                  who: { type: "string" },
                  why: { type: "string" },
                  results: { type: "string" }
                },
                required: ["how", "who", "why", "results"]
              },
              roles: {
                type: "object",
                properties: {
                  individual: { type: "string" },
                  manager: { type: "string" },
                  director: { type: "string" }
                },
                required: ["individual"]
              }
            },
            required: ["suggestion", "breakdown"]
          }
        }
      ],
      function_call: { name: "suggest_user_endgame" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No suggestion received");
      return JSON.parse(result);
    }),
    'suggesting user endgame'
  );
}