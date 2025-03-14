import type { UserLevel } from './userLevel';

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  magnitude: number;
  level: UserLevel;
}