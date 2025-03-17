import { openai, handleOpenAIRequest } from './client';
import type { Analysis, AnalysisInput } from '../../types/analysis';
import type { PackageFeature, PricingStrategy } from '../../types/package';

export async function analyzeFormData(inputData: AnalysisInput): Promise<Analysis> {
  // Validate required fields
  if (!inputData.productDescription || !inputData.userEndgame || !inputData.selectedModel) {
    throw new Error('Missing required fields for analysis');
  }

  // Format the ideal user traits
  const idealUserTraits = Array.isArray(inputData.idealUser?.traits) 
    ? inputData.idealUser.traits.join(', ') 
    : '';

  // Format challenges with levels
  const formattedChallenges = inputData.challenges.map(c => {
    const level = c.level || 'unspecified';
    const magnitude = c.magnitude || 'unspecified';
    return `- ${c.title} (Level: ${level}, Magnitude: ${magnitude})`;
  }).join('\n');

  // Format solutions with type, cost and impact
  const formattedSolutions = inputData.solutions.map(s => {
    return `- ${s.text} (Type: ${s.type}, Cost: ${s.cost}, Impact: ${s.impact})`;
  }).join('\n');

  // Format package features
  const formattedPackages = inputData.packages ? `
Free Package Features:
${inputData.packages.features
  .filter(f => f.tier === 'free')
  .map(f => `- ${f.name}: ${f.description} (${f.category})`)
  .join('\n')}

Paid Package Features:
${inputData.packages.features
  .filter(f => f.tier === 'paid')
  .map(f => `- ${f.name}: ${f.description} (${f.category})`)
  .join('\n')}

Pricing Strategy:
- Model: ${inputData.packages.pricingStrategy.model}
- Basis: ${inputData.packages.pricingStrategy.basis}
- Free Package Limitations: ${inputData.packages.pricingStrategy.freePackage.limitations.join(', ')}
- Conversion Goals: ${inputData.packages.pricingStrategy.freePackage.conversionGoals.join(', ')}
- Value Metrics: ${inputData.packages.pricingStrategy.paidPackage.valueMetrics.join(', ')}
- Target Conversion: ${inputData.packages.pricingStrategy.paidPackage.targetConversion}%
` : 'No package data provided';

  return handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in product-led growth and free model analysis. Using the DEEP framework, analyze the provided information and generate comprehensive insights. Keep all responses concise (2-3 sentences per point).

Consider:
- Desirability: User appeal and value proposition
- Effectiveness: Problem-solution fit and outcome achievement
- Efficiency: Resource utilization and implementation
- Polish: User experience and cohesiveness

Focus on:
1. Package balance and feature distribution
2. Pricing strategy effectiveness
3. Conversion potential
4. Value demonstration
5. Upgrade path clarity

Your analysis must follow this exact structure:
1. DEEP scores (0-10 for each dimension)
2. A concise summary (3-5 sentences)
3. 3-5 key overall strengths 
4. 3-5 key overall weaknesses
5. 3-5 actionable overall recommendations
6. Component-specific scores (0-100) for all components
7. For each component, provide 2-3 specific strengths and recommendations
8. Implementation timeline (immediate, medium, and long-term actions)
9. Testing framework with A/B tests and metrics
10. Journey analysis covering discovery through conversion`
        },
        {
          role: "user",
          content: `
Product Description: ${inputData.productDescription}

Ideal User:
- Title: ${inputData.idealUser?.title || 'Not specified'}
- Description: ${inputData.idealUser?.description || 'Not specified'}
- Motivation: ${inputData.idealUser?.motivation || 'Not specified'}
- Technical Ability: ${inputData.idealUser?.ability || 'Not specified'}
- Traits: ${idealUserTraits}
- Impact: ${inputData.idealUser?.impact || 'Not specified'}

User Endgame: ${inputData.userEndgame}

Challenges:
${formattedChallenges}

Solutions:
${formattedSolutions}

Selected Model: ${inputData.selectedModel}

Package & Pricing Details:
${formattedPackages}

Please analyze this information using the DEEP framework. Focus on the effectiveness of the package design and pricing strategy in achieving the desired user outcomes and business goals.`
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
                  packageDesign: { type: "number", minimum: 0, maximum: 100 },
                  pricingStrategy: { type: "number", minimum: 0, maximum: 100 }
                },
                required: ["productDescription", "idealUser", "userEndgame", "challenges", "solutions", "modelSelection", "packageDesign", "pricingStrategy"]
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
                      recommendations: { type: "array", items: { type: "string" }},
                      analysis: { type: "string" },
                      considerations: { type: "array", items: { type: "string" }}
                    },
                    required: ["strengths", "recommendations", "analysis", "considerations"]
                  },
                  packageDesign: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }},
                      analysis: { type: "string" },
                      balanceScore: { type: "number", minimum: 0, maximum: 100 }
                    },
                    required: ["strengths", "recommendations", "analysis", "balanceScore"]
                  },
                  pricingStrategy: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }},
                      recommendations: { type: "array", items: { type: "string" }},
                      analysis: { type: "string" },
                      conversionPotential: { type: "number", minimum: 0, maximum: 100 }
                    },
                    required: ["strengths", "recommendations", "analysis", "conversionPotential"]
                  }
                },
                required: ["productDescription", "idealUser", "userEndgame", "challenges", "solutions", "modelSelection", "packageDesign", "pricingStrategy"]
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
                  },
                  people: {
                    type: "array",
                    items: { type: "string" },
                    description: "People-related actions"
                  },
                  process: {
                    type: "array",
                    items: { type: "string" },
                    description: "Process-related actions"
                  },
                  technology: {
                    type: "array",
                    items: { type: "string" },
                    description: "Technology-related actions"
                  }
                },
                required: ["immediate", "medium", "long", "people", "process", "technology"]
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
              journeyAnalysis: {
                type: "object",
                properties: {
                  overview: { type: "string" },
                  discovery: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      analysis: { type: "string" },
                      strengths: { type: "array", items: { type: "string" }},
                      suggestions: { type: "array", items: { type: "string" }}
                    },
                    required: ["score", "analysis", "strengths", "suggestions"]
                  },
                  signup: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      analysis: { type: "string" },
                      strengths: { type: "array", items: { type: "string" }},
                      suggestions: { type: "array", items: { type: "string" }}
                    },
                    required: ["score", "analysis", "strengths", "suggestions"]
                  },
                  activation: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      analysis: { type: "string" },
                      strengths: { type: "array", items: { type: "string" }},
                      suggestions: { type: "array", items: { type: "string" }}
                    },
                    required: ["score", "analysis", "strengths", "suggestions"]
                  },
                  engagement: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      analysis: { type: "string" },
                      strengths: { type: "array", items: { type: "string" }},
                      suggestions: { type: "array", items: { type: "string" }}
                    },
                    required: ["score", "analysis", "strengths", "suggestions"]
                  },
                  conversion: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      analysis: { type: "string" },
                      strengths: { type: "array", items: { type: "string" }},
                      suggestions: { type: "array", items: { type: "string" }}
                    },
                    required: ["score", "analysis", "strengths", "suggestions"]
                  }
                },
                required: ["overview", "discovery", "signup", "activation", "engagement", "conversion"]
              }
            },
            required: ["deepScore", "summary", "strengths", "weaknesses", "recommendations", "componentScores", "componentFeedback", "actionPlan", "testing", "journeyAnalysis"]
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