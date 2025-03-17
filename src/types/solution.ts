export type SolutionType = 'product' | 'resource' | 'content';
export type SolutionCost = 'low' | 'medium' | 'high';
export type SolutionImpact = 'low' | 'medium' | 'high';
export type SolutionCategory = 'core' | 'challenge';

export interface Solution {
  id: string;
  text: string;
  type: SolutionType;
  cost: SolutionCost;
  impact: SolutionImpact;
  category: SolutionCategory;
  challengeId?: string; // Optional for core features
}