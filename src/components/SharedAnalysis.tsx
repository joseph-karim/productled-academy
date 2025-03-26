import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedAnalysis } from '../services/supabase';
import { Analysis } from './Analysis';
import { ErrorBoundary } from './ErrorBoundary';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';
import { Loader2, AlertTriangle } from 'lucide-react';
import { MultiStepForm } from './MultiStepForm';

export function SharedAnalysis() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'steps' | 'analysis'>('steps');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const store = useFormStore();
  const packageStore = usePackageStore();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadSharedAnalysis = async () => {
      if (!shareId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const analysis = await getSharedAnalysis(shareId);
        setAnalysisData(analysis);

        if (!analysis) {
          throw new Error('Analysis not found');
        }

        if (mounted) {
          // Reset stores before loading new data
          store.resetState();
          packageStore.reset();

          // Update form store with shared analysis data
          store.setTitle(analysis.title || 'Untitled Analysis');
          store.setProductDescription(analysis.product_description);
          
          if (analysis.ideal_user) {
            store.setIdealUser(analysis.ideal_user);
          }
          
          if (analysis.outcomes) {
            analysis.outcomes.forEach((outcome: any) => {
              store.updateOutcome(outcome.level, outcome.text);
            });
          }

          if (analysis.challenges) {
            analysis.challenges.forEach((challenge: any) => {
              store.addChallenge(challenge);
            });
          }

          if (analysis.solutions) {
            analysis.solutions.forEach((solution: any) => {
              store.addSolution(solution);
            });
          }

          if (analysis.selected_model) {
            store.setSelectedModel(analysis.selected_model);
          }

          if (analysis.features) {
            analysis.features.forEach((feature: any) => {
              packageStore.addFeature(feature);
            });
          }

          if (analysis.user_journey) {
            store.setUserJourney(analysis.user_journey);
          }

          // Set pricing strategy if available
          if (analysis.pricing_strategy) {
            packageStore.setPricingStrategy(analysis.pricing_strategy);
          }

          if (analysis.analysis_results) {
            store.setAnalysis({
              ...analysis.analysis_results,
              id: analysis.id
            });

            // Set pricing strategy if available
            if (analysis.pricing_strategy) {
              packageStore.setPricingStrategy(analysis.pricing_strategy);
            }
          }
        }
      } catch (error) {
        console.error('Error loading shared analysis:', error);
        if (mounted) {
          setError('This analysis is no longer available or has been made private.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSharedAnalysis();

    return () => {
      mounted = false;
    };
  }, [shareId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Loading shared analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        <div className="bg-[#2A2A2A] border-b border-[#333333] p-4 mb-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-gray-400">
              {analysisData?.title || 'Untitled Analysis'} (Shared View)
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('steps')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'steps'
                    ? 'bg-[#FFD23F] text-[#1C1C1C]'
                    : 'bg-[#1C1C1C] text-gray-400 hover:text-white'
                }`}
              >
                View Steps
              </button>
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'analysis'
                    ? 'bg-[#FFD23F] text-[#1C1C1C]'
                    : 'bg-[#1C1C1C] text-gray-400 hover:text-white'
                }`}
              >
                View Analysis
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'steps' ? (
          <MultiStepForm readOnly />
        ) : (
          <Analysis isShared />
        )}
      </div>
    </ErrorBoundary>
  );
}