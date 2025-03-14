export interface Feature {
  id: string;
  name: string;
  description: string;
  category?: 'core' | 'value-demo' | 'connection' | 'educational';
  deepScore?: {
    desirability: number;
    effectiveness: number;
    efficiency: number;
    polish: number;
  };
}