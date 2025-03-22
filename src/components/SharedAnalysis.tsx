import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedAnalysis } from '../services/supabase';
import { Analysis } from './Analysis';
import { Loader2, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';

export function SharedAnalysis() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useFormStore();
  const packageStore = usePackageStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSharedAnalysis = async () => {
      if (!shareId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const analysis = await getSharedAnalysis(shareId);
        
        if (!analysis) {
          throw new Error('Analysis not found');
        }

        // Update store with shared analysis data
        store.setProductDescription(analysis.product_description);
        
        if (analysis.ideal_user) {
          store.setIdealUser(analysis.ideal_user);
        }
        
        if (analysis.selected_model) {
          store.setSelectedModel(analysis.selected_model);
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

        if (analysis.features) {
          analysis.features.forEach((feature: any) => {
            packageStore.addFeature(feature);
          });
        }

        if (analysis.user_journey) {
          store.setUserJourney(analysis.user_journey);
        }

        if (analysis.analysis_results) {
          store.setAnalysis(analysis.analysis_results);
        }
        
      } catch (error) {
        console.error('Error loading shared analysis:', error);
        setError('This analysis is no longer available or has been made private.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedAnalysis();
  }, [shareId, store, packageStore, navigate]);

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
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <Analysis isShared />;
}