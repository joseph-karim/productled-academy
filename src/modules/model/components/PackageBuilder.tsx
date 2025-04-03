import React, { useState } from 'react';
import { useModelInputsStore } from '../store/modelInputsStore';
import { suggestPackageFeatures } from '../services/ai/suggestions';
import { PlusCircle, Trash2, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import type { PackageFeature } from '../types/package';

interface PackageBuilderProps {
  readOnly?: boolean;
}

export function PackageBuilder({ readOnly = false }: PackageBuilderProps) {
  const {
    productDescription,
    selectedModel,
    outcomes,
    challenges,
    solutions,
    freeFeatures,
    addFeature,
    updateFeature,
    removeFeature
  } = useModelInputsStore();

  const [showGuidance, setShowGuidance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<PackageFeature>({
    id: '',
    name: '',
    description: '',
    category: 'core',
    tier: 'free'
  });

  const handleGetSuggestions = async () => {
    if (!productDescription || !selectedModel || readOnly) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await suggestPackageFeatures(
        productDescription,
        selectedModel,
        challenges,
        solutions
      );
      
      result.free.forEach((f: PackageFeature) => {
        addFeature(f);
      });
      result.paid.forEach((f: PackageFeature) => {
        addFeature(f);
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.name || !newFeature.description || readOnly) return;
    
    addFeature({
      ...newFeature,
      id: Math.random().toString(36).substr(2, 9)
    });
    
    setNewFeature({
      id: '',
      name: '',
      description: '',
      category: 'core',
      tier: 'free'
    });
  };

  const handleUpdateFeature = (id: string, updates: Partial<PackageFeature>) => {
    if (readOnly) return;
    updateFeature(id, updates);
  };

  const handleRemoveFeature = (id: string) => {
    if (readOnly) return;
    removeFeature(id);
  };

  const featureCategories = [
    { value: 'core', label: 'Core Features' },
    { value: 'value-demo', label: 'Value Demonstration' },
    { value: 'connection', label: 'Connection & Sharing' },
    { value: 'educational', label: 'Educational & Support' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Package Builder</h2>
          <p className="text-gray-400">
            Define features for your free and paid packages based on your {selectedModel} model.
          </p>
        </div>
        <div className="flex space-x-2">
          {!readOnly && (
            <button
              onClick={handleGetSuggestions}
              disabled={isGenerating || !productDescription || !selectedModel}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isGenerating || !productDescription || !selectedModel
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Packages
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-[#2A2A2A] p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-white">Package Design Guidelines</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#FFD23F] font-medium mb-2">Free Package</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Include features that demonstrate core value</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Set clear usage or capability limits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Create natural upgrade triggers</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FFD23F] font-medium mb-2">Paid Package</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Focus on scalability and advanced needs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Include team and collaboration features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span>Provide enterprise-grade capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Package */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Free Package</h3>
          <div className="space-y-4">
            {freeFeatures.map(feature => (
              <div key={feature.id} className="bg-[#2A2A2A] p-4 rounded-lg space-y-4">
                <input
                  type="text"
                  value={feature.name}
                  onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                  className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Feature name..."
                  disabled={readOnly}
                />
                <textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                  className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Feature description..."
                  rows={2}
                  disabled={readOnly}
                />
                <div className="flex space-x-4">
                  <select
                    value={feature.category}
                    onChange={(e) => updateFeature(feature.id, { 
                      category: e.target.value as PackageFeature['category']
                    })}
                    className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    disabled={readOnly}
                  >
                    {featureCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {!readOnly && (
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!readOnly && (
              <button
                onClick={handleAddFeature}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Free Feature
              </button>
            )}
          </div>
        </div>

        {/* Paid Package */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Paid Package</h3>
          <div className="space-y-4">
            {freeFeatures.map(feature => (
              <div key={feature.id} className="bg-[#2A2A2A] p-4 rounded-lg space-y-4">
                <input
                  type="text"
                  value={feature.name}
                  onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                  className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Feature name..."
                  disabled={readOnly}
                />
                <textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                  className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Feature description..."
                  rows={2}
                  disabled={readOnly}
                />
                <div className="flex space-x-4">
                  <select
                    value={feature.category}
                    onChange={(e) => updateFeature(feature.id, { 
                      category: e.target.value as PackageFeature['category']
                    })}
                    className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    disabled={readOnly}
                  >
                    {featureCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {!readOnly && (
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!readOnly && (
              <button
                onClick={handleAddFeature}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Paid Feature
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}