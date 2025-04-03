import type { AnalysisFunction } from './types';

export const analysisFunction: AnalysisFunction = {
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
              recommendations: { type: "array", items: { type: "string" }},
              analysis: { type: "string" },
              considerations: { type: "array", items: { type: "string" }}
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
};