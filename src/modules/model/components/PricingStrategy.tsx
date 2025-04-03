import React, { useState } from 'react';
import { useModelPackagesStore } from '../store/modelPackagesStore';
import { useModelInputsStore } from '../store/modelInputsStore';
import { suggestPackageFeatures } from '../services/ai/suggestions';
import { HelpCircle, Loader2 } from 'lucide-react';
import type { PricingStrategy as PricingStrategyType } from '../types/package';
import type { Challenge, Solution, ModelType } from '../services/ai/analysis/types';

interface PricingStrategyProps {
  readOnly?: boolean;
}

export function PricingStrategy({ readOnly = false }: PricingStrategyProps) {
  const { pricingStrategy, setPricingStrategy } = useModelPackagesStore();
  const { selectedModel, productDescription, challenges, solutions } = useModelInputsStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
    if (!selectedModel) {
      setError('Please select a model first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await suggestPackageFeatures(
        productDescription || '',
        selectedModel,
        challenges,
        solutions
      );
      setPricingStrategy(result.pricingStrategy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestion');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateLimitation = (limitation: string, index: number) => {
    if (!pricingStrategy) return;

    const newLimitations = [...pricingStrategy.freePackage.limitations];
    newLimitations[index] = limitation;

    setPricingStrategy({
      ...pricingStrategy,
      freePackage: {
        ...pricingStrategy.freePackage,
        limitations: newLimitations
      }
    });
  };

  const handleUpdateGoal = (goal: string, index: number) => {
    if (!pricingStrategy) return;

    const newGoals = [...pricingStrategy.freePackage.conversionGoals];
    newGoals[index] = goal;

    setPricingStrategy({
      ...pricingStrategy,
      freePackage: {
        ...pricingStrategy.freePackage,
        conversionGoals: newGoals
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Pricing Strategy</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowGuidance(!showGuidance)}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        {!readOnly && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            onClick={handleGetSuggestion}
            disabled={isGenerating || !selectedModel}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Get Suggestion</span>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {showGuidance && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Guidance</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your pricing strategy should align with your product-led growth model and create clear paths to conversion. Consider:
                </p>
                <ul className="mt-2 list-inside list-disc">
                  <li>What limitations will encourage upgrades?</li>
                  <li>What metrics indicate readiness to convert?</li>
                  <li>What is a realistic conversion rate target?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {pricingStrategy && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                  value={pricingStrategy.model}
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pricing Basis</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                  value={pricingStrategy.basis}
                  disabled
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900">Free Package</h3>
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Limitations</label>
                <div className="mt-1 space-y-2">
                  {pricingStrategy.freePackage.limitations.map((limitation: string, index: number) => (
                    <input
                      key={index}
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                      value={limitation}
                      onChange={(e) => handleUpdateLimitation(e.target.value, index)}
                      disabled={readOnly}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conversion Goals</label>
                <div className="mt-1 space-y-2">
                  {pricingStrategy.freePackage.conversionGoals.map((goal: string, index: number) => (
                    <input
                      key={index}
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                      value={goal}
                      onChange={(e) => handleUpdateGoal(e.target.value, index)}
                      disabled={readOnly}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900">Paid Package</h3>
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Value Metrics</label>
                <div className="mt-1 space-y-2">
                  {pricingStrategy.paidPackage.valueMetrics.map((metric: string, index: number) => (
                    <input
                      key={index}
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                      value={metric}
                      disabled
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Conversion Rate (%)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                    value={pricingStrategy.paidPackage.targetConversion}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}