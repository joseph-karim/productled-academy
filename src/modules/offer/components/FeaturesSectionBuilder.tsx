import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, MoveVertical, Sparkles, Loader2 } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export function FeaturesSectionBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    featuresSection, 
    setFeaturesSection,
    advantages,
    topResults,
    setProcessing
  } = useOfferStore();
  
  const [sectionTitle, setSectionTitle] = useState(featuresSection?.title || 'Why Choose Our Solution');
  const [sectionDescription, setSectionDescription] = useState(
    featuresSection?.description || 'Our platform is designed to help you achieve better results with less effort.'
  );
  const [features, setFeatures] = useState<Feature[]>(featuresSection?.features || []);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Save changes to store
  const handleSave = () => {
    setFeaturesSection({
      title: sectionTitle,
      description: sectionDescription,
      features
    });
  };
  
  // Auto-save when fields change
  React.useEffect(() => {
    if (!readOnly) {
      handleSave();
    }
  }, [sectionTitle, sectionDescription, features, readOnly]);
  
  const addFeature = () => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: '',
      description: ''
    };
    setFeatures([...features, newFeature]);
  };
  
  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setFeatures(
      features.map(feature => 
        feature.id === id 
          ? { ...feature, [field]: value } 
          : feature
      )
    );
  };
  
  const removeFeature = (id: string) => {
    setFeatures(features.filter(feature => feature.id !== id));
  };
  
  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === features.length - 1)
    ) {
      return;
    }
    
    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFeatures[index], newFeatures[targetIndex]] = 
      [newFeatures[targetIndex], newFeatures[index]];
    
    setFeatures(newFeatures);
  };
  
  const generateFeatures = () => {
    setIsGenerating(true);
    setProcessing('featuresSection', true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate content based on previous data
      const generatedFeatures: Feature[] = [];
      
      // Use advantages as features if available
      if (advantages.length > 0) {
        advantages.slice(0, Math.min(4, advantages.length)).forEach((advantage, index) => {
          generatedFeatures.push({
            id: `feature-gen-${index}`,
            title: advantage.text.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            description: `Our solution helps you ${advantage.text.toLowerCase()} through intelligent automation and best-in-class tools.`
          });
        });
      } 
      
      // Add results as features
      if (topResults.tangible && generatedFeatures.length < 6) {
        generatedFeatures.push({
          id: `feature-gen-results`,
          title: 'Measurable Results',
          description: `Our customers typically ${topResults.tangible.toLowerCase()}, leading to significant ROI.`
        });
      }
      
      if (topResults.intangible && generatedFeatures.length < 6) {
        generatedFeatures.push({
          id: `feature-gen-experience`,
          title: 'Improved Experience',
          description: `Beyond metrics, our users report that they ${topResults.intangible.toLowerCase()}.`
        });
      }
      
      // Fill with generic features if needed
      const genericFeatures = [
        {
          title: 'Intuitive Dashboard',
          description: 'Access all your key metrics and tools from one simple, customizable interface.'
        },
        {
          title: 'AI-Powered Insights',
          description: 'Get smart recommendations and predictions to help you make better decisions.'
        },
        {
          title: 'Seamless Integrations',
          description: 'Connect with all your favorite tools and platforms with just a few clicks.'
        },
        {
          title: 'Enterprise-Grade Security',
          description: 'Rest easy knowing your data is protected by industry-leading security protocols.'
        }
      ];
      
      let genericIndex = 0;
      while (generatedFeatures.length < 6 && genericIndex < genericFeatures.length) {
        generatedFeatures.push({
          id: `feature-gen-generic-${genericIndex}`,
          ...genericFeatures[genericIndex]
        });
        genericIndex++;
      }
      
      // Set section title and description
      setSectionTitle('Why Our Solution Stands Out');
      setSectionDescription("We've built our platform with your success in mind. Here's what makes us different:");
      
      // Update features
      setFeatures(generatedFeatures);
      
      setIsGenerating(false);
      setProcessing('featuresSection', false);
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Features Section Builder</h2>
        <p className="text-gray-300 mb-4">
          The features section highlights the key benefits and capabilities of your product.
          Focus on what makes your solution unique and how it solves your customers' problems.
        </p>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="mb-6">
          <button
            onClick={generateFeatures}
            disabled={isGenerating || readOnly}
            className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Features
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-300 mb-1">
              Section Title
            </label>
            <input
              id="sectionTitle"
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Why Choose Our Solution"
              className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
          
          <div>
            <label htmlFor="sectionDescription" className="block text-sm font-medium text-gray-300 mb-1">
              Section Description
            </label>
            <textarea
              id="sectionDescription"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Our platform is designed to help you achieve better results with less effort."
              className="w-full h-20 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Features</h3>
          {!readOnly && (
            <button
              onClick={addFeature}
              className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Feature
            </button>
          )}
        </div>
        
        {features.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No features added yet. Add your first feature or generate some automatically.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={feature.id} className="bg-[#1A1A1A] p-5 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                      disabled={readOnly}
                      placeholder="Feature title"
                      className="w-full p-2 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70 mb-3"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                      disabled={readOnly}
                      placeholder="Feature description"
                      className="w-full h-20 p-2 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                    />
                  </div>
                  
                  {!readOnly && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => moveFeature(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveVertical className="w-4 h-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveFeature(index, 'down')}
                        disabled={index === features.length - 1}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFeature(feature.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Features Section Preview</h3>
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-8 rounded-lg">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              {sectionTitle || "Why Choose Our Solution"}
            </h2>
            <p className="text-lg text-gray-300">
              {sectionDescription || "Our platform is designed to help you achieve better results with less effort."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.length > 0 ? (
              features.map((feature) => (
                <div 
                  key={feature.id} 
                  className="bg-[#1D1D1D] border border-[#333333] p-5 rounded-lg"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title || "Feature Title"}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description || "Feature description goes here."}
                  </p>
                </div>
              ))
            ) : (
              <>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="bg-[#1D1D1D] border border-[#333333] p-5 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2 opacity-40">
                      Feature Title
                    </h3>
                    <div className="h-16 bg-[#252525] rounded opacity-30"></div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Effective Features</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Focus on Benefits, Not Specifications</h4>
            <p className="text-gray-300 text-sm">
              Explain how each feature helps the user, not just what it does. "Save 5 hours per week" is more compelling than "Automated reporting tools."
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Keep Descriptions Concise</h4>
            <p className="text-gray-300 text-sm">
              Aim for 1-2 sentences per feature. Use simple language that's easy to scan and understand.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Prioritize Your Strongest Features</h4>
            <p className="text-gray-300 text-sm">
              Lead with your most compelling or unique features. These should align with your main customer pain points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 