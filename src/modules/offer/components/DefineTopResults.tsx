import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Loader2, Lightbulb, Sparkles } from 'lucide-react';
import { InsightButton } from './insights';

export function DefineTopResults({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { topResults, setTopResults, userSuccess, setProcessing } = useOfferStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tangible' | 'intangible' | 'improvement'>('tangible');

  const handleResultChange = (type: keyof typeof topResults, value: string) => {
    setTopResults({ ...topResults, [type]: value });
  };

  const generateSuggestions = async () => {
    setIsProcessing(true);
    setProcessing('topResults', true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Generate suggestions based on the user success statement
      let tangibleSuggestion = '';
      let intangibleSuggestion = '';
      let improvementSuggestion = '';

      // Use basic keyword matching for demo purposes
      // In a real implementation, this would use AI
      const successStatement = userSuccess.statement.toLowerCase();

      if (successStatement.includes('cost') || successStatement.includes('reduce')) {
        tangibleSuggestion = "30% reduction in operational costs within the first 3 months";
      } else if (successStatement.includes('time') || successStatement.includes('faster')) {
        tangibleSuggestion = "50% decrease in time spent on manual tasks, saving 5+ hours per week";
      } else {
        tangibleSuggestion = "Increase in qualified leads by 25% through improved targeting";
      }

      if (successStatement.includes('stress') || successStatement.includes('anxiety')) {
        intangibleSuggestion = "Reduced workplace stress and improved team satisfaction";
      } else if (successStatement.includes('confident') || successStatement.includes('trust')) {
        intangibleSuggestion = "Increased confidence in decision-making with data-backed insights";
      } else {
        intangibleSuggestion = "Enhanced professional reputation through consistently delivering quality results";
      }

      if (successStatement.includes('workflow') || successStatement.includes('process')) {
        improvementSuggestion = "Streamlined workflow with 40% fewer handoffs between teams";
      } else if (successStatement.includes('quality') || successStatement.includes('better')) {
        improvementSuggestion = "Higher quality output with 60% fewer errors or revisions needed";
      } else {
        improvementSuggestion = "Improved customer satisfaction scores from 7.2 to 9.1 (out of 10)";
      }

      setTopResults({
        tangible: tangibleSuggestion,
        intangible: intangibleSuggestion,
        improvement: improvementSuggestion,
      });

      setIsProcessing(false);
      setProcessing('topResults', false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Define Top Results</h2>
          <p className="text-gray-300 mb-2">
            Now that you've defined what success looks like for your users, let's break down the specific
            results they'll achieve with your product.
          </p>
          <p className="text-gray-300">
            Compelling offers highlight three types of results: tangible, intangible, and improvement results.
          </p>
        </div>
        {!readOnly && (
          <InsightButton label="Get Result Insights" />
        )}
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex border-b border-[#333333] mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'tangible'
                ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('tangible')}
          >
            Tangible Results
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'intangible'
                ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('intangible')}
          >
            Intangible Results
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'improvement'
                ? 'text-[#FFD23F] border-b-2 border-[#FFD23F]'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('improvement')}
          >
            Improvement Results
          </button>
        </div>

        {activeTab === 'tangible' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-[#FFD23F] mt-1" />
              <div>
                <h4 className="text-white font-medium">Tangible Results</h4>
                <p className="text-gray-300 text-sm">
                  Specific, measurable outcomes users can expect. Include numbers and timeframes when possible.
                </p>
              </div>
            </div>
            <textarea
              value={topResults.tangible}
              onChange={(e) => handleResultChange('tangible', e.target.value)}
              disabled={readOnly || isProcessing}
              placeholder="e.g., Increase conversion rates by 15% within 30 days"
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        )}

        {activeTab === 'intangible' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-[#FFD23F] mt-1" />
              <div>
                <h4 className="text-white font-medium">Intangible Results</h4>
                <p className="text-gray-300 text-sm">
                  Emotional benefits and status improvements users will experience.
                </p>
              </div>
            </div>
            <textarea
              value={topResults.intangible}
              onChange={(e) => handleResultChange('intangible', e.target.value)}
              disabled={readOnly || isProcessing}
              placeholder="e.g., Reduced stress from managing complex workflows"
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        )}

        {activeTab === 'improvement' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-[#FFD23F] mt-1" />
              <div>
                <h4 className="text-white font-medium">Improvement Results</h4>
                <p className="text-gray-300 text-sm">
                  How your solution improves upon the status quo or alternative solutions.
                </p>
              </div>
            </div>
            <textarea
              value={topResults.improvement}
              onChange={(e) => handleResultChange('improvement', e.target.value)}
              disabled={readOnly || isProcessing}
              placeholder="e.g., 40% faster implementation compared to traditional solutions"
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              {/* Validation feedback */}
              {activeTab === 'tangible' && topResults.tangible.length === 0 && (
                <span className="text-yellow-500">Please define a tangible result</span>
              )}
              {activeTab === 'intangible' && topResults.intangible.length === 0 && (
                <span className="text-yellow-500">Please define an intangible result</span>
              )}
              {activeTab === 'improvement' && topResults.improvement.length === 0 && (
                <span className="text-yellow-500">Please define an improvement result</span>
              )}
            </div>

            <button
              onClick={generateSuggestions}
              disabled={isProcessing || userSuccess.statement.length < 10}
              className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate All Results'
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Results Summary</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Tangible Results</h4>
            <p className="text-gray-300">
              {topResults.tangible || "Not defined yet"}
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Intangible Results</h4>
            <p className="text-gray-300">
              {topResults.intangible || "Not defined yet"}
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Improvement Results</h4>
            <p className="text-gray-300">
              {topResults.improvement || "Not defined yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}