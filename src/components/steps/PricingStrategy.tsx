import React, { useState, useEffect } from 'react';
import { usePackageStore } from '../../store/packageStore';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { PricingStrategy as PricingStrategyType } from '../../types/package';

// Default strategy state
const defaultStrategy: PricingStrategyType = {
  model: 'freemium',
  basis: 'per-user',
  freePackage: {
    features: [],
    limitations: [],
    conversionGoals: []
  },
  paidPackage: {
    features: [],
    valueMetrics: [],
    targetConversion: 0
  }
};

export function PricingStrategy() {
  const { pricingStrategy, setPricingStrategy, setProcessingState } = usePackageStore();
  const { selectedModel, outcomes, challenges, solutions } = useFormStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize strategy if not set
  useEffect(() => {
    if (!pricingStrategy) {
      setPricingStrategy({
        ...defaultStrategy,
        model: selectedModel || 'freemium'
      });
    }
  }, [pricingStrategy, selectedModel, setPricingStrategy]);

  // Check if advanced data is available
  const hasAdvancedData = Boolean(
    outcomes.find(o => o.level === 'advanced')?.text &&
    challenges.some(c => c.level === 'advanced') &&
    solutions.some(s => challenges.find(c => c.id === s.challengeId)?.level === 'advanced')
  );

  // Get advanced solutions sorted by impact
  const advancedSolutions = solutions
    .filter(s => challenges.find(c => c.id === s.challengeId)?.level === 'advanced')
    .sort((a, b) => {
      const impactScore = { low: 1, medium: 2, high: 3 };
      return impactScore[b.impact] - impactScore[a.impact];
    });

  const handleStrategyChange = (updates: Partial<PricingStrategyType>) => {
    if (!pricingStrategy) return;

    try {
      setProcessingState({ pricingStrategy: true });
      setError(null);

      // Create new strategy object with updates
      const newStrategy = {
        ...pricingStrategy,
        ...updates,
        // Ensure nested objects are properly merged
        freePackage: {
          ...pricingStrategy.freePackage,
          ...(updates.freePackage || {})
        },
        paidPackage: {
          ...pricingStrategy.paidPackage,
          ...(updates.paidPackage || {})
        }
      };

      // Validate the new strategy
      if (!newStrategy.basis || !newStrategy.model) {
        throw new Error('Invalid pricing strategy configuration');
      }

      setPricingStrategy(newStrategy);
    } catch (err) {
      console.error('Error updating pricing strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pricing strategy');
    } finally {
      setProcessingState({ pricingStrategy: false });
    }
  };

  // Array field handlers
  const addArrayItem = (field: 'limitations' | 'conversionGoals' | 'valueMetrics') => {
    if (!pricingStrategy) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = pricingStrategy[package_][field];

    handleStrategyChange({
      [package_]: {
        ...pricingStrategy[package_],
        [field]: [...currentArray, '']
      }
    });
  };

  const updateArrayItem = (
    field: 'limitations' | 'conversionGoals' | 'valueMetrics',
    index: number,
    value: string
  ) => {
    if (!pricingStrategy) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = [...pricingStrategy[package_][field]];
    currentArray[index] = value;

    handleStrategyChange({
      [package_]: {
        ...pricingStrategy[package_],
        [field]: currentArray
      }
    });
  };

  const removeArrayItem = (
    field: 'limitations' | 'conversionGoals' | 'valueMetrics',
    index: number
  ) => {
    if (!pricingStrategy) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = [...pricingStrategy[package_][field]];
    currentArray.splice(index, 1);

    handleStrategyChange({
      [package_]: {
        ...pricingStrategy[package_],
        [field]: currentArray
      }
    });
  };

  if (!pricingStrategy) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD23F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Pricing Strategy</h2>
          <p className="text-gray-400">
            Define your pricing approach and conversion goals.
          </p>
        </div>
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-[#FFD23F] hover:text-[#FFD23F]/80"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {showGuidance && (
        <div className="bg-[#2A2A2A] p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-white">Pricing Strategy Guidelines</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#FFD23F] font-medium mb-2">Value Metrics</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Choose metrics that scale with value</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Align limits with user segments</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Consider implementation costs</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FFD23F] font-medium mb-2">Conversion Goals</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Set clear upgrade triggers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Target specific user behaviors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Measure and optimize conversion</span>
                </li>
              </ul>
            </div>
          </div>

          {hasAdvancedData && (
            <div className="mt-6 border-t border-[#333333] pt-4">
              <h4 className="text-[#FFD23F] font-medium mb-3">Advanced Package Considerations</h4>
              <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
                <div>
                  <h5 className="text-white font-medium mb-2">Advanced User Outcome</h5>
                  <p className="text-gray-300 text-sm">
                    {outcomes.find(o => o.level === 'advanced')?.text}
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-2">High-Impact Solutions</h5>
                  <div className="space-y-2">
                    {advancedSolutions.slice(0, 3).map((solution, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <span className={`flex-shrink-0 px-2 py-1 rounded text-xs ${
                          solution.impact === 'high' 
                            ? 'bg-green-900/20 text-green-400'
                            : solution.impact === 'medium'
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {solution.impact}
                        </span>
                        <span className="text-gray-300">{solution.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-2">Package Recommendations</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">
                        Consider a separate enterprise tier for advanced features
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">
                        Include customization and advanced controls
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">
                        Focus on scalability and organization-wide features
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">
                        Add enterprise-grade security and compliance features
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Pricing Basis */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Pricing Basis</h3>
          <select
            value={pricingStrategy.basis}
            onChange={(e) => handleStrategyChange({ 
              basis: e.target.value as PricingStrategyType['basis']
            })}
            className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
          >
            <option value="per-user">Per User</option>
            <option value="per-usage">Per Usage</option>
            <option value="flat-rate">Flat Rate</option>
          </select>
        </div>

        {/* Free Package Strategy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Free Package Strategy</h3>
          
          {/* Limitations */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Limitations
              </label>
              <button
                onClick={() => addArrayItem('limitations')}
                className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Limitation
              </button>
            </div>
            <div className="space-y-2">
              {pricingStrategy.freePackage.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={limitation}
                    onChange={(e) => updateArrayItem('limitations', index, e.target.value)}
                    className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Enter limitation..."
                  />
                  <button
                    onClick={() => removeArrayItem('limitations', index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Goals */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Conversion Goals
              </label>
              <button
                onClick={() => addArrayItem('conversionGoals')}
                className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Goal
              </button>
            </div>
            <div className="space-y-2">
              {pricingStrategy.freePackage.conversionGoals.map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateArrayItem('conversionGoals', index, e.target.value)}
                    className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Enter conversion goal..."
                  />
                  <button
                    onClick={() => removeArrayItem('conversionGoals', index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paid Package Strategy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Paid Package Strategy</h3>
          
          {/* Value Metrics */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Value Metrics
              </label>
              <button
                onClick={() => addArrayItem('valueMetrics')}
                className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Metric
              </button>
            </div>
            <div className="space-y-2">
              {pricingStrategy.paidPackage.valueMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={metric}
                    onChange={(e) => updateArrayItem('valueMetrics', index, e.target.value)}
                    className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Enter value metric..."
                  />
                  <button
                    onClick={() => removeArrayItem('valueMetrics', index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Target Conversion Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target Conversion Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={pricingStrategy.paidPackage.targetConversion}
              onChange={(e) => handleStrategyChange({
                paidPackage: {
                  ...pricingStrategy.paidPackage,
                  targetConversion: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                }
              })}
              className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}