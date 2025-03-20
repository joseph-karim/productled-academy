import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedAnalysis } from '../services/supabase';
import { Analysis } from './Analysis';
import { Loader2 } from 'lucide-react';
import { useFormStore } from '../store/formStore';

export function SharedAnalysis() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useFormStore();

  useEffect(() => {
    const loadSharedAnalysis = async () => {
      if (!shareId) return;

      try {
        setLoading(true);
        const analysis = await getSharedAnalysis(shareId);
        
        // Update store with shared analysis data
        store.setProductDescription(analysis.product_description);
        store.setIdealUser(analysis.ideal_user);
        if (analysis.outcomes) store.updateOutcome('beginner', analysis.outcomes[0]?.text);
        store.setSelectedModel(analysis.selected_model);
        store.setAnalysis(analysis.analysis_results);
        
      } catch (error) {
        console.error('Error loading shared analysis:', error);
        setError('This analysis is no longer available or has been made private.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedAnalysis();
  }, [shareId, store]);

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
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <Analysis />;
}