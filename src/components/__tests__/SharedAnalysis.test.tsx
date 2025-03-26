import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SharedAnalysis } from '../SharedAnalysis';
import { useFormStore } from '../../store/formStore';
import { usePackageStore } from '../../store/packageStore';
import { getSharedAnalysis } from '../../services/supabase';
import type { PricingStrategy } from '../../types/package';

// Mock router
vi.mock('react-router-dom', () => ({
  useParams: () => ({ shareId: 'test-share-id' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock services
vi.mock('../../services/supabase', () => ({
  getSharedAnalysis: vi.fn()
}));

// Mock stores
vi.mock('../../store/formStore', () => ({
  useFormStore: vi.fn()
}));

vi.mock('../../store/packageStore', () => ({
  usePackageStore: vi.fn()
}));

describe('SharedAnalysis Component - Pricing Strategy', () => {
  const mockPricingStrategy: PricingStrategy = {
    model: 'freemium',
    basis: 'per-user',
    freePackage: {
      limitations: ['100 users'],
      conversionGoals: ['Team collaboration'],
      features: []
    },
    paidPackage: {
      valueMetrics: ['Active users'],
      targetConversion: 10,
      features: []
    }
  };

  const mockAnalysis = {
    id: 'test-id',
    title: 'Test Analysis',
    product_description: 'Test description',
    pricing_strategy: mockPricingStrategy,
    is_public: true
  };

  const mockFormStore = {
    resetState: vi.fn(),
    setTitle: vi.fn(),
    setProductDescription: vi.fn(),
    setAnalysis: vi.fn()
  };

  const mockPackageStore = {
    reset: vi.fn(),
    setPricingStrategy: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSharedAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);
    (useFormStore as jest.Mock).mockReturnValue(mockFormStore);
    (usePackageStore as jest.Mock).mockReturnValue(mockPackageStore);
  });

  it('should load and set pricing strategy from shared analysis', async () => {
    render(<SharedAnalysis />);

    await waitFor(() => {
      expect(mockPackageStore.setPricingStrategy).toHaveBeenCalledWith(mockPricingStrategy);
    });
  });

  it('should handle missing pricing strategy gracefully', async () => {
    (getSharedAnalysis as jest.Mock).mockResolvedValue({
      ...mockAnalysis,
      pricing_strategy: undefined
    });

    render(<SharedAnalysis />);

    await waitFor(() => {
      expect(mockPackageStore.setPricingStrategy).not.toHaveBeenCalled();
    });
  });

  it('should show error when loading fails', async () => {
    const error = new Error('Failed to load analysis');
    (getSharedAnalysis as jest.Mock).mockRejectedValue(error);

    render(<SharedAnalysis />);

    await waitFor(() => {
      expect(screen.getByText(/no longer available/i)).toBeInTheDocument();
    });
  });

  it('should reset stores before loading new data', async () => {
    render(<SharedAnalysis />);

    await waitFor(() => {
      expect(mockFormStore.resetState).toHaveBeenCalled();
      expect(mockPackageStore.reset).toHaveBeenCalled();
    });
  });
});