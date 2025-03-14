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

export type IdealUser = {
  title: string;
  description: string;
  motivation: 'Low' | 'Medium' | 'High';
  ability: 'Low' | 'Medium' | 'High';
  traits: string[];
  impact: string;
};

export type UserJourney = {
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
};

export type FormState = {
  productDescription: string;
  idealUser?: IdealUser;
  outcomes: UserOutcome[];
  challenges: Challenge[];
  solutions: Solution[];
  selectedModel: ModelType | null;
  freeFeatures: Feature[];
  userJourney?: UserJourney;
};