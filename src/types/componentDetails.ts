export interface ComponentDetails {
  productDescription: {
    strengths: string[];
    recommendations: string[];
    keyMetrics: string[];
  };
  userEndgame: {
    strengths: string[];
    recommendations: string[];
    progressionPoints: string[];
  };
  challenges: {
    strengths: string[];
    recommendations: string[];
    distribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
  };
  solutions: {
    strengths: string[];
    recommendations: string[];
    breakdown: {
      product: number;
      resource: number;
      content: number;
    };
  };
  modelSelection: {
    strengths: string[];
    recommendations: string[];
    fitScore: number;
    alternatives: string[];
  };
  freeFeatures: {
    strengths: string[];
    recommendations: string[];
    categoryBreakdown: {
      core: number;
      valueDemo: number;
      connection: number;
      educational: number;
    };
  };
}