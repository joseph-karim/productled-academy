export interface JourneyStageAnalysis {
  score: number;
  analysis: string;
  strengths: string[];
  suggestions: string[];
}

export interface JourneyAnalysis {
  overview: string;
  discovery: JourneyStageAnalysis;
  signup: JourneyStageAnalysis;
  activation: JourneyStageAnalysis;
  engagement: JourneyStageAnalysis;
  conversion: JourneyStageAnalysis;
}

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
  recommendations?: string[];
  componentScores: {
    productDescription: number;
    idealUser: number;
    userEndgame: number;
    challenges: number;
    solutions: number;
    modelSelection: number;
    userJourney: number;
  };
  componentFeedback: {
    productDescription: {
      strengths: string[];
      recommendations: string[];
    };
    idealUser: {
      strengths: string[];
      recommendations: string[];
    };
    userEndgame: {
      strengths: string[];
      recommendations: string[];
    };
    challenges: {
      strengths: string[];
      recommendations: string[];
    };
    solutions: {
      strengths: string[];
      recommendations: string[];
    };
    modelSelection: {
      strengths: string[];
      recommendations: string[];
      analysis?: string;
      considerations?: string[];
    };
    userJourney: {
      strengths: string[];
      recommendations: string[];
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
  userJourney?: UserJourney;
}

export interface Challenge {
  id?: string;
  title: string;
  description?: string;
  level?: string;
  magnitude?: string | number;
}

export interface Solution {
  id?: string;
  challengeId?: string;
  text: string;
  type: string;
  cost: string;
}

export type ModelType = 'opt-in-trial' | 'opt-out-trial' | 'usage-trial' | 'freemium' | 'new-product' | 'sandbox';

export interface UserJourney {
  discovery: {
    problem: string;
    trigger: string;
    initialThought: string;
  };
  signup: {
    friction: string;
    timeToValue: string;
    guidance: string[];
  };
  activation: {
    firstWin: string;
    ahaFeature: string;
    timeToSuccess: string;
  };
  engagement: {
    coreTasks: string[];
    collaboration: string[];
    limitations: string[];
  };
  conversion: {
    triggers: string[];
    nextFeatures: string[];
  };
  [key: string]: any;
}