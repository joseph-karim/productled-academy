import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PackageFeature, PricingTier, PricingStrategy } from '../types/package';

interface PackageState {
  features: PackageFeature[];
  pricingTiers: PricingTier[];
  pricingStrategy: PricingStrategy | null;
  processingState: {
    [key: string]: boolean;
  };
  error: string | null;
  
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
  
  // Error Handling
  setError: (error: string | null) => void;
  
  // Reset State
  reset: () => void;
}

const initialState = {
  features: [],
  pricingTiers: [],
  pricingStrategy: null,
  processingState: {},
  error: null
};

export const usePackageStore = create<PackageState>()(
  devtools(
    (set) => ({
      ...initialState,

      addFeature: (feature) =>
        set((state) => ({
          features: [...state.features, feature],
          error: null
        })),

      updateFeature: (id, feature) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, ...feature } : f
          ),
          error: null
        })),

      removeFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== id),
          error: null
        })),

      addPricingTier: (tier) =>
        set((state) => ({
          pricingTiers: [...state.pricingTiers, tier],
          error: null
        })),

      updatePricingTier: (id, tier) =>
        set((state) => ({
          pricingTiers: state.pricingTiers.map((t) =>
            t.id === id ? { ...t, ...tier } : t
          ),
          error: null
        })),

      removePricingTier: (id) =>
        set((state) => ({
          pricingTiers: state.pricingTiers.filter((t) => t.id !== id),
          error: null
        })),

      setPricingStrategy: (strategy) =>
        set({ 
          pricingStrategy: strategy,
          error: null
        }),

      setProcessingState: (state) =>
        set((prev) => ({
          processingState: { ...prev.processingState, ...state }
        })),

      setError: (error) => set({ error }),

      reset: () => set(initialState)
    }),
    { name: 'package-store' }
  )
);