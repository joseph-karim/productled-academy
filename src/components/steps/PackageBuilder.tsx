import React, { useState } from 'react';
import { usePackageStore } from '../../store/packageStore';
import { useFormStore } from '../../store/formStore';
import { PlusCircle, Trash2, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import type { PackageFeature, PackageTier } from '../../types/package';
import { suggestPackageFeatures } from '../../services/ai/suggestions';

export function PackageBuilder() {
  const { 
    features, 
    addFeature, 
    updateFeature, 
    removeFeature, 
    setPricingStrategy,
    setProcessingState 
  } = usePackageStore();
  const { 
    selectedModel,
    productDescription,
    challenges,
    solutions 
  } = useFormStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddFeature = (tier: PackageTier) => {
    const newFeature: PackageFeature = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      category: 'core',
      tier,
    };
    addFeature(newFeature);
  };

  const handleGeneratePackages = async () => {
    if (!productDescription || !selectedModel) return;
    
    setIsGenerating(true);
    setProcessingState({ freeModelCanvas: true });
    
    try {
      const result = await suggestPackageFeatures(
        productDescription,
        selectedModel,
        challenges,
        solutions
      );
      
      // Clear existing features
      features.forEach(f => removeFeature(f.id));
      
      // Add new features
      result.free.forEach(f => addFeature(f));
      result.paid.forEach(f => addFeature(f));
      
      // Set pricing strategy
      setPricingStrategy(result.pricingStrategy);
      
    } catch (error) {
      console.error('Error generating packages:', error);
    } finally {
      setIsGenerating(false);
      setProcessingState({ freeModelCanvas: false });
    }
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
          <button
            onClick={handleGeneratePackages}
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
            {features
              .filter(f => f.tier === 'free')
              .map(feature => (
                <div key={feature.id} className="bg-[#2A2A2A] p-4 rounded-lg space-y-4">
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                    className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Feature name..."
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                    className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Feature description..."
                    rows={2}
                  />
                  <div className="flex space-x-4">
                    <select
                      value={feature.category}
                      onChange={(e) => updateFeature(feature.id, { 
                        category: e.target.value as PackageFeature['category']
                      })}
                      className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    >
                      {featureCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            <button
              onClick={() => handleAddFeature('free')}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Free Feature
            </button>
          </div>
        </div>

        {/* Paid Package */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Paid Package</h3>
          <div className="space-y-4">
            {features
              .filter(f => f.tier === 'paid')
              .map(feature => (
                <div key={feature.id} className="bg-[#2A2A2A] p-4 rounded-lg space-y-4">
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                    className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Feature name..."
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                    className="w-full bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Feature description..."
                    rows={2}
                  />
                  <div className="flex space-x-4">
                    <select
                      value={feature.category}
                      onChange={(e) => updateFeature(feature.id, { 
                        category: e.target.value as PackageFeature['category']
                      })}
                      className="flex-1 bg-[#1C1C1C] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    >
                      {featureCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            <button
              onClick={() => handleAddFeature('paid')}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Paid Feature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}