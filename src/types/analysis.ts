export interface Analysis {
  deepScore: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
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
    freeFeatures: number;
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
    };
    freeFeatures: {
      strengths: string[];
      recommendations: string[];
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
  };
  testing: {
    abTests: string[];
    metrics: string[];
  };
  summary: string;
}