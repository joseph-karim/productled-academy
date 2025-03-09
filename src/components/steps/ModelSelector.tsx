import React from 'react';
import { useFormStore } from '../../store/formStore';
import { suggestModel } from '../../services/ai';
import type { ModelType } from '../../types';
import { MessageSquarePlus, Loader2, HelpCircle } from 'lucide-react';

const modelDescriptions: Record<ModelType, {
  title: string;
  description: string;
  bestFor: string[];
  considerations: string[];
}> = {
  'opt-in-trial': {
    title: 'Opt-In Free Trial',
    description: 'Time-limited access to most features without requiring credit card information',
    bestFor: [
      'Products that deliver value quickly',
      'Easy-to-onboard solutions',
      'Products needing feature exploration',
      'When maximizing trial signups is key'
    ],
    considerations: [
      'May attract less qualified users',
      'Lower conversion rates than opt-out',
      'Time-to-value must fit trial period',
      'Requires strong onboarding'
    ]
  },
  'opt-out-trial': {
    title: 'Opt-Out Free Trial',
    description: 'Credit card required upfront, converts to paid unless cancelled',
    bestFor: [
      'Reducing spam signups',
      'Products used intermittently',
      'Resource-intensive onboarding',
      'When stronger engagement needed'
    ],
    considerations: [
      'Higher friction reduces signups',
      'Better qualification of leads',
      'May create negative sentiment',
      'Not ideal for early markets'
    ]
  },
  'usage-trial': {
    title: 'Usage-Based Free Trial',
    description: 'Full feature access with usage limits instead of time restrictions',
    bestFor: [
      'Value increases with usage',
      'Need time for workflow integration',
      'Clear usage metrics exist',
      'Natural upgrade triggers desired'
    ],
    considerations: [
      'Longer conversion cycles',
      'Usage limits need calibration',
      'More complex to explain',
      'Must track usage accurately'
    ]
  },
  'freemium': {
    title: 'Freemium',
    description: 'Permanent free tier with limited features and clear upgrade paths',
    bestFor: [
      'Products with network effects',
      'When adoption drives value',
      'Low marginal cost per user',
      'Skills-based progression'
    ],
    considerations: [
      'Risk of giving too much value',
      'Needs significant scale',
      'Feature balance critical',
      'Resource consumption by free users'
    ]
  },
  'new-product': {
    title: 'New Product Model',
    description: 'Separate, simpler product solving a key barrier to main product adoption',
    bestFor: [
      'Complex products with prerequisites',
      'Significant barriers to entry',
      'When users lack necessary inputs',
      'Steep learning curves'
    ],
    considerations: [
      'Additional product development',
      'Resource division challenges',
      'Portfolio complexity',
      'Clear path to main product needed'
    ]
  },
  'sandbox': {
    title: 'Sandbox Model',
    description: 'Interactive demo environment with preset data showing product in action',
    bestFor: [
      'Complex setup requirements',
      'Long time-to-value products',
      'Enterprise solutions',
      'When real data is hard to obtain'
    ],
    considerations: [
      'Less engaging than real usage',
      'May feel artificial',
      'Limited personalized value',
      'Needs realistic sample data'
    ]
  }
};

export function ModelSelector() {
  const { 
    selectedModel, 
    setSelectedModel,
    productDescription,
    outcomes,
    challenges,
    solutions
  } = useFormStore();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<{
    model: ModelType;
    confidence: number;
    reasoning: string;
    considerations: string[];
  } | null>(null);
  const [showGuidance, setShowGuidance] = React.useState(true);

  const beginnerOutcome = outcomes.find(o => o.level === 'beginner')?.text || '';

  const handleGetSuggestion = async () => {
    if (!productDescription || !beginnerOutcome) return;
    
    setIsGenerating(true);
    try {
      const result = await suggestModel(
        productDescription,
        beginnerOutcome,
        challenges,
        solutions
      );
      setSuggestion(result);
      setSelectedModel(result.model);
    } catch (error) {
      console.error('Error getting model suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Selection</h2>
          <p className="text-gray-600">
            Choose the free model that best aligns with your product strategy and user needs.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-blue-600 hover:text-blue-800"
            title={showGuidance ? "Hide guidance" : "Show guidance"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleGetSuggestion}
            disabled={isGenerating || !productDescription || !beginnerOutcome}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isGenerating || !productDescription || !beginnerOutcome
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Get Suggestion
              </>
            )}
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium text-blue-900">Model Selection Guide</h3>
            <p className="mt-2 text-sm text-blue-800">
              Consider these factors when choosing your free model:
            </p>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900">Product Factors</h4>
                <ul className="mt-1 list-disc list-inside text-blue-800 space-y-1">
                  <li>Time to value delivery</li>
                  <li>Setup complexity</li>
                  <li>Resource requirements</li>
                  <li>Integration needs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Market Factors</h4>
                <ul className="mt-1 list-disc list-inside text-blue-800 space-y-1">
                  <li>User sophistication</li>
                  <li>Competition approach</li>
                  <li>Industry standards</li>
                  <li>Purchase process</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {suggestion && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-900">AI Suggestion</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-800">Confidence:</span>
              <div className="w-24 h-2 bg-blue-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${suggestion.confidence}%` }}
                />
              </div>
              <span className="text-sm text-blue-800">{suggestion.confidence}%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-blue-800">{suggestion.reasoning}</p>
            
            <div>
              <h4 className="font-medium text-blue-900">Key Considerations:</h4>
              <ul className="mt-2 list-disc list-inside text-blue-800 space-y-1">
                {suggestion.considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(modelDescriptions) as [ModelType, typeof modelDescriptions[ModelType]][]).map(([model, info]) => (
          <div
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === model
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedModel === model
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              />
              <h3 className="text-lg font-medium text-gray-900">
                {info.title}
              </h3>
            </div>
            <p className="mt-2 text-gray-600 ml-7">{info.description}</p>
            <div className="mt-4 ml-7 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Best For:</h4>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm">
                  {info.bestFor.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Key Considerations:</h4>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm">
                  {info.considerations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}