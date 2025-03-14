export interface ComponentAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  metrics: {
    [key: string]: number;
  };
}

export interface ComponentAnalysisMap {
  productDescription: ComponentAnalysis;
  idealUser: ComponentAnalysis;
  userEndgame: ComponentAnalysis;
  challenges: ComponentAnalysis;
  solutions: ComponentAnalysis;
  modelSelection: ComponentAnalysis;
  freeFeatures: ComponentAnalysis;
  userJourney: ComponentAnalysis;
}

export interface AnalysisResult {
  deepScore: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
  components: ComponentAnalysisMap;
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