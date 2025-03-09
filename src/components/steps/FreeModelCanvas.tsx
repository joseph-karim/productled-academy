import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Rocket, Target, Lightbulb, ArrowRight, BrainCircuit, Download } from 'lucide-react';
import type { ModelType } from '../../types';

const modelDescriptions: Record<ModelType, {
  title: string;
  description: string;
  considerations: string[];
}> = {
  'opt-in-trial': {
    title: 'Opt-In Free Trial',
    description: 'Time-limited access to most features without requiring credit card information',
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
    considerations: [
      'Less engaging than real usage',
      'May feel artificial',
      'Limited personalized value',
      'Needs realistic sample data'
    ]
  }
};

export function FreeModelCanvas() {
  const store = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // Get top 3 challenges by magnitude
  const topChallenges = [...store.challenges]
    .filter(c => c.level === 'beginner')
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 3);

  // Get corresponding solutions for top challenges
  const topSolutions = store.solutions
    .filter(s => topChallenges.some(c => c.id === s.challengeId))
    .slice(0, 3);

  // Generate call-to-action based on selected model
  const getCallToAction = () => {
    switch (store.selectedModel) {
      case 'opt-in-trial':
        return 'Start Your Free Trial - No Credit Card Required';
      case 'opt-out-trial':
        return 'Start Your 14-Day Free Trial';
      case 'usage-trial':
        return 'Try For Free - Up to 100 Units';
      case 'freemium':
        return 'Get Started For Free';
      case 'new-product':
        return 'Try Our Free Starter Product';
      case 'sandbox':
        return 'Experience Live Demo';
      default:
        return 'Get Started For Free';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Free Model Canvas</h2>
          <p className="text-gray-600 mt-1">
            A comprehensive overview of your product-led growth strategy.
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
            onClick={() => window.print()}
            className="text-blue-600 hover:text-blue-800"
            title="Print Canvas"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium text-blue-900">Canvas Guide</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800">Purpose</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1">
                  <li>Visualize your free model strategy</li>
                  <li>Align team on key elements</li>
                  <li>Identify gaps and opportunities</li>
                  <li>Guide implementation priorities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Best Practices</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1">
                  <li>Focus on beginner success</li>
                  <li>Keep it concise and clear</li>
                  <li>Review and update regularly</li>
                  <li>Share with stakeholders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Company Name</label>
              <input
                type="text"
                className="border-none p-0 text-lg font-medium text-gray-900 focus:ring-0"
                placeholder="Enter company name..."
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Date</div>
              <div className="text-lg font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Beginner Outcome */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <Rocket className="w-5 h-5" />
              <h3 className="font-medium">Beginner Outcome</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-900">{beginnerOutcome || 'No beginner outcome defined'}</p>
            </div>
          </div>

          {/* Challenges and Solutions */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-purple-600">
                <Target className="w-5 h-5" />
                <h3 className="font-medium">Top Challenges</h3>
              </div>
              <div className="space-y-3">
                {topChallenges.map((challenge, index) => (
                  <div key={challenge.id} className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-purple-900">{challenge.title}</h4>
                        {challenge.description && (
                          <p className="mt-1 text-sm text-purple-700">{challenge.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-medium">Top Solutions</h3>
              </div>
              <div className="space-y-3">
                {topSolutions.map((solution, index) => (
                  <div key={solution.id} className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-green-900">{solution.text}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize
                            ${solution.type === 'product' ? 'bg-blue-100 text-blue-800' : 
                              solution.type === 'resource' ? 'bg-purple-100 text-purple-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {solution.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model and CTA */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-600">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-medium">Selected Model</h3>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 capitalize">
                  {store.selectedModel?.replace('-', ' ') || 'No model selected'}
                </h4>
                {store.selectedModel && (
                  <p className="mt-2 text-sm text-indigo-700">
                    {modelDescriptions[store.selectedModel].description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-orange-600">
                <ArrowRight className="w-5 h-5" />
                <h3 className="font-medium">Call-to-Action</h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-900 font-medium">{getCallToAction()}</p>
                <p className="mt-2 text-sm text-orange-700">
                  Primary action button for website and marketing materials
                </p>
              </div>
            </div>
          </div>

          {/* Future Considerations */}
          <div className="space-y-2 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900">Future Considerations</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                {store.selectedModel && modelDescriptions[store.selectedModel].considerations.map((consideration, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-400" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}