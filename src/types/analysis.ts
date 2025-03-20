export interface Analysis {
  id?: string; // Add optional ID field
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