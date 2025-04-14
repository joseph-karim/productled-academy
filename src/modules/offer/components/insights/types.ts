export type InsightCategory = 'customer' | 'result' | 'better' | 'risk';

export interface InsightOption {
  id: string;
  text: string;
  isSelected?: boolean;
  feedback?: 'positive' | 'negative' | null;
}

export interface InsightResult {
  category: InsightCategory;
  selectedOption: string;
  feedback: Record<string, 'positive' | 'negative' | null>;
  followUpAnswer?: string;
}

export interface InsightState {
  results: Record<InsightCategory, InsightResult | null>;
  currentCategory: InsightCategory;
  isComplete: boolean;
}
