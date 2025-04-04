import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { ReviewSection } from './common/ReviewSection';
import { analyzeInitialContext } from '../services/ai/analysis';

interface ContextReviewProps {
  onEdit: () => void;
  onConfirm: () => void;
  readOnly?: boolean;
}

export function ContextReview({ onEdit, onConfirm, readOnly = false }: ContextReviewProps) {
  const { websiteUrl, initialContext } = useOfferStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    rating: number;
    feedback: string;
    suggestions: string[];
  } | null>(null);

  const reviewData = [
    { label: 'Website URL', value: websiteUrl || 'Not provided' },
    { label: 'Current Offer', value: initialContext.currentOffer },
    { label: 'Target Audience', value: initialContext.targetAudience },
    { label: 'Problem Solved', value: initialContext.problemSolved }
  ];

  useEffect(() => {
    const performAnalysis = async () => {
      if (
        initialContext.currentOffer.trim() ||
        initialContext.targetAudience.trim() ||
        initialContext.problemSolved.trim()
      ) {
        setIsAnalyzing(true);
        try {
          const result = await analyzeInitialContext(
            websiteUrl,
            initialContext
          );
          setAnalysisResult(result);
        } catch (error) {
          console.error('Error analyzing initial context:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    performAnalysis();
  }, [websiteUrl, initialContext]);

  const formatFeedback = () => {
    if (!analysisResult) return null;

    let content = analysisResult.feedback;
    
    if (analysisResult.suggestions && analysisResult.suggestions.length > 0) {
      content += '\n\nSuggestions:\n';
      analysisResult.suggestions.forEach((suggestion, index) => {
        content += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    return content;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Review Your Context</h2>
        <p className="text-gray-300">
          Let's review the information you've provided about your offer. This will help us
          create a more tailored experience as you build your irresistible offer.
        </p>
      </div>

      <ReviewSection
        title="Initial Context"
        subtitle="Here's the information you've provided about your product or service."
        data={reviewData}
        aiFeedback={{
          loading: isAnalyzing,
          content: formatFeedback(),
          rating: analysisResult?.rating
        }}
        onEdit={onEdit}
        onConfirm={onConfirm}
        isReadOnly={readOnly}
      />
    </div>
  );
}
