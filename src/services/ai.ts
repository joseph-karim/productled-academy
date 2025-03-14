import OpenAI from 'openai';
import type { Feedback } from '../components/shared/FloatingFeedback';
import type { Solution, Challenge, ModelType, Feature, UserLevel, SolutionType, IdealUser } from '../types';

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'default_key',
  dangerouslyAllowBrowser: true
});

// Check if API key is available
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
}

interface AnalysisResult {
  feedbacks: Array<{
    id: string;
    text: string;
    suggestion: string;
    type: 'improvement' | 'warning' | 'positive';
    category: string;
    startIndex: number;
    endIndex: number;
  }>;
  missingElements: Array<{
    category: string;
    description: string;
    examples?: string[];
  }>;
  suggestedText?: string;
}

const prompts: Record<string, { role: string; content: string }> = {
  'Product Description': {
    role: 'system',
    content: `You are an expert product strategist helping improve product descriptions. Analyze the text and provide feedback on these core elements:

1. Core Product
   - What is your product/service at its core?
   - Is it clearly defined?
   - Is it a recongizable product category?

2. Features
   - What are the key features and capabilities?
   - Are they specific and tangible?
   - Do they support the core value?

3. Uniqueness
   - What makes it unique or different?
   - Is the differentiation clear?
   - Are comparisons effective?


For each element:
- Provide specific feedback (positive or needs improvement)
- Give concrete examples of how to improve
- Suggest clearer alternatives

Also provide a suggested revision that:
- Is concise (2-3 sentences max)
- Focuses on immediate value
- Uses simple, clear language
- Includes specific metrics when possible
- Avoids technical jargon`
  },
  'Solution': {
    role: 'system',
    content: `You are an expert product strategist specializing in solution design. Analyze the solution and provide feedback. Keep all responses concise (2-3 sentences max).

Key elements to consider:
1. Problem-Solution Fit
   - Does it directly address the challenge?
   - Is the approach effective?

2. Implementation Feasibility
   - Is it technically feasible?
   - What are the key requirements?

3. Quick Win vs Long-term
   - What's the time to value?
   - Are there immediate benefits?

For each element:
- Provide specific, actionable feedback
- Focus on immediate impact
- Keep suggestions brief and clear

Suggested revisions should:
- Be specific and actionable (2-3 sentences)
- Include clear success metrics
- Focus on immediate value delivery`
  },
  'Challenge': {
    role: 'system',
    content: `You are an expert in user experience and product challenges. Analyze the challenge description and provide concise feedback (2-3 sentences max).

Focus on:
1. Problem Definition
   - Specific pain point
   - Clear impact
   - Frequency/severity

2. Context
   - When/where it occurs
   - Affected workflows
   - User scenarios

Keep all feedback brief and actionable. Suggested improvements should be clear and implementable immediately.`
  },
  'User Endgame': {
    role: 'system',
    content: `You are an expert in user success and product outcomes. Analyze the text and provide feedback on these core elements:

1. How
   - What features/approaches enable the transformation?
   - Are the methods clear and specific?
   - Is the approach realistic and achievable?

2. Who
   - Who are the target users?
   - Are their needs clearly defined?
   - Is the audience segmentation appropriate?

3. Why
   - What problems are being solved?
   - Are the pain points clear?
   - Is the motivation compelling?

4. Results
   - What specific outcomes are achieved?
   - Are the benefits measurable?
   - Is the timeline realistic?

For each element:
- Provide specific feedback (positive or needs improvement)
- Give concrete examples of how to improve
- Suggest clearer alternatives

Also provide a suggested revision that:
- Is concise and focused
- Includes specific metrics
- Shows clear transformation
- Links features to outcomes`
  }
};

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
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",  // Using standard GPT-4o for quality results
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

export async function generateFromChat(
  responses: Record<string, string>
): Promise<{
  productDescription?: string;
  beginnerOutcome?: string;
  intermediateOutcome?: string;
  advancedOutcome?: string;
}> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist. Based on the user's responses, generate concise content for their product (2-3 sentences max per section).

Your task is to craft:
1. A clear product description that effectively communicates:
   - The core problem solved
   - The primary value proposition
   - What makes the product unique

2. User outcomes that show clear progression (2-3 sentences each):
   - Beginner: First valuable outcome achieved quickly
   - Intermediate: Team-wide benefits and scaled usage
   - Advanced: Enterprise-level results and strategic impact

Guidelines:
- Be extremely concise
- Use metrics when possible (e.g., "3x faster", "50% reduction")
- Focus on benefits over features
- Use active voice
- Avoid jargon`
        },
        {
          role: "user",
          content: `Here are the responses to generate content from:

${Object.entries(responses).map(([key, value]) => `${key}: ${value}`).join('\n\n')}

Please generate the appropriate content based on these responses.`
        }
      ],
      functions: [
        {
          name: "generate_content",
          description: "Generate product description and user outcomes",
          parameters: {
            type: "object",
            properties: {
              productDescription: {
                type: "string",
                description: "The final 2-3 sentence product description"
              },
              beginnerOutcome: {
                type: "string",
                description: "Outcome for beginner users (2-3 sentences)"
              },
              intermediateOutcome: {
                type: "string",
                description: "Outcome for intermediate users (2-3 sentences)"
              },
              advancedOutcome: {
                type: "string",
                description: "Outcome for advanced users (2-3 sentences)"
              }
            }
          }
        }
      ],
      function_call: { name: "generate_content" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No content generated");
      return JSON.parse(result);
    }),
    'generating from chat'
  );
}

export async function analyzeText(text: string, context: keyof typeof prompts): Promise<AnalysisResult> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  const contextPrompt = prompts[context];
  if (!contextPrompt) {
    throw new Error(`No prompt found for context: ${context}`);
  }

  const completion = await handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        contextPrompt,
        { 
          role: "user", 
          content: `Analyze this ${context}:\n\n${text}\n\nProvide detailed, specific feedback with concrete examples and improvements.`
        }
      ],
      functions: [
        {
          name: "provide_feedback",
          description: "Provide structured feedback on the text",
          parameters: {
            type: "object",
            properties: {
              feedbacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    suggestion: { type: "string" },
                    type: { 
                      type: "string",
                      enum: ["improvement", "warning", "positive"]
                    },
                    category: {
                      type: "string",
                      enum: context === 'Solution'
                        ? ["Problem-Solution Fit", "Implementation Feasibility", "Scalability & Maintenance", "Quick Win vs Long-term"]
                        : context === 'Product Description'
                        ? ["Core Product", "Features", "Uniqueness", "Use Case"]
                        : ["Problem Definition", "Impact Assessment", "Context", "Current Workarounds"]
                    },
                    startIndex: { type: "number" },
                    endIndex: { type: "number" }
                  },
                  required: ["text", "suggestion", "type", "category", "startIndex", "endIndex"]
                }
              },
              missingElements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: context === 'Solution'
                        ? ["Problem-Solution Fit", "Implementation Feasibility", "Scalability & Maintenance", "Quick Win vs Long-term"]
                        : context === 'Product Description'
                        ? ["Core Product", "Features", "Uniqueness", "Use Case"]
                        : ["Problem Definition", "Impact Assessment", "Context", "Current Workarounds"]
                    },
                    description: { type: "string" },
                    examples: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["category", "description"]
                }
              },
              suggestedText: { type: "string" }
            },
            required: ["feedbacks", "missingElements"]
          }
        }
      ],
      function_call: { name: "provide_feedback" }
    }),
    'analyzing text'
  );

  const result = completion.choices[0].message.function_call?.arguments;
  if (!result) throw new Error("No feedback received from the analysis");

  const parsedResult = JSON.parse(result) as AnalysisResult;

  // Add unique IDs to feedbacks
  const feedbacksWithIds = parsedResult.feedbacks.map(feedback => ({
    ...feedback,
    id: crypto.randomUUID()
  }));

  // Add missing elements as warnings with unique IDs
  const feedbacksWithMissing = [
    ...feedbacksWithIds,
    ...parsedResult.missingElements.map(missing => ({
      id: crypto.randomUUID(),
      text: '',
      suggestion: missing.description,
      type: 'warning' as const,
      category: missing.category,
      startIndex: 0,
      endIndex: 0
    }))
  ];

  return {
    ...parsedResult,
    feedbacks: feedbacksWithMissing
  };
}

export async function suggestChallenges(
  level: UserLevel,
  productDescription: string,
  userEndgame: string
): Promise<Array<{
  title: string;
  description: string;
  magnitude: number;
}>> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o", // Changed from gpt-4-turbo-preview to gpt-4o
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
    cost: 'low' | 'medium' | 'high';
  }>;
}> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

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

Generate 3-5 concise solutions across product features, resources/tools, and content/guides that will help users overcome this challenge.`
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
                    }
                  },
                  required: ["text", "type", "cost"]
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
      if (!result) throw new Error("No solutions received");
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
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "o3-mini", // Using o3-mini-high as requested
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
${solutions.map(s => `- ${s.text} (Type: ${s.type}, Cost: ${s.cost})`).join('\n')}

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

export async function suggestFeatures(
  productDescription: string,
  userEndgame: string,
  selectedModel: ModelType,
  challenges: Challenge[],
  solutions: Solution[]
): Promise<Array<{
  feature: string;
  category: 'core' | 'value-demo' | 'connection' | 'educational';
  reasoning: string;
  deepScore: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
}>> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  // Get beginner-level challenges and their solutions
  const beginnerChallenges = challenges.filter(c => c.level === 'beginner');
  const beginnerSolutions = solutions.filter(s => 
    beginnerChallenges.some(c => c.id === s.challengeId)
  );

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "o3-mini", // Using o3-mini-high as requested
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist. Based on the beginner user journey (outcome > challenges > solutions), suggest free features that will help users achieve their initial success. Keep all responses concise (2-3 sentences max).
          
Consider:
- Features that directly address beginner challenges
- Quick wins that deliver value in under 7 minutes
- Natural progression toward paid features
- Balance between different solution types

Categories:
- Core: Essential features needed for basic success
- Value-Demo: Features that showcase unique value
- Connection: Basic sharing and collaboration
- Educational: Onboarding and learning resources`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

Beginner User Outcome: ${userEndgame}

Selected Model: ${selectedModel}

Beginner Challenges:
${beginnerChallenges.map(c => `- ${c.title} (Magnitude: ${c.magnitude})`).join('\n')}

Solutions for Beginner Challenges:
${beginnerSolutions.map(s => `- ${s.text} (Type: ${s.type}, Cost: ${s.cost})`).join('\n')}

Based on this beginner user journey, suggest 3-5 features for the free tier that will help users overcome their initial challenges and achieve early success.`
        }
      ],
      functions: [
        {
          name: "suggest_features",
          description: "Suggest features for the free tier",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    feature: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["core", "value-demo", "connection", "educational"]
                    },
                    reasoning: { type: "string" },
                    deepScore: {
                      type: "object",
                      properties: {
                        desirability: { type: "number", minimum: 0, maximum: 10 },
                        effectiveness: { type: "number", minimum: 0, maximum: 10 },
                        efficiency: { type: "number", minimum: 0, maximum: 10 },
                        polish: { type: "number", minimum: 0, maximum: 10 }
                      },
                      required: ["desirability", "effectiveness", "efficiency", "polish"]
                    }
                  },
                  required: ["feature", "category", "reasoning", "deepScore"]
                }
              }
            },
            required: ["suggestions"]
          }
        }
      ],
      function_call: { name: "suggest_features" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No suggestions received");
      const { suggestions } = JSON.parse(result);
      return suggestions;
    }),
    'suggesting features'
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
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",  // Using gpt-4o
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

export async function getAnalysisResponse(
  question: string,
  context: {
    productDescription: string;
    userEndgame: string;
    challenges: Challenge[];
    solutions: Solution[];
    selectedModel: ModelType;
    freeFeatures: Feature[];
    analysis: {
      deepScore: { [key: string]: number };
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  }
): Promise<string> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "o3-mini", // Using o3-mini-high as requested
      messages: [
        {
          role: "system",
          content: `You are an expert product strategist assistant. Use the provided context to answer questions about the product's free model strategy. Keep responses concise and focused (2-3 sentences per point).
          
Your responses should:
- Be specific and actionable
- Reference relevant parts of the analysis
- Provide clear explanations
- Stay focused on product-led growth and free model optimization`
        },
        {
          role: "user",
          content: `Context:
Product Description: ${context.productDescription}

User Endgame: ${context.userEndgame}

Challenges:
${context.challenges.map(c => `- ${c.title} (Level: ${c.level}, Magnitude: ${c.magnitude})`).join('\n')}

Solutions:
${context.solutions.map(s => `- ${s.text} (Type: ${s.type}, Cost: ${s.cost})`).join('\n')}

Selected Model: ${context.selectedModel}

Free Features:
${context.freeFeatures.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Analysis:
DEEP Scores:
${Object.entries(context.analysis.deepScore).map(([key, value]) => `- ${key}: ${value}/10`).join('\n')}

Strengths:
${context.analysis.strengths.map(s => `- ${s}`).join('\n')}

Weaknesses:
${context.analysis.weaknesses.map(w => `- ${w}`).join('\n')}

Recommendations:
${context.analysis.recommendations.map(r => `- ${r}`).join('\n')}

Question: ${question}

Provide a clear, specific answer based on this context.`
        }
      ]
    }).then(completion => {
      return completion.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
    }),
    'getting analysis response'
  );
}

export async function analyzeFormData(
  productDescription: string,
  idealUser: IdealUser,
  userEndgame: string,
  challenges: Challenge[],
  solutions: Solution[],
  selectedModel: ModelType,
  freeFeatures: Feature[],
  userJourney?: any
): Promise<{
  deepScore: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  componentScores: {
    productDescription: number;
    idealUser: number;
    userEndgame: number;
    challenges: number;
    solutions: number;
    modelSelection: number;
    freeFeatures: number;
    userJourney: number;
  };
  componentFeedback: {
    productDescription: {
      strengths: string[];
      recommendations: string[];
    };
    idealUser: {
      strengths: string[];
      recommendations: string[];
    };
    userEndgame: {
      strengths: string[];
      recommendations: string[];
    };
    challenges: {
      strengths: string[];
      recommendations: string[];
    };
    solutions: {
      strengths: string[];
      recommendations: string[];
    };
    modelSelection: {
      strengths: string[];
      recommendations: string[];
    };
    freeFeatures: {
      strengths: string[];
      recommendations: string[];
    };
    userJourney: {
      strengths: string[];
      recommendations: string[];
    };
  };
  actionPlan: {
    immediate: string[];
    medium: string[];
    long: string[];
  };
  testing: {
    abTests: string[];
    metrics: string[];
  };
  summary: string;
}> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  // Format the ideal user traits for the prompt
  const idealUserTraits = Array.isArray(idealUser?.traits) 
    ? idealUser.traits.join(', ') 
    : typeof idealUser?.traits === 'string' 
      ? idealUser.traits 
      : '';

  // Format challenges with levels
  const formattedChallenges = challenges.map(c => {
    const level = c.level || 'unspecified';
    const magnitude = c.magnitude || 'unspecified';
    return `- ${c.title} (Level: ${level}, Magnitude: ${magnitude})`;
  }).join('\n');

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in product-led growth and free model analysis. Using the DEEP framework, analyze the provided information and generate comprehensive insights. Keep all responses concise (2-3 sentences per point).

Consider:
- Desirability: User appeal and value proposition
- Effectiveness: Problem-solution fit and outcome achievement
- Efficiency: Resource utilization and implementation
- Polish: User experience and cohesiveness

Provide:
1. DEEP scores (0-10 for each dimension)
2. Component-specific scores (0-100) for all seven sections
3. Key strengths and recommendations for each component
4. Overall strengths and weaknesses
5. Actionable recommendations
6. Implementation timeline
7. Testing framework
8. A concise executive summary that highlights key insights and next steps`
        },
        {
          role: "user",
          content: `
Product Description: ${productDescription}

Ideal User:
- Title: ${idealUser?.title || 'Not specified'}
- Description: ${idealUser?.description || 'Not specified'}
- Motivation: ${idealUser?.motivation || 'Not specified'}
- Technical Ability: ${idealUser?.ability || 'Not specified'}
- Traits: ${idealUserTraits}
- Impact: ${idealUser?.impact || 'Not specified'}

User Endgame: ${userEndgame}

Challenges:
${formattedChallenges}

Solutions:
${solutions.map(s => `- ${s.text} (Type: ${s.type || 'not specified'}, Cost: ${s.cost || 'not specified'})`).join('\n')}

Selected Model: ${selectedModel}

Free Features:
${freeFeatures.map(f => `- ${f.name || 'Unnamed'}: ${f.description || 'No description'}`).join('\n')}

User Journey Canvas: ${userJourney ? JSON.stringify(userJourney) : 'Not provided'}

Analyze this information using the DEEP framework. For each component, provide specific strengths and actionable recommendations. Create a comprehensive analysis that evaluates the free model strategy across all dimensions.`
        }
      ],
      functions: [
        {
          name: "provide_analysis",
          description: "Provide structured analysis using the DEEP framework",
          parameters: {
            type: "object",
            properties: {
              deepScore: {
                type: "object",
                properties: {
                  desirability: { type: "number", minimum: 0, maximum: 10 },
                  effectiveness: { type: "number", minimum: 0, maximum: 10 },
                  efficiency: { type: "number", minimum: 0, maximum: 10 },
                  polish: { type: "number", minimum: 0, maximum: 10 }
                },
                required: ["desirability", "effectiveness", "efficiency", "polish"]
              },
              componentScores: {
                type: "object",
                properties: {
                  productDescription: { type: "number", minimum: 0, maximum: 100 },
                  idealUser: { type: "number", minimum: 0, maximum: 100 },
                  userEndgame: { type: "number", minimum: 0, maximum: 100 },
                  challenges: { type: "number", minimum: 0, maximum: 100 },
                  solutions: { type: "number", minimum: 0, maximum: 100 },
                  modelSelection: { type: "number", minimum: 0, maximum: 100 },
                  freeFeatures: { type: "number", minimum: 0, maximum: 100 },
                  userJourney: { type: "number", minimum: 0, maximum: 100 }
                },
                required: ["productDescription", "idealUser", "userEndgame", "challenges", "solutions", "modelSelection", "freeFeatures", "userJourney"]
              },
              componentFeedback: {
                type: "object",
                properties: {
                  productDescription: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  idealUser: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  userEndgame: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  challenges: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  solutions: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  modelSelection: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  freeFeatures: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  },
                  userJourney: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations"]
                  }
                },
                required: ["productDescription", "idealUser", "userEndgame", "challenges", "solutions", "modelSelection", "freeFeatures", "userJourney"]
              },
              strengths: {
                type: "array",
                items: { type: "string" }
              },
              weaknesses: {
                type: "array",
                items: { type: "string" }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              },
              actionPlan: {
                type: "object",
                properties: {
                  immediate: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actions for 1-30 days"
                  },
                  medium: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actions for 30-90 days"
                  },
                  long: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actions for 90+ days"
                  }
                },
                required: ["immediate", "medium", "long"]
              },
              testing: {
                type: "object",
                properties: {
                  abTests: {
                    type: "array",
                    items: { type: "string" }
                  },
                  metrics: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["abTests", "metrics"]
              },
              summary: { type: "string" }
            },
            required: ["deepScore", "componentScores", "componentFeedback", "strengths", "weaknesses", "recommendations", "actionPlan", "testing", "summary"]
          }
        }
      ],
      function_call: { name: "provide_analysis" }
    }).then(completion => {
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) throw new Error("No analysis received");
      return JSON.parse(result);
    }),
    'analyzing form data'
  );
}

async function handleOpenAIRequest<T>(request: Promise<T>, errorContext: string): Promise<T> {
  try {
    return await request;
  } catch (error) {
    console.error(`Error ${errorContext}:`, error);
    
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
        case 429:
          throw new Error('API rate limit exceeded or insufficient quota. Please try again later or check your OpenAI account.');
        case 500:
          throw new Error('OpenAI service error. Please try again later.');
        default:
          throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
    
    throw new Error(`Failed to ${errorContext}. Please try again.`);
  }
}