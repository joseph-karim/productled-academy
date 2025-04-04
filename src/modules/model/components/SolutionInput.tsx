import React from 'react';
import { useModelInputsStore } from '../store/modelInputsStore';
import type { Solution as BaseSolution, Challenge } from '../services/ai/analysis/types';
import { MessageSquarePlus, HelpCircle, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { analyzeText } from '../services/ai/feedback';
import { suggestSolutions, suggestCoreSolutions } from '../services/ai/suggestions';

type SolutionType = 'product' | 'resource' | 'content';
type SolutionCost = 'low' | 'medium' | 'high';
type SolutionImpact = 'low' | 'medium' | 'high';

interface Solution extends BaseSolution {
  impact: SolutionImpact;
  category?: 'core' | string;
}

interface Feedback {
  id: string;
  text: string;
  suggestion: string;
  type: 'improvement' | 'warning' | 'positive';
  category: string;
  startIndex: number;
  endIndex: number;
}

interface SolutionInputProps {
  readOnly?: boolean;
}

export function SolutionInput({ readOnly = false }: SolutionInputProps) {
  const { 
    productDescription,
    outcomes,
    challenges, 
    solutions, 
    addSolution, 
    updateSolution, 
    removeSolution, 
    addCoreSolution,
    setProcessingState 
  } = useModelInputsStore();
  
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<Record<string, Feedback[]>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [showTooltip, setShowTooltip] = React.useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);
  const [isGeneratingCore, setIsGeneratingCore] = React.useState(false);

  const solutionTypes: Record<SolutionType, string> = {
    product: 'Product Feature',
    resource: 'Resource/Tool',
    content: 'Content/Guide'
  };

  const handleAddCoreSolution = () => {
    if (readOnly) return;
    
    const newSolution: Solution = {
      id: crypto.randomUUID(),
      text: '',
      type: 'product',
      cost: 'medium',
      impact: 'medium',
      category: 'core'
    };
    addCoreSolution(newSolution);
  };

  const handleGenerateCoreSolutions = async () => {
    if (readOnly) return;
    if (!productDescription) return;
    
    setIsGeneratingCore(true);
    setProcessingState({ solutions: true });
    
    try {
      const suggestions = await suggestCoreSolutions(productDescription);
      
      suggestions.forEach(suggestion => {
        const newSolution: Solution = {
          id: crypto.randomUUID(),
          text: suggestion.text,
          type: suggestion.type as SolutionType,
          cost: suggestion.cost as SolutionCost,
          impact: suggestion.impact as SolutionImpact,
          category: 'core'
        };
        addCoreSolution(newSolution);
      });
    } catch (error) {
      console.error('Error generating core solutions:', error);
    } finally {
      setIsGeneratingCore(false);
      setProcessingState({ solutions: false });
    }
  };

  const handleAddSolution = (challengeId: string) => {
    if (readOnly) return;
    
    const newSolution: Solution = {
      id: crypto.randomUUID(),
      text: '',
      type: 'product',
      cost: 'medium',
      impact: 'medium',
      challengeId,
    };
    addSolution(newSolution);
  };

  const handleGetSuggestions = async (challengeId: string) => {
    if (readOnly) return;
    
    const challenge = challenges.find((c: Challenge) => c.id === challengeId);
    const outcome = outcomes.find((o: any) => o.level === challenge?.level);
    if (!challenge || !productDescription || !outcome || !challenge.title) return;
    
    setIsGenerating(prev => ({ ...prev, [challengeId]: true }));
    setProcessingState({ solutions: true });
    
    try {
      const result = await suggestSolutions(
        challenge.title,
        challenge.description,
        productDescription,
        outcome.text
      );
      
      result.suggestions.forEach(suggestion => {
        const newSolution: Solution = {
          id: crypto.randomUUID(),
          text: suggestion.text,
          type: suggestion.type as SolutionType,
          cost: suggestion.cost as SolutionCost,
          impact: suggestion.impact as SolutionImpact,
          challengeId,
        };
        addSolution(newSolution);
      });
    } catch (error) {
      console.error('Error generating solutions:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [challengeId]: false }));
      setProcessingState({ solutions: false });
    }
  };

  const handleGenerateAllSolutions = async () => {
    if (readOnly) return;
    if (!productDescription) return;
    
    setIsGeneratingAll(true);
    setProcessingState({ solutions: true });
    
    try {
      for (const challenge of challenges) {
        const outcome = outcomes.find((o: any) => o.level === challenge.level);
        if (!outcome || !challenge.id || !challenge.title) continue;
        
        try {
          const result = await suggestSolutions(
            challenge.title,
            challenge.description,
            productDescription,
            outcome.text
          );
          
          result.suggestions.forEach(suggestion => {
            const newSolution: Solution = {
              id: crypto.randomUUID(),
              text: suggestion.text,
              type: suggestion.type as SolutionType,
              cost: suggestion.cost as SolutionCost,
              impact: suggestion.impact as SolutionImpact,
              challengeId: challenge.id,
            };
            addSolution(newSolution);
          });
        } catch (err) {
          console.error(`Error generating solutions for challenge ${challenge.id}:`, err);
        }
      }
    } catch (error) {
      console.error('Error generating all solutions:', error);
    } finally {
      setIsGeneratingAll(false);
      setProcessingState({ solutions: false });
    }
  };

  const handleGetFeedback = async (solutionId: string, text: string) => {
    if (readOnly) return;
    if (text.length < 10) return;
    
    setIsAnalyzing(prev => ({ ...prev, [solutionId]: true }));
    setProcessingState({ solutions: true });
    
    try {
      const result = await analyzeText(text, 'Solution');
      if (Array.isArray(result?.feedbacks)) {
        setFeedbacks(prev => ({ ...prev, [solutionId]: result.feedbacks }));
      } else {
        console.warn('Received non-array feedbacks:', result?.feedbacks);
        setFeedbacks(prev => ({ ...prev, [solutionId]: [] }));
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [solutionId]: false }));
      setProcessingState({ solutions: false });
    }
  };

  const handleAcceptFeedback = (solutionId: string, feedbackId: string) => {
    if (readOnly) return;
    setFeedbacks(prev => ({
      ...prev,
      [solutionId]: prev[solutionId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const handleDismissFeedback = (solutionId: string, feedbackId: string) => {
    if (readOnly) return;
    setFeedbacks(prev => ({
      ...prev,
      [solutionId]: prev[solutionId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const renderTextWithFeedback = (solutionId: string, text: string) => {
    const solutionFeedbacks = feedbacks[solutionId] || [];
    if (solutionFeedbacks.length === 0) return null;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedFeedbacks = [...solutionFeedbacks].sort((a, b) => a.startIndex - b.startIndex);

    sortedFeedbacks.forEach((feedback) => {
      if (feedback.startIndex > lastIndex) {
        const textSlice = text.slice(lastIndex, feedback.startIndex);
        result.push(textSlice);
      }

      const highlightedText = text.slice(feedback.startIndex, feedback.endIndex);
      result.push(<span key={`${feedback.id}-text`} style={{ backgroundColor: 'yellow', color: 'black' }}>{highlightedText}</span>);

      lastIndex = feedback.endIndex;
    });

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Solutions</h2>
          <p className="text-gray-400">
            Define core features and challenge-specific solutions with their type, cost, and business impact.
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
            <h3 className="framework-heading">Solution Framework</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium">Core Features</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Essential product functionality</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Key differentiators</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Must-have capabilities</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium">Challenge Solutions</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Specific problem solutions</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>User journey enablers</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Success accelerators</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Features Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Core Features</h3>
          {!readOnly && (
            <button
              onClick={handleGenerateCoreSolutions}
              disabled={isGeneratingCore || !productDescription}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isGeneratingCore || !productDescription
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
            >
              {isGeneratingCore ? (
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
          )}
        </div>

        <div className="space-y-4">
          {solutions
            .filter((s: Solution) => s.category === 'core')
            .map((solution: Solution) => {
              if (!solution.id) return null;
              return (
                <div key={solution.id} className="bg-[#2A2A2A] rounded-lg border border-[#333333] p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={solution.text}
                        onChange={(e) => updateSolution(solution.id, { text: e.target.value })}
                        className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                        placeholder="Describe your solution..."
                        disabled={readOnly}
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
                        className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                        disabled={readOnly}
                      >
                        {Object.entries(solutionTypes).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={solution.cost}
                        onChange={(e) =>
                          updateSolution(solution.id, {
                            cost: e.target.value as SolutionCost,
                          })
                        }
                        className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                        disabled={readOnly}
                      >
                        <option value="low">Low Cost</option>
                        <option value="medium">Medium Cost</option>
                        <option value="high">High Cost</option>
                      </select>
                      <select
                        value={solution.impact}
                        onChange={(e) =>
                          updateSolution(solution.id, {
                            impact: e.target.value as SolutionImpact,
                          })
                        }
                        className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                        disabled={readOnly}
                      >
                        <option value="low">Low Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="high">High Impact</option>
                      </select>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => removeSolution(solution.id!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>

                      <button
                        onClick={() => handleGetFeedback(solution.id!, solution.text)}
                        onMouseEnter={() => setShowTooltip(prev => ({ ...prev, [solution.id!]: true }))}
                        onMouseLeave={() => setShowTooltip(prev => ({ ...prev, [solution.id!]: false }))}
                        disabled={isAnalyzing[solution.id!] || solution.text.length < 10}
                        className={`flex items-center px-4 py-2 rounded-lg ${
                          isAnalyzing[solution.id!] || solution.text.length < 10
                            ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                            : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                        }`}
                      >
                        {isAnalyzing[solution.id!] ? (
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

                  {!isAnalyzing[solution.id!] && feedbacks[solution.id!]?.length > 0 && (
                    <div className="prose prose-sm max-w-none p-4 bg-[#1C1C1C] rounded-lg">
                      {renderTextWithFeedback(solution.id!, solution.text)}
                    </div>
                  )}
                </div>
              );
            })}

          {!readOnly && (
            <button
              onClick={handleAddCoreSolution}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Core Feature
            </button>
          )}
        </div>
      </div>

      {/* Challenge Solutions Section */}
      <div className="border-t border-[#333333] pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Challenge Solutions</h3>
          {!readOnly && (
            <button
              onClick={handleGenerateAllSolutions}
              disabled={isGeneratingAll || !productDescription || challenges.length === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isGeneratingAll || !productDescription || challenges.length === 0
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating All Solutions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate All Solutions
                </>
              )}
            </button>
          )}
        </div>

        {challenges.map((challenge: Challenge) => {
          const challengeSolutions = solutions.filter((s: Solution) => s.challengeId === challenge.id);
          
          if (!challenge.id) return null;

          return (
            <div key={challenge.id} className="space-y-4">
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white">
                  {challenge.title}
                </h3>
                {challenge.description && (
                  <p className="text-gray-400 mt-2">{challenge.description}</p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                  <span>Level: <span className="capitalize">{challenge.level}</span></span>
                  <span>Magnitude: {challenge.magnitude}</span>
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center justify-between space-x-2">
                  <button
                    onClick={() => handleGetSuggestions(challenge.id!)}
                    disabled={isGenerating[challenge.id!] || !productDescription}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isGenerating[challenge.id!] || !productDescription
                        ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                    }`}
                  >
                    {isGenerating[challenge.id!] ? (
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
                  <button
                    onClick={() => handleAddSolution(challenge.id!)}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Solution
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {challengeSolutions.map((solution: Solution) => {
                  if (!solution.id) return null;
                  return (
                    <div key={solution.id} className="bg-[#2A2A2A] rounded-lg border border-[#333333] p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={solution.text}
                            onChange={(e) => updateSolution(solution.id, { text: e.target.value })}
                            className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            placeholder="Describe your solution..."
                            disabled={readOnly}
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
                            className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            disabled={readOnly}
                          >
                            {Object.entries(solutionTypes).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={solution.cost}
                            onChange={(e) =>
                              updateSolution(solution.id, {
                                cost: e.target.value as SolutionCost,
                              })
                            }
                            className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            disabled={readOnly}
                          >
                            <option value="low">Low Cost</option>
                            <option value="medium">Medium Cost</option>
                            <option value="high">High Cost</option>
                          </select>
                          <select
                            value={solution.impact}
                            onChange={(e) =>
                              updateSolution(solution.id, {
                                impact: e.target.value as SolutionImpact,
                              })
                            }
                            className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            disabled={readOnly}
                          >
                            <option value="low">Low Impact</option>
                            <option value="medium">Medium Impact</option>
                            <option value="high">High Impact</option>
                          </select>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => removeSolution(solution.id!)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => handleGetFeedback(solution.id!, solution.text)}
                              onMouseEnter={() => setShowTooltip(prev => ({ ...prev, [solution.id!]: true }))}
                              onMouseLeave={() => setShowTooltip(prev => ({ ...prev, [solution.id!]: false }))}
                              disabled={isAnalyzing[solution.id!] || solution.text.length < 10}
                              className={`flex items-center px-4 py-2 rounded-lg ${
                                isAnalyzing[solution.id!] || solution.text.length < 10
                                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                              }`}
                            >
                              {isAnalyzing[solution.id!] ? (
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
                            
                            {showTooltip[solution.id!] && !isAnalyzing[solution.id!] && (
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
                                <div className="bg-[#1C1C1C] text-white text-sm rounded-lg py-1 px-3 whitespace-nowrap">
                                  Get AI feedback on your solution
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#1C1C1C]"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!isAnalyzing[solution.id!] && feedbacks[solution.id!]?.length > 0 && (
                        <div className="prose prose-sm max-w-none p-4 bg-[#1C1C1C] rounded-lg">
                          {renderTextWithFeedback(solution.id!, solution.text)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!readOnly && challengeSolutions.length > 0 && (
                  <button
                    onClick={() => handleAddSolution(challenge.id!)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Another Solution
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}