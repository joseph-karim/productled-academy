// Basic package store implementation
import { create } from 'zustand';

export interface PackageState {
  features: any[];
  pricingStrategy: any;
  
  setFeatures: (features: any[]) => void;
  setPricingStrategy: (strategy: any) => void;
}

export const usePackageStore = create<PackageState>((set) => ({
  features: [],
  pricingStrategy: null,
  
  setFeatures: (features) => set({ features }),
  setPricingStrategy: (pricingStrategy) => set({ pricingStrategy }),
}));