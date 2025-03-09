export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export type UserOutcome = {
  level: UserLevel;
  text: string;
};

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  magnitude: number;
  level: UserLevel;
};

export type SolutionType = 'product' | 'resource' | 'content';

export type Solution = {
  id: string;
  text: string;
  type: SolutionType;
  cost: 'low' | 'medium' | 'high';
  challengeId: string;
};

export type ModelType = 'opt-in-trial' | 'opt-out-trial' | 'usage-trial' | 'freemium' | 'new-product' | 'sandbox';

export type Feature = {
  id: string;
  name: string;
  description: string;
  category?: 'core' | 'value-demo' | 'connection' | 'educational';
  deepScore?: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
};

export type FormState = {
  productDescription: string;
  outcomes: UserOutcome[];
  challenges: Challenge[];
  solutions: Solution[];
  selectedModel: ModelType | null;
  freeFeatures: Feature[];
};