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
  const { websiteUrl, initialContext, websiteScraping } = useOfferStore();
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
            initialContext,
            websiteScraping.status === 'completed' ? {
              coreOffer: websiteScraping.coreOffer,
              targetAudience: websiteScraping.targetAudience,
              keyProblem: websiteScraping.keyProblem,
              valueProposition: websiteScraping.valueProposition,
              keyFeatures: websiteScraping.keyFeatures
            } : undefined
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
  }, [websiteUrl, initialContext, websiteScraping]);

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

      {/* Show website scraping results if available */}
      {websiteScraping.status === 'completed' && (
        <div className="mt-8">
          <div className="bg-[#222222] p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Website Analysis</h3>
            <p className="text-gray-300 mb-6">
              We've analyzed your website and extracted the following information.
              Use this to help refine your offer.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Core Offer/Product</h4>
                <p className="text-gray-300">{websiteScraping.coreOffer}</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Target Audience</h4>
                <p className="text-gray-300">{websiteScraping.targetAudience}</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Key Problem Solved</h4>
                <p className="text-gray-300">{websiteScraping.keyProblem}</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Value Proposition</h4>
                <p className="text-gray-300">{websiteScraping.valueProposition}</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Key Features/Benefits</h4>
                <ul className="text-gray-300 list-disc list-inside">
                  {websiteScraping.keyFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
