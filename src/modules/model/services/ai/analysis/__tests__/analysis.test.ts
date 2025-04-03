import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFormData } from '../index';
import { openai } from '../../client';
import type { AnalysisInput as BaseAnalysisInput, Challenge, Solution } from '../types';
import type { PackageFeature, PricingStrategy } from '../../../../types/package';

interface AnalysisInput extends BaseAnalysisInput {
  packages: {
    features: PackageFeature[];
    pricingStrategy: PricingStrategy;
  };
}

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
        id: 'c1',
        title: 'Challenge 1',
        description: 'Test challenge',
        magnitude: 3,
        level: 'beginner'
      }
    ] as Challenge[],
    solutions: [
      {
        id: 's1',
        text: 'Solution 1',
        type: 'product',
        cost: 'low',
        impact: 'high',
        category: 'core'
      }
    ] as any[],
    selectedModel: 'freemium',
    packages: { 
        features: [], 
        pricingStrategy: { 
            model: 'freemium', 
            basis: 'flat-rate', 
            freePackage: { features: [], limitations: [], conversionGoals: [] },
            paidPackage: { features: [], valueMetrics: [], targetConversion: 0 }
        }
    }
  };

  it('validates required fields', async () => {
    const invalidInput = { ...mockValidInput, productDescription: '' };
    await expect(analyzeFormData(invalidInput))
      .rejects
      .toThrow('Missing required field: productDescription');
  });

  it('handles malformed API response', async () => {
    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            name: 'provide_analysis',
            arguments: 'invalid json'
          }
        }
      }]
    } as unknown as Awaited<ReturnType<typeof openai.chat.completions.create>>);

    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Failed to parse analysis result');
  });

  it('handles missing fields in API response', async () => {
    const incompleteResponse = {
      summary: 'Test summary',
      strengths: [],
      weaknesses: [],
      recommendations: [],
      componentScores: {},
      componentFeedback: {},
      actionPlan: {},
      testing: {},
      journeyAnalysis: {}
    };

    vi.spyOn(openai.chat.completions, 'create').mockResolvedValueOnce({
      choices: [{
        message: {
          function_call: {
            name: 'provide_analysis',
            arguments: JSON.stringify(incompleteResponse)
          }
        }
      }]
    } as unknown as Awaited<ReturnType<typeof openai.chat.completions.create>>);

    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Failed to parse analysis result');
  });

  it('handles API errors appropriately', async () => {
    vi.spyOn(openai.chat.completions, 'create').mockRejectedValueOnce(new Error('API Error'));
    await expect(analyzeFormData(mockValidInput))
      .rejects
      .toThrow('Failed to analyze form data');
  });
});