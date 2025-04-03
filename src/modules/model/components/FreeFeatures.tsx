import { useState } from 'react';
import { useFormStore } from '../../store/formStore';
import { MessageSquarePlus, Loader2, HelpCircle, PlusCircle } from 'lucide-react';
import { FloatingFeedback } from '../shared/FloatingFeedback';
import { analyzeText, suggestFeatures } from '../../services/ai';
import type { Feature } from '../../types';

export function FreeFeatures() {
  const store = useFormStore();
  // Extract the beginner outcome text
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';
  
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

  const categoryColors = {
    core: 'bg-blue-100 text-blue-800',
    'value-demo': 'bg-green-100 text-green-800',
    connection: 'bg-purple-100 text-purple-800',
    educational: 'bg-yellow-100 text-yellow-800'
  };

  const categoryLabels = {
    core: 'Core Functionality',
    'value-demo': 'Value Demonstration',
    connection: 'Connection & Sharing',
    educational: 'Educational Resources'
  };

  const handleAddFeature = () => {
    if (newFeatureName.trim() && newFeatureDescription.trim()) {
      store.addFeature({
        id: crypto.randomUUID(),
        name: newFeatureName.trim(),
        description: newFeatureDescription.trim()
      });
      setNewFeatureName('');
      setNewFeatureDescription('');
    }
  };

  const handleGetSuggestions = async () => {
    if (!store.productDescription || !beginnerOutcome || !store.selectedModel) return;
    
    setIsGenerating(true);
    try {
      const result = await suggestFeatures(
        store.productDescription,
        beginnerOutcome,
        store.selectedModel,
        store.challenges,
        store.solutions
      );
      
      // Directly add suggested features to the list
      result.forEach(suggestion => {
        store.addFeature({
          id: crypto.randomUUID(),
          name: suggestion.feature,
          description: suggestion.reasoning,
          category: suggestion.category,
          deepScore: suggestion.deepScore
        });
      });
    } catch (error) {
      console.error('Error getting feature suggestions:', error);
    }
    setIsGenerating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleGetFeedback = async (feature: Feature) => {
    if (feature.name.length < 3 || feature.description.length < 10) return;
    
    setIsAnalyzing(prev => ({ ...prev, [feature.id]: true }));
    try {
      const result = await analyzeText(`${feature.name}\n\n${feature.description}`, 'Feature');
      
      // Update the feature with DEEP scores and category if provided
      if (result.feedbacks.length > 0) {
        const firstFeedback = result.feedbacks[0];
        if (firstFeedback.type === 'improvement') {
          store.updateFeature(feature.id, {
            category: firstFeedback.category as Feature['category'],
            deepScore: firstFeedback.deepScore
          });
        }
      }
      
      setFeedbacks(prev => ({ ...prev, [feature.id]: result.feedbacks }));
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [feature.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Free Features</h2>
          <p className="text-gray-600">
            Define the features for your free tier that will showcase value and drive adoption.
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
          <div className="relative">
            <button
              onClick={handleGetSuggestions}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              disabled={isGenerating || !store.productDescription || !beginnerOutcome || !store.selectedModel}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isGenerating || !store.productDescription || !beginnerOutcome || !store.selectedModel
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </>
              )}
            </button>
            
            {showTooltip && !isGenerating && (
              <div className="absolute bottom-full mb-2 right-0">
                <div className="bg-gray-900 text-white text-sm rounded-lg py-1 px-3 whitespace-nowrap">
                  Get AI-powered feature suggestions
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium text-blue-900">Feature Selection Guide</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800">Do's</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Focus on features that deliver quick wins (within 7 minutes)</li>
                  <li>Include core functionality needed for basic success</li>
                  <li>Showcase your unique value proposition</li>
                  <li>Create natural upgrade triggers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Don'ts</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Hide all premium features behind the paywall</li>
                  <li>Create artificial limitations that frustrate users</li>
                  <li>Include features that are costly to maintain</li>
                  <li>Overwhelm users with too many options</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900">Feature Categories</h4>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className={`p-2 rounded ${categoryColors[key as keyof typeof categoryColors]}`}>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs mt-1">
                    {key === 'core' && 'Essential features for basic usage'}
                    {key === 'value-demo' && 'Showcase unique capabilities'}
                    {key === 'connection' && 'Basic sharing & collaboration'}
                    {key === 'educational' && 'Help users get started'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 mb-1">
              Feature Name
            </label>
            <input
              id="featureName"
              type="text"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter feature name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Feature Description
            </label>
            <input
              id="featureDescription"
              type="text"
              value={newFeatureDescription}
              onChange={(e) => setNewFeatureDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the feature..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddFeature}
            disabled={!newFeatureName.trim() || !newFeatureDescription.trim()}
            className={`px-4 py-2 rounded-lg ${
              !newFeatureName.trim() || !newFeatureDescription.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Add Feature
          </button>
        </div>

        <ul className="space-y-4">
          {store.freeFeatures.map((feature) => (
            <li
              key={feature.id}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
            >
              <div className="space-y-4">
                <div>
                  {feature.category && (
                    <span className={`px-2 py-1 rounded text-sm ${categoryColors[feature.category]}`}>
                      {categoryLabels[feature.category]}
                    </span>
                  )}
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => store.updateFeature(feature.id, { name: e.target.value })}
                    className="w-full mt-2 p-2 text-lg font-medium text-gray-900 border-none focus:ring-0"
                    placeholder="Feature name..."
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => store.updateFeature(feature.id, { description: e.target.value })}
                    className="w-full mt-1 p-2 text-gray-600 border-none focus:ring-0 resize-none"
                    placeholder="Feature description..."
                    rows={2}
                  />
                </div>
                
                {feature.deepScore && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {Object.entries(feature.deepScore).map(([metric, score]) => (
                      <div key={metric} className="text-center">
                        <div className="text-sm font-medium text-gray-600 capitalize">
                          {metric}
                        </div>
                        <div className="mt-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                          <div className="mt-1 text-sm text-gray-900">{score}/10</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => store.removeFeature(feature.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>

                <button
                  onClick={() => handleGetFeedback(feature)}
                  disabled={isAnalyzing[feature.id] || feature.name.length < 3 || feature.description.length < 10}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isAnalyzing[feature.id] || feature.name.length < 3 || feature.description.length < 10
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isAnalyzing[feature.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    'Get Feedback'
                  )}
                </button>
              </div>

              {feedbacks[feature.id] && feedbacks[feature.id].length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Feedback</h5>
                  <ul className="space-y-2">
                    {feedbacks[feature.id].map((feedback) => (
                      <li key={feedback.id} className="text-gray-700">
                        {feedback.suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}