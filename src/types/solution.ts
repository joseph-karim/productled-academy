import type { UserLevel } from './userLevel';

export type SolutionType = 'product' | 'resource' | 'content';
export type SolutionCost = 'low' | 'medium' | 'high';
export type SolutionImpact = 'low' | 'medium' | 'high';

export interface Solution {
  id: string;
  text: string;
  type: SolutionType;
  cost: SolutionCost;
  impact: SolutionImpact;
  challengeId: string;
}