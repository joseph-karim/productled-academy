import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { MessageSquare, ThumbsUp, ThumbsDown, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { InsightQuestion } from './InsightQuestion';
import { InsightCategory, InsightResult } from './types';
import { generateInsightOptions, processInsightFeedback, processFollowUpAnswer } from '../../services/ai/insights';

interface InsightPanelProps {
  onClose?: () => void;
}

export function InsightPanel({ onClose }: InsightPanelProps) {
  const {
    userSuccess,
    topResults,
    advantages,
    risks,
    coreOfferNucleus
  } = useOfferStore();

  const [activeCategory, setActiveCategory] = useState<InsightCategory>('customer');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<Record<InsightCategory, string[]>>({} as Record<InsightCategory, string[]>);

  // Generate default options for each category
  const defaultOptions = {
    customer: [
      { id: 'a', text: userSuccess.statement || coreOfferNucleus.targetAudience },
      { id: 'b', text: 'Loading alternative...' }
    ],
    result: [
      { id: 'a', text: topResults.tangible || coreOfferNucleus.desiredResult },
      { id: 'b', text: 'Loading alternative...' }
    ],
    better: [
      { id: 'a', text: advantages[0]?.text || coreOfferNucleus.keyAdvantage },
      { id: 'b', text: 'Loading alternative...' }
    ],
    risk: [
      { id: 'a', text: risks[0]?.text || coreOfferNucleus.biggestBarrier },
      { id: 'b', text: 'Loading alternative...' }
    ]
  };

  // Load AI-generated options when category changes
  useEffect(() => {
    const loadOptions = async () => {
      if (generatedOptions[activeCategory]) return; // Already loaded

      setIsLoadingOptions(true);
      try {
        const currentValue =
          activeCategory === 'customer' ? (userSuccess.statement || coreOfferNucleus.targetAudience) :
          activeCategory === 'result' ? (topResults.tangible || coreOfferNucleus.desiredResult) :
          activeCategory === 'better' ? (advantages[0]?.text || coreOfferNucleus.keyAdvantage) :
          (risks[0]?.text || coreOfferNucleus.biggestBarrier);

        const options = await generateInsightOptions(
          activeCategory,
          currentValue,
          {
            targetAudience: coreOfferNucleus.targetAudience,
            desiredResult: coreOfferNucleus.desiredResult,
            keyAdvantage: coreOfferNucleus.keyAdvantage,
            biggestBarrier: coreOfferNucleus.biggestBarrier
          }
        );

        setGeneratedOptions(prev => ({
          ...prev,
          [activeCategory]: options
        }));
      } catch (error) {
        console.error('Error generating options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [activeCategory]);

  // Get the current options based on generated options or defaults
  const getOptions = (category: InsightCategory) => {
    if (isLoadingOptions && category === activeCategory) {
      return [
        { id: 'a', text: defaultOptions[category][0].text },
        { id: 'b', text: 'Loading alternative...', disabled: true }
      ];
    }

    if (generatedOptions[category]) {
      return [
        { id: 'a', text: defaultOptions[category][0].text },
        { id: 'b', text: generatedOptions[category][0] || 'Alternative option' }
      ];
    }

    return defaultOptions[category];
  };

  const handleCategorySelect = (category: InsightCategory) => {
    setActiveCategory(category);
    setShowFollowUp(false);
  };

  const handleOptionSelect = async (optionId: string) => {
    // Get the selected option text
    const options = getOptions(activeCategory);
    const selectedOption = options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Show follow-up immediately with a loading state
    setShowFollowUp(true);
    setFollowUpQuestion('Generating follow-up question...');
    setIsProcessingFollowUp(true);

    try {
      // Get feedback for all options
      const feedbackData = {};
      options.forEach(opt => {
        feedbackData[opt.id] = opt.id === optionId ? 'positive' : null;
      });

      // Generate a follow-up question based on the selection and feedback
      const question = await processInsightFeedback(
        activeCategory,
        selectedOption.text,
        feedbackData
      );

      setFollowUpQuestion(question);
    } catch (error) {
      console.error('Error generating follow-up:', error);
      // Fallback questions if API fails
      switch (activeCategory) {
        case 'customer':
          setFollowUpQuestion('What specific pain points does this customer segment experience?');
          break;
        case 'result':
          setFollowUpQuestion('How quickly do users typically achieve this result?');
          break;
        case 'better':
          setFollowUpQuestion('What evidence supports this competitive advantage?');
          break;
        case 'risk':
          setFollowUpQuestion('How do you currently address this objection?');
          break;
      }
    } finally {
      setIsProcessingFollowUp(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpAnswer.trim()) return;

    setIsProcessingFollowUp(true);

    try {
      // Get the selected option
      const options = getOptions(activeCategory);
      const selectedOption = options.find(opt => opt.id === 'a')?.text || '';

      // Process the follow-up answer
      await processFollowUpAnswer(
        activeCategory,
        selectedOption,
        followUpQuestion,
        followUpAnswer
      );

      // Save the result to the store
      const result: InsightResult = {
        category: activeCategory,
        selectedOption,
        feedback: { a: 'positive', b: null },
        followUpAnswer
      };

      useOfferStore.getState().setInsightResult(result);

      // Clear and move to next category
      setFollowUpAnswer('');
      setShowFollowUp(false);

      // Move to the next category
      const categories: InsightCategory[] = ['customer', 'result', 'better', 'risk'];
      const currentIndex = categories.indexOf(activeCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      setActiveCategory(categories[nextIndex]);

      // If we've gone through all categories, mark as complete
      if (nextIndex === 0) {
        useOfferStore.getState().completeInsights();
      }
    } catch (error) {
      console.error('Error processing follow-up:', error);
    } finally {
      setIsProcessingFollowUp(false);
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg shadow-lg border border-[#333333] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1C1C1C] p-4 border-b border-[#333333] flex justify-between items-center">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-[#FFD23F] mr-2" />
          <h3 className="text-white font-medium">AI Offer Insights</h3>
        </div>
        <div className="flex space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[#333333]">
        <button
          onClick={() => handleCategorySelect('customer')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeCategory === 'customer'
              ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ideal Customer
        </button>
        <button
          onClick={() => handleCategorySelect('result')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeCategory === 'result'
              ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Top Result
        </button>
        <button
          onClick={() => handleCategorySelect('better')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeCategory === 'better'
              ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Better
        </button>
        <button
          onClick={() => handleCategorySelect('risk')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeCategory === 'risk'
              ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Risk
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Question Display */}
        {isLoadingOptions && !generatedOptions[activeCategory] ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD23F] mb-4" />
            <p className="text-gray-300">Generating personalized insights...</p>
          </div>
        ) : (
          <>
            {activeCategory === 'customer' && (
              <InsightQuestion
                question="Is this your ideal customer?"
                options={getOptions('customer')}
                onSelect={handleOptionSelect}
              />
            )}

            {activeCategory === 'result' && (
              <InsightQuestion
                question="Is this the top result of your product?"
                options={getOptions('result')}
                onSelect={handleOptionSelect}
              />
            )}

            {activeCategory === 'better' && (
              <InsightQuestion
                question="Is this the top reason your product is better?"
                options={getOptions('better')}
                onSelect={handleOptionSelect}
              />
            )}

            {activeCategory === 'risk' && (
              <InsightQuestion
                question="Are these the top reasons people don't sign up?"
                options={getOptions('risk')}
                onSelect={handleOptionSelect}
              />
            )}
          </>
        )}

        {/* Follow-up Question */}
        {showFollowUp && (
          <div className="mt-6 bg-[#1C1C1C] p-4 rounded-lg">
            <p className="text-white mb-3">{followUpQuestion}</p>
            <div className="flex space-x-2">
              <textarea
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 bg-[#333333] text-white border border-[#444444] rounded-lg p-2 resize-none focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                rows={2}
              />
              <button
                onClick={handleFollowUpSubmit}
                disabled={!followUpAnswer.trim() || isProcessingFollowUp}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessingFollowUp ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with chat option */}
      <div className="bg-[#1C1C1C] p-4 border-t border-[#333333]">
        <button
          className="w-full flex items-center justify-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
        >
          <MessageSquare className="w-4 h-4 mr-2 text-[#FFD23F]" />
          Continue with Chat Assistant
        </button>
      </div>
    </div>
  );
}
