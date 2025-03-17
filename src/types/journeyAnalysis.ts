export interface JourneyStageAnalysis {
  score: number;
  analysis: string;
  strengths: string[];
  suggestions: string[];
}

export interface JourneyAnalysis {
  overview: string;
  discovery: JourneyStageAnalysis;
  signup: JourneyStageAnalysis;
  activation: JourneyStageAnalysis;
  engagement: JourneyStageAnalysis;
  conversion: JourneyStageAnalysis;
}