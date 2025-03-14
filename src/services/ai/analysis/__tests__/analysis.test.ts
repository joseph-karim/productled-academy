import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFormData } from '../index';
import { openai } from '../../client';
import type { AnalysisInput } from '../types';

describe('analyzeFormData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockValidInput: AnalysisInput = {
    productDescription: 'Test product',
    idealUser: {
      title: 'Test User',
      description: 'Test description',
      motivation: 'Medium',
      ability: 'Medium',
      traits: ['trait1', 'trait2'],
      impact: 'Test impact'
    },
    userEndgame: 'Test endgame',
    challenges: [
      {
        title: 'Challenge 1',
        description: 'Test challenge',
        magnitude: 3,
        level: 'beginner'
      }
    ],
    solutions: [
      {
        text: 'Solution 1',
        type: 'product',
        cost: 'low'
      }
    ],
    selectedModel: 'freemium',
    freeFeatures: [
      {
        name: 'Feature 1',
        description: 'Test feature'
      }
    ]
  };

  const mockAnalysisResponse = {
    deepScore: {
      desirability: 8,
      effectiveness: 7,
      efficiency: 7,
      polish: 6
    },
    componentScores: {
      productDescription: 85,
      idealUser: 80,
      userEndgame: 75,
      challenges: 70,
      solutions: 75,
      modelSelection: 80,
      freeFeatures: 70,
      userJourney: 65
    },
    componentFeedback: {
      productDescription: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      idealUser: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      userEndgame: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      challenges: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      solutions: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      modelSelection: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      freeFeatures: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      },
      userJourney: {
        strengths: ['Strength 1'],
        recommendations: ['Rec 1']
      }
    },
    strengths: ['Overall strength 1'],
    weaknesses: ['Weakness 1'],
    recommendations: ['Recommendation 1'],
    actionPlan: {
      immediate: ['Action 1'],
      medium: ['Action 1'],
      long: ['Action 1']
    },
    testing: {
      abTests: ['Test 1'],
      metrics: ['Metric 1']
    },
    summary: 'Test summary'
  };

  it('validates required fields', async () => {
    const invalidInput = { ...mockValidInput, productDescription: '' };
    await expect(analyzeFormData(invalidInput))
      .rejects
      .toThrow('Missing required fields for analysis');
  });

  it('handles undefined arrays safely', async () => {
    const inputWithUndefinedArrays = {
      ...mockValidInput,
      challenges: undefined,
      solutions: undefined,
      freeFeatures: undefined
    } as unknown as AnalysisInput;

    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify(mockAnalysisResponse)
          }
        }
      }]
    } as any);

    const result = await analyzeFormData(inputWithUndefinedArrays);
    expect(result).toBeDefined();
    expect(result.deepScore).toBeDefined();
  });

  it('handles malformed API response', async () => {
    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            arguments: 'invalid json'
          }
        }
      }]
    } as any);

    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Failed to parse analysis result');
  });

  it('handles missing fields in API response', async () => {
    const incompleteResponse = { ...mockAnalysisResponse };
    delete (incompleteResponse as any).deepScore;

    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify(incompleteResponse)
          }
        }
      }]
    } as any);

    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Incomplete analysis results: missing deepScore');
  });

  it('handles missing DEEP score components', async () => {
    const incompleteResponse = { 
      ...mockAnalysisResponse,
      deepScore: { desirability: 8 }
    };

    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify(incompleteResponse)
          }
        }
      }]
    } as any);

    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Incomplete analysis results: missing DEEP score components');
  });

  it('successfully processes valid input and response', async () => {
    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify(mockAnalysisResponse)
          }
        }
      }]
    } as any);

    const result = await analyzeFormData(mockValidInput);
    expect(result).toEqual(mockAnalysisResponse);
    expect(result.deepScore.desirability).toBe(8);
    expect(result.componentScores.productDescription).toBe(85);
  });

  it('handles API errors appropriately', async () => {
    vi.spyOn(openai.chat.completions, 'create').mockRejectedValueOnce(new Error('API Error'));
    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Failed to analyze form data');
  });
});