import { openai, handleOpenAIRequest } from './client';
import type { Challenge, Solution, ModelType, Feature, IdealUser, UserJourney, Analysis } from '../../types';

export async function analyzeFormData(
  productDescription: string,
  idealUser: IdealUser,
  userEndgame: string,
  challenges: Challenge[],
  solutions: Solution[],
  selectedModel: ModelType,
  freeFeatures: Feature[],
  userJourney?: UserJourney
): Promise<Analysis> {
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
2. Component-specific scores (0-100)
3. Key strengths and weaknesses
4. Actionable recommendations
5. Implementation timeline
6. Testing framework
7. A concise executive summary that highlights key insights and next steps`
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