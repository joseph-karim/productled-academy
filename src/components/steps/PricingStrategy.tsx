import React, { useState } from 'react';
import { usePackageStore } from '../../store/packageStore';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import type { PricingStrategy as PricingStrategyType } from '../../types/package';

export function PricingStrategy() {
  const { pricingStrategy, setPricingStrategy, setProcessingState } = usePackageStore();
  const { selectedModel, outcomes, challenges, solutions } = useFormStore();
  const [showGuidance, setShowGuidance] = useState(true);

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
    setPricingStrategy({
      ...pricingStrategy!,
      ...updates
    });
  };

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

          {/* Advanced Package Guidance */}
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
            value={pricingStrategy?.basis || 'per-user'}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Limitations
              </label>
              <textarea
                value={pricingStrategy?.freePackage.limitations.join('\n')}
                onChange={(e) => handleStrategyChange({
                  freePackage: {
                    ...pricingStrategy?.freePackage!,
                    limitations: e.target.value.split('\n').filter(Boolean)
                  }
                })}
                className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                placeholder="Enter limitations (one per line)..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Conversion Goals
              </label>
              <textarea
                value={pricingStrategy?.freePackage.conversionGoals.join('\n')}
                onChange={(e) => handleStrategyChange({
                  freePackage: {
                    ...pricingStrategy?.freePackage!,
                    conversionGoals: e.target.value.split('\n').filter(Boolean)
                  }
                })}
                className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                placeholder="Enter conversion goals (one per line)..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Paid Package Strategy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Paid Package Strategy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Value Metrics
              </label>
              <textarea
                value={pricingStrategy?.paidPackage.valueMetrics.join('\n')}
                onChange={(e) => handleStrategyChange({
                  paidPackage: {
                    ...pricingStrategy?.paidPackage!,
                    valueMetrics: e.target.value.split('\n').filter(Boolean)
                  }
                })}
                className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                placeholder="Enter value metrics (one per line)..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Target Conversion Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={pricingStrategy?.paidPackage.targetConversion || 0}
                onChange={(e) => handleStrategyChange({
                  paidPackage: {
                    ...pricingStrategy?.paidPackage!,
                    targetConversion: parseInt(e.target.value)
                  }
                })}
                className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}