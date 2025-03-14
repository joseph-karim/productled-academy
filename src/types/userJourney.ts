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
}