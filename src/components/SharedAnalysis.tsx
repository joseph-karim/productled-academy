import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedAnalysis, debugSharedAnalysis } from '../services/supabase';
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
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSharedAnalysis = async () => {
      if (!shareId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading shared analysis with ID:', shareId);
        
        const analysis = await getSharedAnalysis(shareId);
        console.log('Received shared analysis data:', {
          exists: !!analysis,
          id: analysis?.id,
          hasResults: !!analysis?.analysis_results,
          hasPricingStrategy: !!analysis?.pricing_strategy
        });
        
        setAnalysisData(analysis);

        if (!analysis) {
          throw new Error('Analysis not found');
        }

        if (mounted) {
          // Only reset stores after confirming we have valid data
          console.log('Resetting stores and loading shared data');
          store.resetState();
          packageStore.reset();

          // Update form store with shared analysis data
          store.setTitle(analysis.title || 'Untitled Analysis');
          
          if (analysis.product_description) {
            console.log('Setting product description');
            store.setProductDescription(analysis.product_description);
          }
          
          if (analysis.ideal_user) {
            console.log('Setting ideal user');
            store.setIdealUser(analysis.ideal_user);
          }
          
          if (analysis.outcomes && Array.isArray(analysis.outcomes)) {
            console.log('Setting outcomes:', analysis.outcomes.length);
            analysis.outcomes.forEach((outcome: any) => {
              store.updateOutcome(outcome.level, outcome.text);
            });
          }

          if (analysis.challenges && Array.isArray(analysis.challenges)) {
            console.log('Setting challenges:', analysis.challenges.length);
            analysis.challenges.forEach((challenge: any) => {
              store.addChallenge(challenge);
            });
          }

          if (analysis.solutions && Array.isArray(analysis.solutions)) {
            console.log('Setting solutions:', analysis.solutions.length);
            analysis.solutions.forEach((solution: any) => {
              store.addSolution(solution);
            });
          }

          if (analysis.selected_model) {
            console.log('Setting selected model:', analysis.selected_model);
            store.setSelectedModel(analysis.selected_model);
          }

          if (analysis.features && Array.isArray(analysis.features)) {
            console.log('Setting features:', analysis.features.length);
            analysis.features.forEach((feature: any) => {
              packageStore.addFeature(feature);
            });
          }

          if (analysis.user_journey) {
            console.log('Setting user journey');
            store.setUserJourney(analysis.user_journey);
          }

          // Set pricing strategy if available (only do this once)
          if (analysis.pricing_strategy) {
            console.log('Setting pricing strategy');
            packageStore.setPricingStrategy(analysis.pricing_strategy);
          }

          if (analysis.analysis_results) {
            console.log('Setting analysis results');
            store.setAnalysis({
              ...analysis.analysis_results,
              id: analysis.id
            });
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
  }, [shareId, navigate, store, packageStore]);

  const handleDebugAnalysis = async () => {
    if (!shareId) return;
    
    try {
      setIsDebugging(true);
      const results = await debugSharedAnalysis(shareId);
      setDebugResults(results);
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setIsDebugging(false);
    }
  };

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
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
            >
              Return Home
            </button>
            <button
              onClick={handleDebugAnalysis}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] flex items-center justify-center"
              disabled={isDebugging}
            >
              {isDebugging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                'Diagnose Issue'
              )}
            </button>
          </div>
          
          {debugResults && (
            <div className="mt-4 text-left text-xs bg-[#1C1C1C] p-4 rounded-lg overflow-auto max-h-[300px]">
              <p className="text-gray-400 mb-2">Debug Information:</p>
              <pre className="text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(debugResults, null, 2)}
              </pre>
            </div>
          )}
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