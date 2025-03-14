import { openai, handleOpenAIRequest } from './client';
import type { Challenge, Solution, ModelType, Feature, Analysis } from '../types';

export async function analyzeFormData(
  productDescription: string,
  idealUser: {
    title: string;
    description: string;
    motivation: 'Low' | 'Medium' | 'High';
    ability: 'Low' | 'Medium' | 'High';
    traits: string[];
    impact: string;
  },
  userEndgame: string,
  challenges: Challenge[],
  solutions: Solution[],
  selectedModel: ModelType,
  freeFeatures: Feature[],
  userJourney?: any
): Promise<Analysis> {
  // Validate required fields
  if (!productDescription || !userEndgame || !selectedModel) {
    throw new Error('Missing required fields for analysis');
  }

  // Format the ideal user traits
  const idealUserTraits = Array.isArray(idealUser?.traits) 
    ? idealUser.traits.join(', ') 
    : '';

  // Format challenges with levels
  const formattedChallenges = challenges.map(c => {
    const level = c.level || 'unspecified';
    const magnitude = c.magnitude || 'unspecified';
    return `- ${c.title} (Level: ${level}, Magnitude: ${magnitude})`;
  }).join('\n');

  // Format solutions
  const formattedSolutions = solutions.map(s => {
    return `- ${s.text} (Type: ${s.type}, Cost: ${s.cost})`;
  }).join('\n');

  // Format free features
  const formattedFeatures = freeFeatures.map(f => {
    return `- ${f.name}: ${f.description}`;
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

Your analysis must follow this exact structure:
1. DEEP scores (0-10 for each dimension)
2. A concise summary (3-5 sentences) of the overall strategy
3. 3-5 key overall strengths 
4. 3-5 key overall weaknesses
5. 3-5 actionable overall recommendations
6. Component-specific scores (0-100) for all eight components
7. For each component, provide 2-3 specific strengths and recommendations
8. Implementation timeline (immediate, medium, and long-term actions)
9. Testing framework with A/B tests and metrics

Be specific, actionable, and focused on product-led growth strategies.`
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
${formattedSolutions}

Selected Model: ${selectedModel}

Free Features:
${formattedFeatures}

User Journey Canvas: ${userJourney ? JSON.stringify(userJourney) : 'Not provided'}

Please analyze this information using the DEEP framework. Follow the structure outlined in your instructions to provide a comprehensive, consistent analysis of this free model strategy.`
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
              summary: { 
                type: "string",
                description: "A concise summary of the overall analysis"
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
              }
            },
            required: ["deepScore", "summary", "strengths", "weaknesses", "recommendations", "componentScores", "componentFeedback", "actionPlan", "testing"]
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