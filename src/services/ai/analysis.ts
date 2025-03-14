import { openai, handleOpenAIRequest } from './client';
import type { Challenge, Solution, ModelType, Feature, IdealUser, UserJourney, Analysis } from '../../types';

// Updated analyzeFormData function with proper null/undefined checks
// to fix "Cannot read properties of undefined (reading 'map')" error

export async function analyzeFormData(
  productDescription: string,
  idealUser: IdealUser,
  userEndgame: string,
  challenges: Challenge[],
  solutions: Solution[],
  selectedModel: ModelType,
  freeFeatures: Feature[],
  userJourney?: any
): Promise<Analysis> {
  // Format the ideal user traits for the prompt with null checks
  const idealUserTraits = idealUser?.traits
    ? Array.isArray(idealUser.traits) 
      ? idealUser.traits.join(', ') 
      : typeof idealUser.traits === 'string' 
        ? idealUser.traits 
        : ''
    : '';

  // Format challenges with levels using safe null checks
  const formattedChallenges = Array.isArray(challenges) 
    ? challenges.map(c => {
        const level = c?.level || 'unspecified';
        const magnitude = c?.magnitude || 'unspecified';
        return `- ${c?.title || 'Untitled Challenge'} (Level: ${level}, Magnitude: ${magnitude})`;
      }).join('\n')
    : 'No challenges provided';

  // Format solutions with safe null checks
  const formattedSolutions = Array.isArray(solutions)
    ? solutions.map(s => {
        return `- ${s?.text || 'Untitled Solution'} (Type: ${s?.type || 'not specified'}, Cost: ${s?.cost || 'not specified'})`;
      }).join('\n')
    : 'No solutions provided';

  // Format free features with safe null checks
  const formattedFeatures = Array.isArray(freeFeatures)
    ? freeFeatures.map(f => {
        return `- ${f?.name || 'Unnamed'}: ${f?.description || 'No description'}`;
      }).join('\n')
    : 'No features provided';

  // Create a validated input object
  const validatedInput = {
    productDescription: productDescription || 'No product description provided',
    idealUser: {
      title: idealUser?.title || 'Not specified',
      description: idealUser?.description || 'Not specified',
      motivation: idealUser?.motivation || 'Not specified',
      ability: idealUser?.ability || 'Not specified',
      traits: idealUserTraits,
      impact: idealUser?.impact || 'Not specified'
    },
    userEndgame: userEndgame || 'No user endgame provided',
    challenges: formattedChallenges,
    solutions: formattedSolutions,
    selectedModel: selectedModel || 'not specified',
    freeFeatures: formattedFeatures,
    userJourney: userJourney ? JSON.stringify(userJourney) : 'Not provided'
  };

  // Log the validated input for debugging
  console.log('Validated input for analysis:', validatedInput);

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
Product Description: ${validatedInput.productDescription}

Ideal User:
- Title: ${validatedInput.idealUser.title}
- Description: ${validatedInput.idealUser.description}
- Motivation: ${validatedInput.idealUser.motivation}
- Technical Ability: ${validatedInput.idealUser.ability}
- Traits: ${validatedInput.idealUser.traits}
- Impact: ${validatedInput.idealUser.impact}

User Endgame: ${validatedInput.userEndgame}

Challenges:
${validatedInput.challenges}

Solutions:
${validatedInput.solutions}

Selected Model: ${validatedInput.selectedModel}

Free Features:
${validatedInput.freeFeatures}

User Journey Canvas: ${validatedInput.userJourney}

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
                items: { type: "string" },
                description: "Overall strengths identified in the analysis"
              },
              weaknesses: {
                type: "array", 
                items: { type: "string" },
                description: "Overall weaknesses identified in the analysis"
              },
              recommendations: {
                type: "array", 
                items: { type: "string" },
                description: "Overall recommendations based on the analysis"
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
      console.log("Received OpenAI completion response");
      
      const result = completion.choices[0].message.function_call?.arguments;
      if (!result) {
        console.error("No analysis result received in function_call arguments");
        throw new Error("No analysis received");
      }
      
      try {
        const parsedResult = JSON.parse(result);
        console.log("Successfully parsed analysis result");
        
        // Validate required fields
        if (!parsedResult.deepScore || !parsedResult.strengths || !parsedResult.weaknesses) {
          console.error("Missing required fields in analysis result", parsedResult);
          throw new Error("Incomplete analysis results");
        }
        
        return parsedResult;
      } catch (parseError) {
        console.error("Error parsing analysis result:", parseError);
        throw new Error(`Failed to parse analysis result: ${parseError.message}`);
      }
    }),
    'analyzing form data'
  );
}