import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, MessageSquarePlus, CheckCircle } from 'lucide-react';
import { analyzeText } from '../../services/ai';
import { ErrorMessage } from '../shared/ErrorMessage';

export function ProductDescription() {
  const { productDescription, setProductDescription } = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<Array<{
    category: string;
    text: string;
    type: 'improvement' | 'warning' | 'positive';
  }>>([]);
  const [suggestedDescription, setSuggestedDescription] = React.useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setProductDescription(newText);
    // Clear feedback when text changes
    setSuggestions([]);
    setError(null);
    setSuggestedDescription(null);
  };

  const handleGetFeedback = async () => {
    if (productDescription.length < 10) return;
    
    setIsAnalyzing(true);
    setError(null);
    setSuggestedDescription(null);
    
    try {
      const result = await analyzeText(productDescription, 'Product Description');
      
      // Group feedbacks by category
      const groupedSuggestions = [
        ...result.feedbacks.map(f => ({
          category: f.category || 'General',
          text: f.suggestion,
          type: f.type
        })),
        ...result.missingElements.map(e => ({
          category: e.category,
          text: e.description,
          type: 'warning' as const
        }))
      ];

      setSuggestions(groupedSuggestions);

      // Set suggested description if provided
      if (result.suggestedText) {
        setSuggestedDescription(result.suggestedText);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestedDescription) {
      setProductDescription(suggestedDescription);
      setSuggestedDescription(null);
      setSuggestions([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Description</h2>
          <p className="text-gray-600 mt-1">
            Describe what your product/service is and does. Focus on the core functionality and key features.
          </p>
        </div>
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-blue-600 hover:text-blue-800"
          title={showGuidance ? "Hide guidance" : "Show guidance"}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {showGuidance && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium text-blue-900">Description Framework</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800">Core Elements</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>What is your product/service at its core?</li>
                  <li>What are the key features and capabilities?</li>
                  <li>What makes it unique or different?</li>
                  <li>What is the primary use case?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Tips</h4>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Be clear and concise</li>
                  <li>Focus on value delivered</li>
                  <li>Highlight differentiators</li>
                  <li>Use specific examples</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900">Example</h4>
            <p className="text-sm text-blue-800 mt-1">
              "Our AI-powered document collaboration platform helps teams create and edit contracts 3x faster. 
              Unlike traditional PDF tools, we offer real-time collaboration, smart templates, and automated 
              workflows that eliminate manual document preparation and streamline the entire contract lifecycle."
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          value={productDescription}
          onChange={handleTextChange}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your product description..."
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleGetFeedback}
            disabled={isAnalyzing || productDescription.length < 10}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isAnalyzing || productDescription.length < 10
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Get Feedback
              </>
            )}
          </button>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleGetFeedback}
          />
        )}
        
        {!isAnalyzing && suggestedDescription && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-900">Suggested Description</h4>
              <button
                onClick={handleAcceptSuggestion}
                className="flex items-center text-sm text-green-700 hover:text-green-900"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Use This Description
              </button>
            </div>
            <p className="text-green-800">{suggestedDescription}</p>
          </div>
        )}
        
        {!isAnalyzing && suggestions.length > 0 && (
          <div className="space-y-4">
            {['Core Product', 'Features', 'Uniqueness', 'Use Case'].map(category => {
              const categorySuggestions = suggestions.filter(s => s.category === category);
              if (categorySuggestions.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  {categorySuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        suggestion.type === 'improvement'
                          ? 'bg-blue-50 border border-blue-100'
                          : suggestion.type === 'warning'
                          ? 'bg-amber-50 border border-amber-100'
                          : 'bg-green-50 border border-green-100'
                      }`}
                    >
                      <p className={`text-sm ${
                        suggestion.type === 'improvement'
                          ? 'text-blue-800'
                          : suggestion.type === 'warning'
                          ? 'text-amber-800'
                          : 'text-green-800'
                      }`}>
                        {suggestion.text}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}