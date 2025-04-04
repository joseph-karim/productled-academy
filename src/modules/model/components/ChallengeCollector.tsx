import React from 'react';
import { useModelInputsStore } from '../store/modelInputsStore';
import { Challenge } from '../services/ai/analysis/types';
import { MessageSquarePlus, HelpCircle, Loader2, PlusCircle } from 'lucide-react';
import { analyzeText } from '../services/ai/feedback';
import { suggestChallenges } from '../services/ai/suggestions';

type UserLevel = 'beginner' | 'intermediate' | 'advanced';

interface Feedback { id: string; startIndex: number; endIndex: number; /* ... other props */ }

interface ChallengeCollectorProps {
  readOnly?: boolean;
}

export function ChallengeCollector({ readOnly = false }: ChallengeCollectorProps) {
  const { 
    productDescription,
    outcomes,
    challenges, 
    addChallenge, 
    updateChallenge, 
    removeChallenge 
  } = useModelInputsStore();
  
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<Record<string, Feedback[]>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});

  const userLevels: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

  const examples = {
    beginner: [
      "Difficulty understanding technical terminology",
      "Overwhelmed by complex interface options",
      "Struggle with basic workflow concepts"
    ],
    intermediate: [
      "Need more advanced customization options",
      "Limited integration capabilities",
      "Lack of team collaboration features"
    ],
    advanced: [
      "Missing enterprise-grade security controls",
      "No API access for custom automation",
      "Insufficient performance monitoring tools"
    ]
  };

  const handleAddChallenge = (level: UserLevel) => {
    if (readOnly) return;
    
    const outcome = outcomes.find((o: any) => o.level === level);
    if (!outcome) {
      alert(`Please define the ${level} user outcome first`);
      return;
    }

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      magnitude: 3,
      level,
    };
    addChallenge(newChallenge);
  };

  const handleGetSuggestions = async (level: UserLevel) => {
    if (readOnly) return;
    
    const outcome = outcomes.find((o: any) => o.level === level);
    if (!outcome || !productDescription) return;
    
    setIsGenerating(prev => ({ ...prev, [level]: true }));
    
    try {
      const suggestions = await suggestChallenges(
        level,
        productDescription,
        outcome.text
      );
      
      suggestions.forEach(suggestion => {
        const newChallenge: Challenge = {
          id: crypto.randomUUID(),
          title: suggestion.title,
          description: suggestion.description,
          magnitude: suggestion.magnitude,
          level,
        };
        addChallenge(newChallenge);
      });
    } catch (error) {
      console.error('Error generating challenges:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [level]: false }));
    }
  };

  const handleGetFeedback = async (challengeId: string, title: string, description?: string) => {
    if (readOnly) return;
    if (title.length < 3) return;
    
    setIsAnalyzing(prev => ({ ...prev, [challengeId]: true }));
    try {
      const result = await analyzeText(
        description ? `${title}\n\n${description}` : title, 
        'Challenge'
      );
      if (result?.feedbacks) {
        setFeedbacks(prev => ({ ...prev, [challengeId]: result.feedbacks }));
      }
      setIsAnalyzing(prev => ({ ...prev, [challengeId]: false }));
    } catch (error) {
      console.error("Error getting feedback:", error);
      setIsAnalyzing(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleAcceptFeedback = (challengeId: string, feedbackId: string) => {
    if (readOnly) return;
    setFeedbacks(prev => ({
      ...prev,
      [challengeId]: prev[challengeId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const handleDismissFeedback = (challengeId: string, feedbackId: string) => {
    if (readOnly) return;
    setFeedbacks(prev => ({
      ...prev,
      [challengeId]: prev[challengeId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const renderTextWithFeedback = (challengeId: string, text: string) => {
    const challengeFeedbacks = feedbacks[challengeId] || [];
    if (challengeFeedbacks.length === 0) return null;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedFeedbacks = [...challengeFeedbacks].sort((a, b) => a.startIndex - b.startIndex);

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
          <h2 className="text-2xl font-bold text-white">User Challenges</h2>
          <p className="text-gray-400">
            Identify the key challenges your users face at different experience levels.
            Rate the magnitude of each challenge from 1 (minor) to 5 (major).
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
            <h3 className="framework-heading">Challenge Framework</h3>
            <ul className="mt-2 space-y-2">
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Be specific about the difficulty or limitation</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Explain the impact on user productivity or goals</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Consider both technical and non-technical aspects</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Think about immediate and long-term challenges</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <h3 className="framework-heading">Examples by Level</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {userLevels.map((level) => (
                <div key={level} className="text-sm">
                  <h4 className="text-white font-medium capitalize mb-2">{level}</h4>
                  <ul className="space-y-2">
                    {examples[level as keyof typeof examples].map((example: string, index: number) => (
                      <li key={index} className="framework-list-item">
                        <span className="framework-bullet" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {userLevels.map((level) => {
        const outcome = outcomes.find((o: any) => o.level === level);
        const levelChallenges = challenges.filter((c: Challenge) => c.level === level);
        
        return (
          <div key={level} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white capitalize">{level} Users</h3>
                {outcome && (
                  <p className="text-sm text-gray-400 mt-1">
                    Outcome: {outcome.text}
                  </p>
                )}
                {!outcome && (
                  <p className="text-sm text-[#FFD23F] mt-1">
                    Please define the {level} user outcome first
                  </p>
                )}
              </div>
              {!readOnly && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddChallenge(level)}
                    disabled={!outcome}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      !outcome
                        ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Challenge
                  </button>
                  <button
                    onClick={() => handleGetSuggestions(level)}
                    disabled={isGenerating[level] || !outcome || !productDescription}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isGenerating[level] || !outcome || !productDescription
                        ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                    }`}
                  >
                    {isGenerating[level] ? (
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
              )}
            </div>
            
            <div className="space-y-4">
              {levelChallenges.map((challenge: Challenge) => (
                <div key={challenge.id!} className="bg-[#2A2A2A] rounded-lg border border-[#333333] p-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={challenge.title}
                        onChange={(e) => updateChallenge(challenge.id!, { title: e.target.value })}
                        className="w-full p-2 text-lg font-medium bg-[#1C1C1C] text-white border-none focus:ring-2 focus:ring-[#FFD23F] rounded-lg"
                        placeholder="Challenge title..."
                        disabled={readOnly}
                      />
                      <textarea
                        value={challenge.description}
                        onChange={(e) => updateChallenge(challenge.id!, { description: e.target.value })}
                        className="w-full mt-2 p-2 text-gray-300 bg-[#1C1C1C] border-none focus:ring-2 focus:ring-[#FFD23F] rounded-lg resize-none"
                        placeholder="Optional: Provide more details about this challenge..."
                        rows={2}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-white mb-1">
                          Magnitude
                        </label>
                        <select
                          value={challenge.magnitude}
                          onChange={(e) =>
                            updateChallenge(challenge.id!, {
                              magnitude: parseInt(e.target.value),
                            })
                          }
                          className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                          disabled={readOnly}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? '(minor)' : n === 5 ? '(major)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => removeChallenge(challenge.id!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>

                      <button
                        onClick={() => handleGetFeedback(challenge.id!, challenge.title, challenge.description)}
                        disabled={isAnalyzing[challenge.id!] || challenge.title.length < 3}
                        className={`flex items-center px-4 py-2 rounded-lg ${
                          isAnalyzing[challenge.id!] || challenge.title.length < 3
                            ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                            : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                        }`}
                      >
                        {isAnalyzing[challenge.id!] ? (
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

                  {!isAnalyzing[challenge.id!] && feedbacks[challenge.id!]?.length > 0 && (
                    <div className="prose prose-sm max-w-none p-4 bg-[#1C1C1C] rounded-lg">
                      {renderTextWithFeedback(challenge.id!, challenge.description || challenge.title)}
                    </div>
                  )}
                </div>
              ))}

              {!readOnly && levelChallenges.length > 0 && (
                <button
                  onClick={() => handleAddChallenge(level)}
                  disabled={!outcome}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed ${
                    !outcome
                      ? 'border-[#333333] text-gray-500 cursor-not-allowed'
                      : 'border-[#FFD23F] text-[#FFD23F] hover:bg-[#FFD23F]/10'
                  }`}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Another Challenge
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}