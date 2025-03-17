import { create } from 'zustand';
import type { PackageFeature, PricingTier, PricingStrategy } from '../types/package';

interface PackageState {
  features: PackageFeature[];
  pricingTiers: PricingTier[];
  pricingStrategy: PricingStrategy | null;
  processingState: {
    [key: string]: boolean;
  };
  
  // Feature Management
  addFeature: (feature: PackageFeature) => void;
  updateFeature: (id: string, feature: Partial<PackageFeature>) => void;
  removeFeature: (id: string) => void;
  
  // Pricing Tier Management
  addPricingTier: (tier: PricingTier) => void;
  updatePricingTier: (id: string, tier: Partial<PricingTier>) => void;
  removePricingTier: (id: string) => void;
  
  // Strategy Management
  setPricingStrategy: (strategy: PricingStrategy) => void;
  
  // Processing State
  setProcessingState: (state: { [key: string]: boolean }) => void;
}

export const usePackageStore = create<PackageState>((set) => ({
  features: [],
  pricingTiers: [],
  pricingStrategy: null,
  processingState: {},

  addFeature: (feature) =>
    set((state) => ({
      features: [...state.features, feature],
    })),

  updateFeature: (id, feature) =>
    set((state) => ({
      features: state.features.map((f) =>
        f.id === id ? { ...f, ...feature } : f
      ),
    })),

  removeFeature: (id) =>
    set((state) => ({
      features: state.features.filter((f) => f.id !== id),
    })),

  addPricingTier: (tier) =>
    set((state) => ({
      pricingTiers: [...state.pricingTiers, tier],
    })),

  updatePricingTier: (id, tier) =>
    set((state) => ({
      pricingTiers: state.pricingTiers.map((t) =>
        t.id === id ? { ...t, ...tier } : t
      ),
    })),

  removePricingTier: (id) =>
    set((state) => ({
      pricingTiers: state.pricingTiers.filter((t) => t.id !== id),
    })),

  setPricingStrategy: (strategy) =>
    set({ pricingStrategy: strategy }),

  setProcessingState: (state) =>
    set((prev) => ({
      processingState: { ...prev.processingState, ...state },
    })),
}));