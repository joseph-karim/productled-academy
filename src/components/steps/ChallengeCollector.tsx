import React from 'react';
import { useFormStore } from '../../store/formStore';
import { UserLevel, Challenge } from '../../types';
import { MessageSquarePlus, HelpCircle, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { FloatingFeedback, type Feedback } from '../shared/FloatingFeedback';
import { analyzeText, suggestChallenges } from '../../services/ai';

export function ChallengeCollector() {
  const { 
    productDescription,
    outcomes,
    challenges, 
    addChallenge, 
    updateChallenge, 
    removeChallenge 
  } = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<Record<string, Feedback[]>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});
  const [showTooltip, setShowTooltip] = React.useState<Record<string, boolean>>({});

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
    // Only allow adding challenges if there's a corresponding outcome
    const outcome = outcomes.find(o => o.level === level);
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
    const outcome = outcomes.find(o => o.level === level);
    if (!outcome || !productDescription) return;
    
    setIsGenerating(prev => ({ ...prev, [level]: true }));
    
    try {
      const suggestions = await suggestChallenges(
        level,
        productDescription,
        outcome.text
      );
      
      // Add each suggested challenge
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
    }
    
    setIsGenerating(prev => ({ ...prev, [level]: false }));
  };

  const handleGetFeedback = async (challengeId: string, title: string, description?: string) => {
    if (title.length < 3) return;
    
    setIsAnalyzing(prev => ({ ...prev, [challengeId]: true }));
    const result = await analyzeText(
      description ? `${title}\n\n${description}` : title, 
      'Challenge'
    );
    setFeedbacks(prev => ({ ...prev, [challengeId]: result.feedbacks }));
    setIsAnalyzing(prev => ({ ...prev, [challengeId]: false }));
  };

  const handleAcceptFeedback = (challengeId: string, feedbackId: string) => {
    setFeedbacks(prev => ({
      ...prev,
      [challengeId]: prev[challengeId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const handleDismissFeedback = (challengeId: string, feedbackId: string) => {
    setFeedbacks(prev => ({
      ...prev,
      [challengeId]: prev[challengeId]?.filter(f => f.id !== feedbackId) || []
    }));
  };

  const renderTextWithFeedback = (challengeId: string, text: string) => {
    const challengeFeedbacks = feedbacks[challengeId] || [];
    if (challengeFeedbacks.length === 0) return null;

    let result = [];
    let lastIndex = 0;

    // Sort feedbacks by startIndex
    const sortedFeedbacks = [...challengeFeedbacks].sort((a, b) => a.startIndex - b.startIndex);

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
          onAccept={() => handleAcceptFeedback(challengeId, feedback.id)}
          onDismiss={() => handleDismissFeedback(challengeId, feedback.id)}
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
          <h2 className="text-2xl font-bold text-gray-900">User Challenges</h2>
          <p className="text-gray-600">
            Identify the key challenges your users face at different experience levels.
            Rate the magnitude of each challenge from 1 (minor) to 5 (major).
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
            <h3 className="font-medium text-blue-900">Challenge Framework</h3>
            <ul className="mt-2 list-disc list-inside text-blue-800 space-y-2 text-sm">
              <li>Be specific about the difficulty or limitation</li>
              <li>Explain the impact on user productivity or goals</li>
              <li>Consider both technical and non-technical aspects</li>
              <li>Think about immediate and long-term challenges</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-900">Examples by Level</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {userLevels.map((level) => (
                <div key={level} className="text-sm">
                  <h4 className="font-medium text-blue-900 capitalize mb-1">{level}</h4>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    {examples[level].map((example, index) => (
                      <li key={index} className="text-xs">{example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {userLevels.map((level) => {
        const outcome = outcomes.find(o => o.level === level);
        
        return (
          <div key={level} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 capitalize">{level} Users</h3>
                {outcome && (
                  <p className="text-sm text-gray-600 mt-1">
                    Outcome: {outcome.text}
                  </p>
                )}
                {!outcome && (
                  <p className="text-sm text-amber-600 mt-1">
                    Please define the {level} user outcome first
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddChallenge(level)}
                  disabled={!outcome}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    !outcome
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 border border-blue-600 hover:bg-blue-50'
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
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
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
            </div>
            
            <div className="space-y-4">
              {challenges
                .filter((c) => c.level === level)
                .map((challenge) => (
                  <div key={challenge.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={challenge.title}
                          onChange={(e) => updateChallenge(challenge.id, { title: e.target.value })}
                          className="w-full p-2 text-lg font-medium text-gray-900 border-none focus:ring-0"
                          placeholder="Challenge title..."
                        />
                        <textarea
                          value={challenge.description}
                          onChange={(e) => updateChallenge(challenge.id, { description: e.target.value })}
                          className="w-full mt-2 p-2 text-gray-600 border-none focus:ring-0 resize-none"
                          placeholder="Optional: Provide more details about this challenge..."
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Magnitude
                          </label>
                          <select
                            value={challenge.magnitude}
                            onChange={(e) =>
                              updateChallenge(challenge.id, {
                                magnitude: parseInt(e.target.value),
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => removeChallenge(challenge.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>

                      <button
                        onClick={() => handleGetFeedback(challenge.id, challenge.title, challenge.description)}
                        onMouseEnter={() => setShowTooltip(prev => ({ ...prev, [challenge.id]: true }))}
                        onMouseLeave={() => setShowTooltip(prev => ({ ...prev, [challenge.id]: false }))}
                        disabled={isAnalyzing[challenge.id] || challenge.title.length < 3}
                        className={`flex items-center px-4 py-2 rounded-lg ${
                          isAnalyzing[challenge.id] || challenge.title.length < 3
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAnalyzing[challenge.id] ? (
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

                    {!isAnalyzing[challenge.id] && feedbacks[challenge.id]?.length > 0 && (
                      <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
                        {renderTextWithFeedback(challenge.id, challenge.description || challenge.title)}
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