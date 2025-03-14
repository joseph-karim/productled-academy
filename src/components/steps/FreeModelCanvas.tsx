import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Rocket, Target, Lightbulb, ArrowRight, BrainCircuit, Download, Calculator, Users, Sparkles, ArrowUpRight } from 'lucide-react';
import type { ModelType, Challenge, Solution } from '../../types';

const modelDescriptions: Record<ModelType, {
  title: string;
  description: string;
  considerations: string[];
  freeQuantityGuidelines: {
    metrics: string[];
    factors: string[];
    examples: string[];
  };
}> = {
  'opt-in-trial': {
    title: 'Opt-In Free Trial',
    description: 'Time-limited access to most features without requiring credit card information',
    considerations: [
      'May attract less qualified users',
      'Lower conversion rates than opt-out',
      'Time-to-value must fit trial period',
      'Requires strong onboarding'
    ],
    freeQuantityGuidelines: {
      metrics: ['Days of access', 'Number of projects', 'API calls'],
      factors: [
        'Time needed to experience value',
        'Resource consumption per user',
        'Industry standard trial lengths'
      ],
      examples: [
        '14-30 days for SaaS tools',
        '3 projects for design tools',
        '1000 API calls for developers'
      ]
    }
  },
  'opt-out-trial': {
    title: 'Opt-Out Free Trial',
    description: 'Credit card required upfront, converts to paid unless cancelled',
    considerations: [
      'Higher friction reduces signups',
      'Better qualification of leads',
      'May create negative sentiment',
      'Not ideal for early markets'
    ],
    freeQuantityGuidelines: {
      metrics: ['Days of access', 'Storage space', 'Team members'],
      factors: [
        'Average sales cycle length',
        'Cost of servicing trial users',
        'Competitor trial periods'
      ],
      examples: [
        '7-14 days for B2B tools',
        '5GB storage for cloud services',
        '5 team members for collaboration tools'
      ]
    }
  },
  'usage-trial': {
    title: 'Usage-Based Free Trial',
    description: 'Full feature access with usage limits instead of time restrictions',
    considerations: [
      'Longer conversion cycles',
      'Usage limits need calibration',
      'More complex to explain',
      'Must track usage accurately'
    ],
    freeQuantityGuidelines: {
      metrics: ['API calls', 'Transactions', 'Processing units'],
      factors: [
        'Average usage patterns',
        'Cost per unit of usage',
        'Value delivered per unit'
      ],
      examples: [
        '100 API calls/month',
        '1000 email sends',
        '10 hours of processing'
      ]
    }
  },
  'freemium': {
    title: 'Freemium',
    description: 'Permanent free tier with limited features and clear upgrade paths',
    considerations: [
      'Risk of giving too much value',
      'Needs significant scale',
      'Feature balance critical',
      'Resource consumption by free users'
    ],
    freeQuantityGuidelines: {
      metrics: ['Users', 'Storage', 'Monthly usage'],
      factors: [
        'User acquisition cost',
        'Server costs per user',
        'Network effects potential'
      ],
      examples: [
        '3 users for team tools',
        '500MB storage for content',
        '100 monthly actions'
      ]
    }
  },
  'new-product': {
    title: 'New Product Model',
    description: 'Separate, simpler product solving a key barrier to main product adoption',
    considerations: [
      'Additional product development',
      'Resource division challenges',
      'Portfolio complexity',
      'Clear path to main product needed'
    ],
    freeQuantityGuidelines: {
      metrics: ['Features', 'Data volume', 'Integrations'],
      factors: [
        'Development cost allocation',
        'Support burden per user',
        'Upsell opportunity value'
      ],
      examples: [
        'Basic feature set only',
        'Limited data processing',
        'Single integration'
      ]
    }
  },
  'sandbox': {
    title: 'Sandbox Model',
    description: 'Interactive demo environment with preset data showing product in action',
    considerations: [
      'Less engaging than real usage',
      'May feel artificial',
      'Limited personalized value',
      'Needs realistic sample data'
    ],
    freeQuantityGuidelines: {
      metrics: ['Time limit', 'Sample data', 'Test scenarios'],
      factors: [
        'Demo environment costs',
        'Data refresh frequency',
        'Support staff availability'
      ],
      examples: [
        '1 hour sandbox sessions',
        '10 sample datasets',
        '5 test scenarios'
      ]
    }
  }
};

export function FreeModelCanvas() {
  const store = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // Get all beginner challenges and solutions that make sense for free tier
  const freePathChallenges = React.useMemo(() => {
    return store.challenges
      .filter(c => c.level === 'beginner')
      .map(challenge => {
        const relatedSolutions = store.solutions.filter(s => s.challengeId === challenge.id);
        // Calculate solution viability for free tier
        const freeViabilityScore = relatedSolutions.reduce((score, solution) => {
          // Weight factors for free tier suitability:
          // - Solution type (content = 1, resource = 0.8, product = 0.6)
          // - Implementation cost (low = 1, medium = 0.7, high = 0.4)
          const typeWeight = solution.type === 'content' ? 1 : 
                           solution.type === 'resource' ? 0.8 : 0.6;
          const costWeight = solution.cost === 'low' ? 1 :
                           solution.cost === 'medium' ? 0.7 : 0.4;
          return score + (typeWeight * costWeight);
        }, 0) / relatedSolutions.length;

        return {
          ...challenge,
          freeViabilityScore,
          solutions: relatedSolutions
        };
      })
      .filter(c => c.freeViabilityScore >= 0.6) // Only include challenges with viable free solutions
      .sort((a, b) => b.freeViabilityScore - a.freeViabilityScore);
  }, [store.challenges, store.solutions]);

  // Extract key moments in the user journey
  const userJourney = React.useMemo(() => {
    const firstChallenge = freePathChallenges[0];
    const firstSolution = firstChallenge?.solutions[0];

    return {
      discovery: {
        problem: store.productDescription.split('.')[0], // First sentence of product description
        trigger: firstChallenge?.title || '',
        initialThought: "Can this help me solve my problem?"
      },
      signup: {
        friction: store.selectedModel === 'opt-out-trial' ? 'Credit card required' : 
                 store.selectedModel === 'usage-trial' ? 'Usage limits apply' :
                 'No credit card required',
        timeToValue: store.freeFeatures.some(f => f.category === 'core') ? '< 5 minutes' : '5-15 minutes',
        guidance: store.freeFeatures
          .filter(f => f.category === 'educational')
          .map(f => f.name)
          .join(', ')
      },
      activation: {
        firstWin: firstSolution?.text || '',
        ahaFeature: store.freeFeatures.find(f => f.category === 'value-demo')?.name || '',
        timeToSuccess: '< 30 minutes'
      },
      engagement: {
        coreTasks: store.freeFeatures
          .filter(f => f.category === 'core')
          .map(f => f.name),
        collaboration: store.freeFeatures
          .filter(f => f.category === 'connection')
          .map(f => f.name),
        limitations: modelDescriptions[store.selectedModel || 'freemium']
          .freeQuantityGuidelines.metrics
      },
      conversion: {
        triggers: [
          'Usage limit reached',
          'Team collaboration needed',
          'Advanced features required',
          'Scale operations'
        ],
        nextFeatures: store.freeFeatures.length > 0 ? [
          'Advanced automation',
          'Custom integrations',
          'Enterprise controls',
          'Priority support'
        ] : []
      }
    };
  }, [store.productDescription, store.selectedModel, store.freeFeatures, freePathChallenges]);

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
          <h2 className="text-2xl font-bold text-white">Free Model Canvas</h2>
          <p className="text-gray-400 mt-1">
            A comprehensive overview of your product-led growth strategy.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title={showGuidance ? "Hide guidance" : "Show guidance"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.print()}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title="Print Canvas"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="description-framework">
          <div>
            <h3 className="framework-heading">Canvas Guide</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-white font-medium">Purpose</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Map the complete user journey</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Identify key conversion moments</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Align features with user needs</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Plan natural upgrade paths</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium">Best Practices</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Focus on quick time-to-value</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Remove friction points</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Guide users to success</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Create clear upgrade triggers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#333333] pb-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-400">Company Name</label>
              <input
                type="text"
                className="bg-[#1C1C1C] border-none p-0 text-lg font-medium text-white focus:ring-0"
                placeholder="Enter company name..."
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Date</div>
              <div className="text-lg font-medium text-white">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* User Journey Map */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <Users className="w-5 h-5" />
              <h3 className="font-medium">Customer Journey</h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {/* Discovery */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#FFD23F]" />
                  <span>Discovery</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">Problem</div>
                    <div className="text-white">{userJourney.discovery.problem}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Trigger</div>
                    <div className="text-white">{userJourney.discovery.trigger}</div>
                  </div>
                </div>
              </div>

              {/* Sign Up */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-[#FFD23F]" />
                  <span>Sign Up</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">Friction</div>
                    <div className="text-white">{userJourney.signup.friction}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Time to Value</div>
                    <div className="text-white">{userJourney.signup.timeToValue}</div>
                  </div>
                </div>
              </div>

              {/* Activation */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <Rocket className="w-4 h-4 text-[#FFD23F]" />
                  <span>Activation</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">First Win</div>
                    <div className="text-white">{userJourney.activation.firstWin}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">"Aha" Feature</div>
                    <div className="text-white">{userJourney.activation.ahaFeature}</div>
                  </div>
                </div>
              </div>

              {/* Engagement */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#FFD23F]" />
                  <span>Engagement</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">Core Tasks</div>
                    <div className="text-white">
                      {userJourney.engagement.coreTasks.join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Limitations</div>
                    <div className="text-white">
                      {userJourney.engagement.limitations.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-[#FFD23F]" />
                  <span>Conversion</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">Upgrade Triggers</div>
                    <div className="text-white">
                      {userJourney.conversion.triggers.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Next Features</div>
                    <div className="text-white">
                      {userJourney.conversion.nextFeatures.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Free Path Challenges and Solutions */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <Target className="w-5 h-5" />
                <h3 className="font-medium">Free Path Challenges</h3>
              </div>
              <div className="space-y-3">
                {freePathChallenges.map((challenge, index) => (
                  <div key={challenge.id} className="bg-[#1C1C1C] p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#2A2A2A] text-[#FFD23F] text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-white">{challenge.title}</h4>
                          {challenge.description && (
                            <p className="mt-1 text-sm text-gray-400">{challenge.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Magnitude: {challenge.magnitude}</span>
                          <span>Free Viability: {Math.round(challenge.freeViabilityScore * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-medium">Free Solutions</h3>
              </div>
              <div className="space-y-3">
                {freePathChallenges.flatMap(challenge => 
                  challenge.solutions
                    .filter(solution => {
                      // Filter solutions suitable for free tier
                      const typeWeight = solution.type === 'content' ? 1 : 
                                       solution.type === 'resource' ? 0.8 : 0.6;
                      const costWeight = solution.cost === 'low' ? 1 :
                                       solution.cost === 'medium' ? 0.7 : 0.4;
                      return typeWeight * costWeight >= 0.6;
                    })
                    .map(solution => (
                      <div key={solution.id} className="bg-[#1C1C1C] p-4 rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-white">{solution.text}</h4>
                            <p className="text-sm text-gray-400">For: {challenge.title}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize
                              ${solution.type === 'product' ? 'bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F]' : 
                                solution.type === 'resource' ? 'bg-[#2A2A2A] text-purple-400 border border-purple-400' : 
                                'bg-[#2A2A2A] text-green-400 border border-green-400'}`}>
                              {solution.type}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize
                              ${solution.cost === 'low' ? 'bg-[#2A2A2A] text-green-400 border border-green-400' :
                                solution.cost === 'medium' ? 'bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F]' :
                                'bg-[#2A2A2A] text-red-400 border border-red-400'}`}>
                              {solution.cost} cost
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Model and Free Quantity Guidelines */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-medium">Selected Model</h3>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="font-medium text-white capitalize">
                  {store.selectedModel?.replace('-', ' ') || 'No model selected'}
                </h4>
                {store.selectedModel && (
                  <>
                    <p className="mt-2 text-gray-400">
                      {modelDescriptions[store.selectedModel].description}
                    </p>
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-medium text-white">Key Considerations:</h5>
                      <ul className="text-sm space-y-2">
                        {modelDescriptions[store.selectedModel].considerations.map((item, i) => (
                          <li key={i} className="framework-list-item">
                            <span className="framework-bullet" />
                            <span className="text-gray-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <Calculator className="w-5 h-5" />
                <h3 className="font-medium">Free Quantity Guidelines</h3>
              </div>
              {store.selectedModel && (
                <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">Key Metrics to Consider:</h4>
                    <ul className="mt-2 space-y-2">
                      {modelDescriptions[store.selectedModel].freeQuantityGuidelines.metrics.map((metric, i) => (
                        <li key={i} className="framework-list-item">
                          <span className="framework-bullet" />
                          <span className="text-gray-400">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white">Decision Factors:</h4>
                    <ul className="mt-2 space-y-2">
                      {modelDescriptions[store.selectedModel].freeQuantityGuidelines.factors.map((factor, i) => (
                        <li key={i} className="framework-list-item">
                          <span className="framework-bullet" />
                          <span className="text-gray-400">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white">Common Examples:</h4>
                    <ul className="mt-2 space-y-2">
                      {modelDescriptions[store.selectedModel].freeQuantityGuidelines.examples.map((example, i) => (
                        <li key={i} className="framework-list-item">
                          <span className="framework-bullet" />
                          <span className="text-gray-400">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t border-[#333333] pt-6">
            <div className="flex items-center space-x-2 text-[#FFD23F] mb-2">
              <ArrowRight className="w-5 h-5" />
              <h3 className="font-medium">Call-to-Action</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              <p className="text-white font-medium">{getCallToAction()}</p>
              <p className="mt-2 text-sm text-gray-400">
                Primary action button for website and marketing materials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}