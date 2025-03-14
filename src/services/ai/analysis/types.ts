import type { Analysis } from '../../../types';

export interface AnalysisInput {
  productDescription: string;
  idealUser: {
    title: string;
    description: string;
    motivation: 'Low' | 'Medium' | 'High';
    ability: 'Low' | 'Medium' | 'High';
    traits: string[];
    impact: string;
  };
  userEndgame: string;
  challenges: Array<{
    title: string;
    description?: string;
    magnitude: number;
    level: string;
  }>;
  solutions: Array<{
    text: string;
    type?: string;
    cost?: string;
  }>;
  selectedModel: string;
  freeFeatures: Array<{
    name?: string;
    description?: string;
  }>;
  userJourney?: any;
}

export interface AnalysisPrompt {
  role: 'system' | 'user';
  content: string;
}

export interface AnalysisParameters {
  type: 'object';
  properties: {
    deepScore: {
      type: 'object';
      properties: {
        desirability: { type: 'number'; minimum: 0; maximum: 10 };
        effectiveness: { type: 'number'; minimum: 0; maximum: 10 };
        efficiency: { type: 'number'; minimum: 0; maximum: 10 };
        polish: { type: 'number'; minimum: 0; maximum: 10 };
      };
      required: string[];
    };
    componentScores: {
      type: 'object';
      properties: {
        [key: string]: { type: 'number'; minimum: 0; maximum: 100 };
      };
      required: string[];
    };
    componentFeedback: {
      type: 'object';
      properties: {
        [key: string]: {
          type: 'object';
          properties: {
            strengths: { type: 'array'; items: { type: 'string' } };
            recommendations: { type: 'array'; items: { type: 'string' } };
          };
          required: string[];
        };
      };
      required: string[];
    };
    strengths: { type: 'array'; items: { type: 'string' } };
    weaknesses: { type: 'array'; items: { type: 'string' } };
    recommendations: { type: 'array'; items: { type: 'string' } };
    actionPlan: {
      type: 'object';
      properties: {
        immediate: { type: 'array'; items: { type: 'string' } };
        medium: { type: 'array'; items: { type: 'string' } };
        long: { type: 'array'; items: { type: 'string' } };
      };
      required: string[];
    };
    testing: {
      type: 'object';
      properties: {
        abTests: { type: 'array'; items: { type: 'string' } };
        metrics: { type: 'array'; items: { type: 'string' } };
      };
      required: string[];
    };
    summary: { type: 'string' };
  };
  required: string[];
}

export interface AnalysisFunction {
  name: string;
  description: string;
  parameters: AnalysisParameters;
}