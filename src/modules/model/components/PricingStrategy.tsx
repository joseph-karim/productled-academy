import React, { useState, useEffect } from 'react';
import { useModelPackagesStore } from '../store/modelPackagesStore';
import { useModelInputsStore } from '../store/modelInputsStore';
import { HelpCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { PricingStrategy as PricingStrategyType } from '../types/package';

interface PricingStrategyProps {
  readOnly?: boolean;
}

export function PricingStrategy({ readOnly = false }: PricingStrategyProps) {
  const { pricingStrategy, setPricingStrategy, setProcessingState } = useModelPackagesStore();
  const { selectedModel, outcomes, challenges, solutions } = useModelInputsStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize strategy if not set
  useEffect(() => {
    if (!pricingStrategy && !readOnly) {
      setPricingStrategy({
        model: (selectedModel === 'freemium' ? 'freemium' :
               selectedModel === 'opt-in-trial' || selectedModel === 'opt-out-trial' || selectedModel === 'usage-trial' ? 'free-trial' :
               'open-core') as 'freemium' | 'free-trial' | 'open-core',
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
      });
    }
  }, [pricingStrategy, selectedModel, setPricingStrategy, readOnly]);

  // Check if advanced data is available
  const hasAdvancedData = Boolean(
    outcomes.find(o => o.level === 'advanced')?.text &&
    challenges.some(c => c.level === 'advanced') &&
    solutions.some(s => challenges.find(c => c.id === s.challengeId)?.level === 'advanced')
  );

  // Get advanced solutions
  const advancedSolutions = solutions
    .filter(s => challenges.find(c => c.id === s.challengeId)?.level === 'advanced');

  const handleStrategyChange = (updates: Partial<PricingStrategyType>) => {
    if (!pricingStrategy || readOnly) return;

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
    if (!pricingStrategy || readOnly) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = field === 'valueMetrics'
      ? pricingStrategy.paidPackage.valueMetrics
      : field === 'limitations'
        ? pricingStrategy.freePackage.limitations
        : pricingStrategy.freePackage.conversionGoals;

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
    if (!pricingStrategy || readOnly) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = field === 'valueMetrics'
      ? [...pricingStrategy.paidPackage.valueMetrics]
      : field === 'limitations'
        ? [...pricingStrategy.freePackage.limitations]
        : [...pricingStrategy.freePackage.conversionGoals];
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
    if (!pricingStrategy || readOnly) return;

    const package_ = field === 'valueMetrics' ? 'paidPackage' : 'freePackage';
    const currentArray = field === 'valueMetrics'
      ? [...pricingStrategy.paidPackage.valueMetrics]
      : field === 'limitations'
        ? [...pricingStrategy.freePackage.limitations]
        : [...pricingStrategy.freePackage.conversionGoals];
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
      <div className="text-center py-8 text-gray-400">
        No pricing strategy defined yet.
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
            disabled={readOnly}
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
              {!readOnly && (
                <button
                  onClick={() => addArrayItem('limitations')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Limitation
                </button>
              )}
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
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      onClick={() => removeArrayItem('limitations', index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
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
              {!readOnly && (
                <button
                  onClick={() => addArrayItem('conversionGoals')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Goal
                </button>
              )}
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
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      onClick={() => removeArrayItem('conversionGoals', index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
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
              {!readOnly && (
                <button
                  onClick={() => addArrayItem('valueMetrics')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Metric
                </button>
              )}
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
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      onClick={() => removeArrayItem('valueMetrics', index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
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
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}