import React from 'react';
import { useFormStore } from '../../store/formStore';
import type { Solution, SolutionType } from '../../types';
import { MessageSquarePlus, HelpCircle, Loader2, PlusCircle } from 'lucide-react';
import { FloatingFeedback, type Feedback } from '../shared/FloatingFeedback';
import { analyzeText, suggestSolutions } from '../../services/ai';

export function SolutionInput() {
  const { 
    productDescription,
    outcomes,
    challenges, 
    solutions, 
    addSolution, 
    updateSolution, 
    removeSolution 
  } = useFormStore();
  
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<Record<string, Feedback[]>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [showTooltip, setShowTooltip] = React.useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});

  const solutionTypes: Record<SolutionType, string> = {
    product: 'Product Feature',
    resource: 'Resource/Tool',
    content: 'Content/Guide'
  };

  const handleAddSolution = (challengeId: string) => {
    const newSolution: Solution = {
      id: crypto.randomUUID(),
      text: '',
      type: 'product',
      cost: 'medium',
      challengeId,
    };
    addSolution(newSolution);
  };

  const handleGetSuggestions = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    const outcome = outcomes.find(o => o.level === challenge?.level);
    if (!challenge || !productDescription || !outcome) return;
    
    setIsGenerating(prev => ({ ...prev, [challengeId]: true }));
    
    try {
      const result = await suggestSolutions(
        challenge.title,
        challenge.description,
        productDescription,
        outcome.text
      );
      
      // Add each suggested solution
      result.suggestions.forEach(suggestion => {
        const newSolution: Solution = {
          id: crypto.randomUUID(),
          text: suggestion.text,
          type: 'product',
          cost: suggestion.cost,
          challengeId,
        };
        addSolution(newSolution);
      });
    } catch (error) {
      console.error('Error generating solutions:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleGetFeedback = async (solutionId: string, text: string) => {
    if (text.length < 10) return;
    
    setIsAnalyzing(prev => ({ ...prev, [solutionId]: true }));
    try {
      const result = await analyzeText(text, 'Solution');
      setFeedbacks(prev => ({ ...prev, [solutionId]: result.feedbacks }));
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [solutionId]: false }));
    }
  };

  const handleAcceptFeedback = (solutionId: string, feedbackId: string) => {
    setFeedbacks(prev => ({
      ...prev,
      [solutionId]: prev[solutionId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const handleDismissFeedback = (solutionId: string, feedbackId: string) => {
    setFeedbacks(prev => ({
      ...prev,
      [solutionId]: prev[solutionId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const renderTextWithFeedback = (solutionId: string, text: string) => {
    const solutionFeedbacks = feedbacks[solutionId] || [];
    if (solutionFeedbacks.length === 0) return null;

    let result = [];
    let lastIndex = 0;

    // Sort feedbacks by startIndex
    const sortedFeedbacks = [...solutionFeedbacks].sort((a, b) => a.startIndex - b.startIndex);

    sortedFeedbacks.forEach((feedback) => {
      // Add text before the feedback
      if (feedback.startIndex > lastIndex) {
        result.push(text.slice(lastIndex, feedback.startIndex));
      }

      // Add the feedback component
      result.push(
        <FloatingFeedback
          key={feedback.id}
          feedback={feedback}
          onAccept={() => handleAcceptFeedback(solutionId, feedback.id)}
          onDismiss={() => handleDismissFeedback(solutionId, feedback.id)}
        />
      );

      lastIndex = feedback.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solutions</h2>
          <p className="text-gray-600">
            For each challenge, propose solutions and specify their type and implementation cost.
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
            <h3 className="font-medium text-blue-900">Solution Framework</h3>
            <ul className="mt-2 list-disc list-inside text-blue-800 space-y-2 text-sm">
              <li>Be specific about how the solution addresses the challenge</li>
              <li>Consider technical feasibility and implementation requirements</li>
              <li>Balance quick wins with long-term solutions</li>
              <li>Think about scalability and maintenance</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-900">Solution Types</h3>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900">Product Features</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Core functionality</li>
                  <li>UI improvements</li>
                  <li>Technical capabilities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Resources/Tools</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Templates</li>
                  <li>Integrations</li>
                  <li>Automation tools</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Content/Guides</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Documentation</li>
                  <li>Tutorials</li>
                  <li>Best practices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {challenges.map((challenge) => {
        const outcome = outcomes.find(o => o.level === challenge.level);
        
        return (
          <div key={challenge.id} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {challenge.title}
              </h3>
              {challenge.description && (
                <p className="text-gray-600 mt-2">{challenge.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Level: <span className="capitalize">{challenge.level}</span></span>
                <span>Magnitude: {challenge.magnitude}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleAddSolution(challenge.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Solution
              </button>
              <button
                onClick={() => handleGetSuggestions(challenge.id)}
                disabled={isGenerating[challenge.id] || !productDescription || !outcome}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isGenerating[challenge.id] || !productDescription || !outcome
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating[challenge.id] ? (
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
            </div>

            <div className="space-y-4">
              {solutions
                .filter((s) => s.challengeId === challenge.id)
                .map((solution) => (
                  <div key={solution.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={solution.text}
                          onChange={(e) => updateSolution(solution.id, { text: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your solution..."
                        />
                      </div>
                      <div>
                        <select
                          value={solution.type}
                          onChange={(e) =>
                            updateSolution(solution.id, {
                              type: e.target.value as SolutionType,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {Object.entries(solutionTypes).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          value={solution.cost}
                          onChange={(e) =>
                            updateSolution(solution.id, {
                              cost: e.target.value as 'low' | 'medium' | 'high',
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low Cost</option>
                          <option value="medium">Medium Cost</option>
                          <option value="high">High Cost</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => removeSolution(solution.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => handleGetFeedback(solution.id, solution.text)}
                          onMouseEnter={() => setShowTooltip(prev => ({ ...prev, [solution.id]: true }))}
                          onMouseLeave={() => setShowTooltip(prev => ({ ...prev, [solution.id]: false }))}
                          disabled={isAnalyzing[solution.id] || solution.text.length < 10}
                          className={`flex items-center px-4 py-2 rounded-lg ${
                            isAnalyzing[solution.id] || solution.text.length < 10
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isAnalyzing[solution.id] ? (
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
                        
                        {showTooltip[solution.id] && !isAnalyzing[solution.id] && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gray-900 text-white text-sm rounded-lg py-1 px-3 whitespace-nowrap">
                              Get AI feedback on your solution
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAnalyzing[solution.id] && feedbacks[solution.id]?.length > 0 && (
                      <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
                        {renderTextWithFeedback(solution.id, solution.text)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}