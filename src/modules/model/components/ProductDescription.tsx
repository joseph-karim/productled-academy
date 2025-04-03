import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, MessageSquarePlus } from 'lucide-react';
import { analyzeText } from '../../services/ai';
import { ErrorMessage } from '../shared/ErrorMessage';
import { ProductDescriptionLauncher } from '../wizard/ProductDescriptionLauncher';

interface ProductDescriptionProps {
  readOnly?: boolean;
}

export function ProductDescription({ readOnly = false }: ProductDescriptionProps) {
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

      if (result.suggestedText) {
        setSuggestedDescription(result.suggestedText);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Description</h2>
          <p className="text-gray-400 mt-1">
            Describe what your product/service is and does. Focus on the core functionality and key features.
          </p>
        </div>
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-[#FFD23F] hover:text-[#FFD23F]/80"
          title={showGuidance ? "Hide guidance" : "Show guidance"}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {showGuidance && (
        <div className="description-framework">
          <div>
            <h3 className="framework-heading">Description Framework</h3>
            <div className="framework-grid">
              <div className="framework-column">
                <h4 className="text-white font-medium">Core Elements</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>What is your product/service at its core?</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>What are the key features and capabilities?</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>What makes it unique or different?</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>What is the primary use case?</span>
                  </li>
                </ul>
              </div>
              <div className="framework-column">
                <h4 className="text-white font-medium">Tips</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Be clear and concise</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Focus on value delivered</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Highlight differentiators</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Use specific examples</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-white font-medium mb-2">Example</h4>
            <div className="framework-example">
              "Our AI-powered document collaboration platform helps teams create and edit contracts 3x faster. 
              Unlike traditional PDF tools, we offer real-time collaboration, smart templates, and automated 
              workflows that eliminate manual document preparation and streamline the entire contract lifecycle."
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          value={productDescription}
          onChange={handleTextChange}
          className="pl-input w-full h-40"
          placeholder="Enter your product description..."
          disabled={readOnly}
        />
        
        {!readOnly && (
          <div className="flex justify-end space-x-2">
            <ProductDescriptionLauncher />
            <button
              onClick={handleGetFeedback}
              disabled={isAnalyzing || productDescription.length < 10}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isAnalyzing || productDescription.length < 10
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
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
        )}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleGetFeedback}
          />
        )}
        
        {!isAnalyzing && suggestedDescription && (
          <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg p-4">
            <p className="text-[#FFD23F]">{suggestedDescription}</p>
          </div>
        )}
        
        {!isAnalyzing && suggestions.length > 0 && (
          <div className="space-y-4">
            {['Core Product', 'Features', 'Uniqueness', 'Use Case'].map(category => {
              const categorySuggestions = suggestions.filter(s => s.category === category);
              if (categorySuggestions.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-white">{category}</h4>
                  {categorySuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        suggestion.type === 'improvement'
                          ? 'bg-[#2A2A2A] border border-[#FFD23F] text-[#FFD23F]'
                          : suggestion.type === 'warning'
                          ? 'bg-[#2A2A2A] border border-amber-500 text-amber-500'
                          : 'bg-[#2A2A2A] border border-green-500 text-green-500'
                      }`}
                    >
                      <p className="text-sm">{suggestion.text}</p>
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