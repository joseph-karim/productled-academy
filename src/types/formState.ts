import type { UserOutcome } from './userOutcome';
import type { Challenge } from './challenge';
import type { Solution } from './solution';
import type { ModelType } from './modelType';
import type { Feature } from './feature';
import type { IdealUser } from './idealUser';
import type { UserJourney } from './userJourney';
import type { Analysis } from './analysis';

export interface FormState {
  productDescription: string;
  idealUser?: IdealUser;
  outcomes: UserOutcome[];
  challenges: Challenge[];
  solutions: Solution[];
  selectedModel: ModelType | null;
  freeFeatures: Feature[];
  userJourney?: UserJourney;
  analysis: Analysis | null;
}