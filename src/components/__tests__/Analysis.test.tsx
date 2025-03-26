import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Analysis } from '../Analysis';
import { useFormStore } from '../../store/formStore';
import { usePackageStore } from '../../store/packageStore';
import { saveAnalysis, updateAnalysis } from '../../services/supabase';
import type { PricingStrategy } from '../../types/package';

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock services
vi.mock('../../services/supabase', () => ({
  saveAnalysis: vi.fn(),
  updateAnalysis: vi.fn()
}));

// Mock stores
vi.mock('../../store/formStore', () => ({
  useFormStore: vi.fn()
}));

vi.mock('../../store/packageStore', () => ({
  usePackageStore: vi.fn()
}));

describe('Analysis Component - Pricing Strategy', () => {
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

  const mockFormStore = {
    title: 'Test Analysis',
    productDescription: 'Test description',
    analysis: null,
    setAnalysis: vi.fn()
  };

  const mockPackageStore = {
    features: [],
    pricingStrategy: mockPricingStrategy
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormStore as jest.Mock).mockReturnValue(mockFormStore);
    (usePackageStore as jest.Mock).mockReturnValue(mockPackageStore);
  });

  it('should include pricing strategy when saving analysis', async () => {
    (saveAnalysis as jest.Mock).mockResolvedValue({ id: 'test-id' });
    
    render(<Analysis />);
    
    const saveButton = screen.getByText(/save analysis/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveAnalysis).toHaveBeenCalledWith(expect.objectContaining({
        pricingStrategy: mockPricingStrategy
      }));
    });
  });

  it('should include pricing strategy when updating analysis', async () => {
    const mockAnalysis = {
      id: 'test-id',
      ...mockFormStore,
      pricingStrategy: mockPricingStrategy
    };

    (useFormStore as jest.Mock).mockReturnValue({
      ...mockFormStore,
      analysis: mockAnalysis
    });

    render(<Analysis />);
    
    const saveButton = screen.getByText(/save analysis/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateAnalysis).toHaveBeenCalledWith('test-id', expect.objectContaining({
        pricingStrategy: mockPricingStrategy
      }));
    });
  });

  it('should handle missing pricing strategy gracefully', async () => {
    const storeWithoutStrategy = {
      ...mockPackageStore,
      pricingStrategy: undefined
    };
    (usePackageStore as jest.Mock).mockReturnValue(storeWithoutStrategy);

    render(<Analysis />);
    
    const saveButton = screen.getByText(/save analysis/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveAnalysis).toHaveBeenCalledWith(expect.not.objectContaining({
        pricingStrategy: expect.anything()
      }));
    });
  });

  it('should preserve pricing strategy in read-only mode', () => {
    render(<Analysis isShared={true} />);
    
    const saveButton = screen.queryByText(/save analysis/i);
    expect(saveButton).not.toBeInTheDocument();
  });
});