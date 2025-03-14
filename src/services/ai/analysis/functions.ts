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
};