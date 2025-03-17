export interface ComponentFeedback {
  strengths: string[];
  recommendations: string[];
  analysis?: string;
  metrics?: {
    [key: string]: number;
  };
}