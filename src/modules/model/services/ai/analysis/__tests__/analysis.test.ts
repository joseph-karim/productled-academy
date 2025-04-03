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
        id: 'c1',
        title: 'Challenge 1',
        description: 'Test challenge',
        magnitude: 3,
        level: 'beginner'
      }
    ],
    solutions: [
      {
        id: 's1',
        text: 'Solution 1',
        type: 'product',
        cost: 'low',
        impact: 'high',
        category: 'core'
      }
    ],
    selectedModel: 'freemium'
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
    } as any);

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
    } as any);

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