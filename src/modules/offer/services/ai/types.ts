export interface ScorecardItem {
  item: string;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  justification: string;
}

export interface OfferAnalysisInput {
  title: string;
  userSuccess: {
    statement: string;
  };
  topResults: {
    tangible: string;
    intangible: string;
    improvement: string;
  };
  advantages: Array<{
    id: string;
    text: string;
    description?: string;
  }>;
  risks: Array<{
    id: string;
    text: string;
  }>;
  assurances: Array<{
    id: string;
    riskId: string;
    text: string;
  }>;
  heroSection: {
    tagline: string;
    subCopy: string;
    ctaText: string;
    visualDesc?: string;
    socialProofExample?: string;
  };
  featuresSection: {
    title: string;
    description: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  problemSection: {
    alternativesProblems: string;
    underlyingProblem: string;
  };
  solutionSection: {
    steps: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  socialProof: {
    testimonials: string[];
    caseStudies: string[];
    logos: string[];
    numbers: string[];
  };
  ctaSection: {
    mainCtaText: string;
    surroundingCopy?: string;
  };
}

export interface OfferAnalysisResult {
  scorecard: ScorecardItem[];
  feedback: string;
  nextSteps: string[];
}

export interface ActionStepSuggestion {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'minimal' | 'moderate' | 'significant';
  impact: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short-term' | 'long-term';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
} 