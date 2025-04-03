export type PackageTier = 'free' | 'paid';

export interface PackageFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'value-demo' | 'connection' | 'educational';
  tier: PackageTier;
  upgradeTrigger?: string;
  limits?: {
    type: 'quantity' | 'time' | 'capability';
    value: string;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  billingPeriod: 'monthly' | 'annual';
  features: PackageFeature[];
  valueProposition: string;
  targetUser: string;
  upgradeTriggers: string[];
}

export interface PricingStrategy {
  model: 'freemium' | 'free-trial' | 'open-core';
  basis: 'per-user' | 'per-usage' | 'flat-rate';
  freePackage: {
    features: PackageFeature[];
    limitations: string[];
    conversionGoals: string[];
  };
  paidPackage: {
    features: PackageFeature[];
    valueMetrics: string[];
    targetConversion: number;
  };
}