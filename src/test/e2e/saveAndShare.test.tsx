import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Analysis } from '../../components/Analysis';
import { SharedAnalysis } from '../../components/SharedAnalysis';
import { useFormStore } from '../../store/formStore';
import { usePackageStore } from '../../store/packageStore';
import { saveAnalysis, updateAnalysis, shareAnalysis, getSharedAnalysis } from '../../services/supabase';
import type { PricingStrategy } from '../../types/package';

// Mock all required dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../services/supabase', () => ({
  saveAnalysis: vi.fn(),
  updateAnalysis: vi.fn(),
  shareAnalysis: vi.fn(),
  getSharedAnalysis: vi.fn()
}));

vi.mock('../../store/formStore');
vi.mock('../../store/packageStore');

describe('Save and Share Flow', () => {
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

  const mockAnalysisData = {
    id: 'test-id',
    title: 'Test Analysis',
    productDescription: 'Test Product',
    idealUser: {
      title: 'Test User',
      description: 'Test user description',
      motivation: 'High',
      ability: 'Medium',
      traits: ['Trait 1'],
      impact: 'High impact'
    },
    outcomes: [
      { level: 'beginner', text: 'Beginner outcome' },
      { level: 'intermediate', text: 'Intermediate outcome' }
    ],
    challenges: [
      { id: 'c1', title: 'Challenge 1', level: 'beginner', magnitude: 3 }
    ],
    solutions: [
      { id: 's1', text: 'Solution 1', type: 'product', cost: 'low', impact: 'high' }
    ],
    selectedModel: 'freemium',
    features: [
      { id: 'f1', name: 'Feature 1', description: 'Test feature', category: 'core', tier: 'free' }
    ],
    pricingStrategy: mockPricingStrategy,
    analysis: {
      deepScore: { desirability: 8, effectiveness: 7, efficiency: 7, polish: 6 },
      summary: 'Test summary'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock form store
    (useFormStore as jest.Mock).mockReturnValue({
      ...mockAnalysisData,
      setTitle: vi.fn(),
      setProductDescription: vi.fn(),
      setAnalysis: vi.fn(),
      resetState: vi.fn()
    });

    // Mock package store
    (usePackageStore as jest.Mock).mockReturnValue({
      features: mockAnalysisData.features,
      pricingStrategy: mockAnalysisData.pricingStrategy,
      setPricingStrategy: vi.fn(),
      reset: vi.fn()
    });

    // Mock Supabase responses
    (saveAnalysis as jest.Mock).mockResolvedValue({ id: 'test-id', ...mockAnalysisData });
    (updateAnalysis as jest.Mock).mockResolvedValue({ id: 'test-id', ...mockAnalysisData });
    (shareAnalysis as jest.Mock).mockResolvedValue('share-test-id');
    (getSharedAnalysis as jest.Mock).mockResolvedValue({ ...mockAnalysisData, is_public: true });
  });

  describe('Saving Flow', () => {
    it('should save complete analysis with all data', async () => {
      render(
        <MemoryRouter>
          <Analysis />
        </MemoryRouter>
      );

      // Click save button
      const saveButton = screen.getByText(/save analysis/i);
      fireEvent.click(saveButton);

      // Verify all data is included in save
      await waitFor(() => {
        expect(saveAnalysis).toHaveBeenCalledWith(expect.objectContaining({
          title: mockAnalysisData.title,
          productDescription: mockAnalysisData.productDescription,
          idealUser: mockAnalysisData.idealUser,
          outcomes: mockAnalysisData.outcomes,
          challenges: mockAnalysisData.challenges,
          solutions: mockAnalysisData.solutions,
          selectedModel: mockAnalysisData.selectedModel,
          features: mockAnalysisData.features,
          pricingStrategy: mockAnalysisData.pricingStrategy
        }));
      });

      // Verify success message
      expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument();
    });

    it('should handle save errors gracefully', async () => {
      const error = new Error('Failed to save');
      (saveAnalysis as jest.Mock).mockRejectedValue(error);

      render(
        <MemoryRouter>
          <Analysis />
        </MemoryRouter>
      );

      const saveButton = screen.getByText(/save analysis/i);
      fireEvent.click(saveButton);

      expect(await screen.findByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  describe('Sharing Flow', () => {
    it('should share analysis and copy link', async () => {
      // Mock clipboard
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.assign(navigator, {
        clipboard: mockClipboard
      });

      render(
        <MemoryRouter>
          <Analysis />
        </MemoryRouter>
      );

      // Click share button
      const shareButton = screen.getByText(/share analysis/i);
      fireEvent.click(shareButton);

      // Verify share API called
      await waitFor(() => {
        expect(shareAnalysis).toHaveBeenCalledWith('test-id');
      });

      // Verify link copied
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('share-test-id'));

      // Verify success message
      expect(await screen.findByText(/copied to clipboard/i)).toBeInTheDocument();
    });

    it('should handle share errors gracefully', async () => {
      const error = new Error('Failed to share');
      (shareAnalysis as jest.Mock).mockRejectedValue(error);

      render(
        <MemoryRouter>
          <Analysis />
        </MemoryRouter>
      );

      const shareButton = screen.getByText(/share analysis/i);
      fireEvent.click(shareButton);

      expect(await screen.findByText(/failed to share/i)).toBeInTheDocument();
    });
  });

  describe('Shared View', () => {
    it('should load and display shared analysis correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/share/share-test-id']}>
          <Routes>
            <Route path="/share/:shareId" element={<SharedAnalysis />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify data loaded
      await waitFor(() => {
        expect(getSharedAnalysis).toHaveBeenCalledWith('share-test-id');
      });

      // Verify stores updated
      expect(useFormStore().setTitle).toHaveBeenCalledWith(mockAnalysisData.title);
      expect(useFormStore().setProductDescription).toHaveBeenCalledWith(mockAnalysisData.productDescription);
      expect(usePackageStore().setPricingStrategy).toHaveBeenCalledWith(mockAnalysisData.pricingStrategy);

      // Verify read-only mode
      expect(screen.queryByText(/save analysis/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/share analysis/i)).not.toBeInTheDocument();
    });

    it('should handle invalid share links', async () => {
      (getSharedAnalysis as jest.Mock).mockRejectedValue(new Error('Analysis not found'));

      render(
        <MemoryRouter initialEntries={['/share/invalid-id']}>
          <Routes>
            <Route path="/share/:shareId" element={<SharedAnalysis />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(/no longer available/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    it('should preserve all data when switching between views', async () => {
      const { rerender } = render(
        <MemoryRouter>
          <Analysis />
        </MemoryRouter>
      );

      // Save analysis
      const saveButton = screen.getByText(/save analysis/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(saveAnalysis).toHaveBeenCalled();
      });

      // Switch to shared view
      rerender(
        <MemoryRouter initialEntries={['/share/share-test-id']}>
          <Routes>
            <Route path="/share/:shareId" element={<SharedAnalysis />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify all data preserved
      await waitFor(() => {
        expect(getSharedAnalysis).toHaveBeenCalledWith('share-test-id');
      });

      // Verify stores contain correct data
      expect(useFormStore().title).toBe(mockAnalysisData.title);
      expect(useFormStore().productDescription).toBe(mockAnalysisData.productDescription);
      expect(usePackageStore().pricingStrategy).toEqual(mockAnalysisData.pricingStrategy);
    });
  });
});