import type { ComponentFeedback } from './componentFeedback';
import type { JourneyAnalysis } from './journeyAnalysis';
import type { Challenge, Solution, ModelType } from './index';
import type { PackageFeature, PricingStrategy } from './package';

export interface Analysis {
  deepScore: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  componentScores: {
    productDescription: number;
    idealUser: number;
    userEndgame: number;
    challenges: number;
    solutions: number;
    modelSelection: number;
    packageDesign: number;
    pricingStrategy: number;
  };
  componentFeedback: {
    productDescription: ComponentFeedback;
    idealUser: ComponentFeedback;
    userEndgame: ComponentFeedback;
    challenges: ComponentFeedback;
    solutions: ComponentFeedback;
    modelSelection: ComponentFeedback;
    packageDesign: {
      strengths: string[];
      recommendations: string[];
      analysis: string;
      balanceScore: number;
    };
    pricingStrategy: {
      strengths: string[];
      recommendations: string[];
      analysis: string;
      conversionPotential: number;
    };
  };
  actionPlan: {
    immediate: string[];
    medium: string[];
    long: string[];
    people: string[];
    process: string[];
    technology: string[];
  };
  testing: {
    abTests: string[];
    metrics: string[];
  };
  journeyAnalysis: JourneyAnalysis;
}

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
  challenges: Challenge[];
  solutions: Solution[];
  selectedModel: ModelType;
  packages?: {
    features: PackageFeature[];
    pricingStrategy: PricingStrategy;
  };
}