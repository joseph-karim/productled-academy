export interface IdealUser {
  title: string;
  description: string;
  motivation: 'Low' | 'Medium' | 'High';
  ability: 'Low' | 'Medium' | 'High';
  traits: string[];
  impact: string;
}