import { openai, handleOpenAIRequest } from './client';
import type { UserLevel, Challenge, Solution, ModelType, Feature, SolutionType, SolutionCost, SolutionImpact } from '../../types';
import type { PackageFeature, PricingStrategy } from '../../types/package';

export async function suggestChallenges(
  level: UserLevel,
  productDescription: string,
  userEndgame: string
): Promise<Array<{
  title: string;
  description: string;
  magnitude: number;
}>> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in user experience and product challenges. Based on the product description and user endgame, suggest potential challenges that ${level} users might face. Keep all responses concise (2-3 sentences max).

Consider:
- Technical complexity appropriate for the user level
- Common pain points and obstacles
- Learning curve challenges
- Integration and workflow issues

For each challenge:
1. Provide a clear, specific title (1 sentence)
2. Add a brief description (1-2 sentences)
3. Rate magnitude (1-5) based on impact and frequency`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

${level} User Endgame: ${userEndgame}

Generate 3-5 specific challenges that ${level} users might face when trying to achieve their endgame.`
        }
      ],
      functions: [
        {
          name: "suggest_challenges",
          description: "Suggest challenges for the user level",
          parameters: {
            type: "object",
            properties: {
              challenges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    magnitude: { 
                      type: "number",
                      minimum: 1,
                      maximum: 5
                    }
                  },
                  required: ["title", "description", "magnitude"]
                }
              }
            },
            required: ["challenges"]
          }
        }
      ],
      function_call: { name: "suggest_challenges" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No challenges received");
      const { challenges } = JSON.parse(result);
      return challenges;
    }),
    'suggesting challenges'
  );
}

export async function suggestSolutions(
  challengeTitle: string,
  challengeDescription: string | undefined,
  productDescription: string,
  userEndgame: string
): Promise<{
  suggestions: Array<{
    text: string;
    type: SolutionType;
    cost: SolutionCost;
    impact: SolutionImpact;
  }>;
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist specializing in solution design. Given a user challenge and desired outcome, suggest potential solutions. Keep all responses concise (2-3 sentences max).
          
Categories:
1. Product Features
   - Core functionality
   - UI improvements
   - Technical capabilities

2. Resources/Tools
   - Templates
   - Integrations
   - Automation tools

3. Content/Guides
   - Documentation
   - Tutorials
   - Best practices

For each solution:
1. Provide a clear, actionable description (2-3 sentences)
2. Categorize as product/resource/content
3. Evaluate implementation cost (low/medium/high)
4. Assess business impact (low/medium/high)

Aim for a balanced mix of quick wins and strategic solutions.`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

User Endgame: ${userEndgame}

Challenge:
Title: ${challengeTitle}
${challengeDescription ? `Description: ${challengeDescription}` : ''}

Generate 3-5 concise solutions that will help users overcome this challenge.`
        }
      ],
      functions: [
        {
          name: "suggest_solutions",
          description: "Suggest solutions for the challenge",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    type: { 
                      type: "string",
                      enum: ["product", "resource", "content"]
                    },
                    cost: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    },
                    impact: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    }
                  },
                  required: ["text", "type", "cost", "impact"]
                }
              }
            },
            required: ["suggestions"]
          }
        }
      ],
      function_call: { name: "suggest_solutions" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No suggestions received");
      return JSON.parse(result);
    }),
    'suggesting solutions'
  );
}

export async function suggestModel(
  productDescription: string,
  userEndgame: string,
  challenges: Challenge[],
  solutions: Solution[]
): Promise<{
  model: ModelType;
  confidence: number;
  reasoning: string;
  considerations: string[];
}> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product-led growth strategies. Analyze the provided information and suggest the most appropriate free model.

Consider these factors:

Product Factors:
- Time to value delivery
- Setup complexity
- Resource requirements
- Integration needs

Market Factors:
- User sophistication
- Competition approach
- Industry standards
- Purchase process

Model Types:
1. Opt-In Trial
   - Time-limited access without credit card
   - Best for quick value delivery
   - Requires excellent onboarding

2. Opt-Out Trial
   - Credit card required upfront
   - Best for reducing spam
   - Higher friction but better qualified

3. Usage-Based Trial
   - Full features with usage limits
   - Best for value through usage
   - Natural upgrade triggers

4. Freemium
   - Core features free forever
   - Best for network effects
   - Needs clear feature tiers

5. New Product
   - Simpler standalone product
   - Best for complex prerequisites
   - Creates pipeline to main product

6. Sandbox
   - Interactive demo environment
   - Best for complex setup
   - Shows value without setup

Provide:
1. Most appropriate model
2. Confidence score (0-100)
3. Detailed reasoning
4. Key considerations`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

User Endgame: ${userEndgame}

Challenges:
${challenges.map(c => `- ${c.title} (Level: ${c.level}, Magnitude: ${c.magnitude})`).join('\n')}

Solutions:
${solutions.map(s => `- ${s.text} (Type: ${s.type}, Cost: ${s.cost}, Impact: ${s.impact})`).join('\n')}

Suggest the most appropriate free model with detailed reasoning.`
        }
      ],
      functions: [
        {
          name: "suggest_model",
          description: "Suggest the most appropriate free model",
          parameters: {
            type: "object",
            properties: {
              model: {
                type: "string",
                enum: ["opt-in-trial", "opt-out-trial", "usage-trial", "freemium", "new-product", "sandbox"]
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "Confidence level in the suggestion (0-100)"
              },
              reasoning: { type: "string" },
              considerations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["model", "confidence", "reasoning", "considerations"]
          }
        }
      ],
      function_call: { name: "suggest_model" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No suggestion received");
      return JSON.parse(result);
    }),
    'suggesting model'
  );
}

export async function suggestCoreSolutions(
  productDescription: string
): Promise<Array<{
  text: string;
  type: SolutionType;
  cost: SolutionCost;
  impact: SolutionImpact;
}>> {
  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist. Based on the product description, suggest core features that are essential to the product's functionality. Keep all responses concise (2-3 sentences max).

Consider:
- Essential product capabilities
- Key differentiators
- Must-have features
- Technical foundations

For each feature:
1. Provide a clear description (2-3 sentences)
2. Categorize as product/resource/content
3. Evaluate implementation cost (low/medium/high)
4. Assess business impact (low/medium/high)

Focus on features that are fundamental to the product's value proposition.`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

Generate 3-5 core features that are essential to this product's functionality.`
        }
      ],
      functions: [
        {
          name: "suggest_core_features",
          description: "Suggest core product features",
          parameters: {
            type: "object",
            properties: {
              features: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    type: { 
                      type: "string",
                      enum: ["product", "resource", "content"]
                    },
                    cost: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    },
                    impact: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    }
                  },
                  required: ["text", "type", "cost", "impact"]
                }
              }
            },
            required: ["features"]
          }
        }
      ],
      function_call: { name: "suggest_core_features" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No core features received");
      const { features } = JSON.parse(result);
      return features;
    }),
    'suggesting core features'
  );
}

export async function suggestPackageFeatures(
  productDescription: string,
  selectedModel: ModelType,
  challenges: Challenge[],
  solutions: Solution[]
): Promise<{
  free: PackageFeature[];
  paid: PackageFeature[];
  pricingStrategy: PricingStrategy;
}> {
  const beginnerChallenges = challenges.filter(c => c.level === 'beginner');
  const beginnerSolutions = solutions.filter(s => 
    beginnerChallenges.some(c => c.id === s.challengeId)
  );

  const sortedSolutions = [...beginnerSolutions].sort((a, b) => {
    const impactScore = { low: 1, medium: 2, high: 3 };
    const costScore = { low: 3, medium: 2, high: 1 };
    
    const aScore = impactScore[a.impact] * costScore[a.cost];
    const bScore = impactScore[b.impact] * costScore[b.cost];
    
    return bScore - aScore;
  });

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product-led growth and packaging strategy. Based on the product description, model, and beginner solutions, suggest features for both free and paid packages. Keep all responses concise and focused on value delivery.

Consider:
- Free package should demonstrate core value
- Paid package should focus on scalability
- Create natural upgrade paths
- Balance value demonstration with monetization

For each feature:
1. Provide clear name and description
2. Categorize appropriately
3. Set reasonable limits for free features
4. Create clear upgrade triggers

Also suggest an overall pricing strategy that:
1. Aligns with the chosen model
2. Sets clear conversion goals
3. Defines value metrics
4. Targets specific conversion rates`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

Selected Model: ${selectedModel}

Beginner Solutions (sorted by impact/cost ratio):
${sortedSolutions.map(s => `- ${s.text} (Type: ${s.type}, Cost: ${s.cost}, Impact: ${s.impact})`).join('\n')}

Based on these beginner solutions, suggest features for both free and paid packages, along with a comprehensive pricing strategy. Focus on creating a natural upgrade path from free to paid.`
        }
      ],
      functions: [
        {
          name: "suggest_packages",
          description: "Suggest package features and pricing strategy",
          parameters: {
            type: "object",
            properties: {
              free: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["core", "value-demo", "connection", "educational"]
                    },
                    tier: {
                      type: "string",
                      enum: ["free"]
                    },
                    limits: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["quantity", "time", "capability"]
                        },
                        value: { type: "string" }
                      }
                    }
                  },
                  required: ["name", "description", "category", "tier"]
                }
              },
              paid: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["core", "value-demo", "connection", "educational"]
                    },
                    tier: {
                      type: "string",
                      enum: ["paid"]
                    }
                  },
                  required: ["name", "description", "category", "tier"]
                }
              },
              pricingStrategy: {
                type: "object",
                properties: {
                  model: {
                    type: "string",
                    enum: ["freemium", "free-trial", "open-core"]
                  },
                  basis: {
                    type: "string",
                    enum: ["per-user", "per-usage", "flat-rate"]
                  },
                  freePackage: {
                    type: "object",
                    properties: {
                      limitations: {
                        type: "array",
                        items: { type: "string" }
                      },
                      conversionGoals: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["limitations", "conversionGoals"]
                  },
                  paidPackage: {
                    type: "object",
                    properties: {
                      valueMetrics: {
                        type: "array",
                        items: { type: "string" }
                      },
                      targetConversion: {
                        type: "number",
                        minimum: 0,
                        maximum: 100
                      }
                    },
                    required: ["valueMetrics", "targetConversion"]
                  }
                },
                required: ["model", "basis", "freePackage", "paidPackage"]
              }
            },
            required: ["free", "paid", "pricingStrategy"]
          }
        }
      ],
      function_call: { name: "suggest_packages" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No package suggestions received");
      
      const parsed = JSON.parse(result);
      parsed.free = parsed.free.map((f: PackageFeature) => ({
        ...f,
        id: crypto.randomUUID()
      }));
      parsed.paid = parsed.paid.map((f: PackageFeature) => ({
        ...f,
        id: crypto.randomUUID()
      }));
      
      return parsed;
    }),
    'suggesting package features'
  );
}