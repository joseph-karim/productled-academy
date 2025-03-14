export type SolutionType = 'product' | 'resource' | 'content';

export interface Solution {
  id: string;
  text: string;
  type: SolutionType;
  cost: 'low' | 'medium' | 'high';
  challengeId: string;
}