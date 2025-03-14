import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, MessageSquarePlus } from 'lucide-react';
import { analyzeText } from '../../services/ai/feedback';
import { suggestUserEndgame } from '../../services/ai/users';
import type { UserLevel } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';
import { ChatAssistantButton } from '../shared/ChatAssistantButton';

export function UserEndgame() {
  const { outcomes, updateOutcome, idealUser } = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = React.useState<UserLevel>('beginner');
  const [suggestions, setSuggestions] = React.useState<Record<string, Array<{
    category: 'How' | 'Who' | 'Why' | 'Results';
    text: string;
    type: 'improvement' | 'warning' | 'positive';
  }>>>({});
  const [suggestedOutcomes, setSuggestedOutcomes] = React.useState<Record<string, string>>({});

  const examples = {
    beginner: {
      how: `Using ${idealUser?.traits[0] || 'intuitive features'} and guided workflows`,
      who: idealUser?.title || "First-time users learning the basics",
      why: idealUser?.description || "Need to achieve initial success quickly",
      results: idealUser?.impact || "Create first successful outcome in under 5 minutes"
    },
    intermediate: {
      how: "Team-wide workflows and collaboration features",
      who: `Team of ${idealUser?.title}s` || "Growing teams",
      why: "Need to scale operations and improve team efficiency",
      results: "50% reduction in manual work, improved team coordination"
    },
    advanced: {
      how: "Enterprise controls and strategic automation",
      who: `${idealUser?.title} leaders in enterprise organizations` || "Enterprise teams",
      why: "Need organization-wide impact and governance",
      results: "90% automation of workflows, significant cost savings"
    }
  };

  const levelContexts = {
    beginner: {
      title: "Individual Success",
      description: `Focus on how a single ${idealUser?.title || 'user'} achieves their first wins and builds confidence with the product.`,
      prompt: `What transformation does a new ${idealUser?.title || 'user'} achieve? Consider their immediate goals and quick wins.`
    },
    intermediate: {
      title: "Team Impact",
      description: `Think about how your ideal user leads their team to success. How do they use your product to improve team performance?`,
      prompt: "How does success scale from individual to team level? What team-wide benefits are unlocked?"
    },
    advanced: {
      title: "Business Transformation",
      description: "Consider the broader business impact. How does your product drive organizational change and strategic outcomes?",
      prompt: "What enterprise-level results demonstrate full transformation? Think about business metrics and strategic impact."
    }
  };

  const handleOutcomeChange = (level: UserLevel, text: string) => {
    updateOutcome(level, text);
    setSuggestions(prev => ({ ...prev, [level]: [] }));
    setSuggestedOutcomes(prev => ({ ...prev, [level]: '' }));
    setError(prev => ({ ...prev, [level]: '' }));
  };

  const handleGetFeedback = async (level: UserLevel) => {
    const outcome = outcomes.find(o => o.level === level);
    if (!outcome?.text || outcome.text.length < 10) return;
    
    setIsAnalyzing(prev => ({ ...prev, [level]: true }));
    setError(prev => ({ ...prev, [level]: '' }));
    
    try {
      const result = await analyzeText(outcome.text, 'User Endgame');
      
      const groupedSuggestions = [
        ...result.feedbacks.map(f => ({
          category: f.category as 'How' | 'Who' | 'Why' | 'Results',
          text: f.suggestion,
          type: f.type
        })),
        ...result.missingElements.map(e => ({
          category: e.category as 'How' | 'Who' | 'Why' | 'Results',
          text: e.description,
          type: 'warning' as const
        }))
      ];

      setSuggestions(prev => ({
        ...prev,
        [level]: groupedSuggestions
      }));

      if (result.suggestedText) {
        setSuggestedOutcomes(prev => ({
          ...prev,
          [level]: result.suggestedText!
        }));
      }
    } catch (error) {
      setError(prev => ({
        ...prev,
        [level]: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [level]: false }));
    }
  };

  const handleGetSuggestion = async (level: UserLevel) => {
    if (!idealUser) return;
    
    setIsAnalyzing(prev => ({ ...prev, [level]: true }));
    setError(prev => ({ ...prev, [level]: '' }));
    
    try {
      const result = await suggestUserEndgame(level, idealUser.description);
      updateOutcome(level, result.suggestion);
      
      setSuggestions(prev => ({
        ...prev,
        [level]: [
          {
            category: 'How',
            text: result.breakdown.how,
            type: 'positive'
          },
          {
            category: 'Who',
            text: result.breakdown.who,
            type: 'positive'
          },
          {
            category: 'Why',
            text: result.breakdown.why,
            type: 'positive'
          },
          {
            category: 'Results',
            text: result.breakdown.results,
            type: 'positive'
          }
        ]
      }));
    } catch (error) {
      setError(prev => ({
        ...prev,
        [level]: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [level]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">User Endgame</h2>
          <p className="text-gray-400">
            Define the transformation and value your users achieve at each level, starting with your ideal user's individual success.
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
            <h3 className="framework-heading">Success Framework</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-[#FFD23F] font-medium mb-2">Individual Success</h4>
                <p className="text-sm text-gray-300">
                  Start with your ideal user's first wins. What immediate value do they achieve?
                </p>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-[#FFD23F] font-medium mb-2">Team Impact</h4>
                <p className="text-sm text-gray-300">
                  How does success scale to their team? What collective benefits are unlocked?
                </p>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-[#FFD23F] font-medium mb-2">Business Transformation</h4>
                <p className="text-sm text-gray-300">
                  What organization-wide impact demonstrates complete transformation?
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="framework-heading mb-3">Example Progression</h3>
            <div className="flex space-x-2 mb-4">
              {(['beginner', 'intermediate', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    activeTab === tab
                      ? 'bg-[#FFD23F] text-[#1C1C1C]'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">How & Who</h4>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-[#FFD23F]">How:</span> {examples[activeTab].how}</p>
                  <p><span className="text-[#FFD23F]">Who:</span> {examples[activeTab].who}</p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Why & Results</h4>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-[#FFD23F]">Why:</span> {examples[activeTab].why}</p>
                  <p><span className="text-[#FFD23F]">Results:</span> {examples[activeTab].results}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
          const outcome = outcomes.find(o => o.level === level);
          const context = levelContexts[level];
          
          return (
            <div key={level} className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{context.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{context.description}</p>
                  </div>
                  {level !== 'beginner' && (
                    <span className="text-xs text-gray-500 italic">Optional</span>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mb-2 mt-4">
                  <button
                    onClick={() => handleGetSuggestion(level)}
                    disabled={!idealUser || isAnalyzing[level]}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      !idealUser || isAnalyzing[level]
                        ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] hover:bg-[#FFD23F] hover:text-[#1C1C1C]'
                    }`}
                  >
                    {isAnalyzing[level] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <MessageSquarePlus className="w-4 h-4 mr-2" />
                        Get AI Suggestion
                      </>
                    )}
                  </button>
                  <ChatAssistantButton label="Use Chat Assistant" />
                  <button
                    onClick={() => handleGetFeedback(level)}
                    disabled={isAnalyzing[level] || !outcome?.text || outcome.text.length < 10}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isAnalyzing[level] || !outcome?.text || outcome.text.length < 10
                        ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                    }`}
                  >
                    {isAnalyzing[level] ? (
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

                <textarea
                  value={outcome?.text || ''}
                  onChange={(e) => handleOutcomeChange(level, e.target.value)}
                  className="pl-input w-full h-32"
                  placeholder={context.prompt}
                />
              </div>

              {error[level] && (
                <ErrorMessage
                  message={error[level]}
                  onRetry={() => handleGetFeedback(level)}
                />
              )}

              {!isAnalyzing[level] && suggestedOutcomes[level] && (
                <div className="bg-[#2A2A2A] border border-[#FFD23F] rounded-lg p-4">
                  <p className="text-[#FFD23F]">{suggestedOutcomes[level]}</p>
                </div>
              )}

              {!isAnalyzing[level] && suggestions[level]?.length > 0 && (
                <div className="space-y-4">
                  {(['How', 'Who', 'Why', 'Results'] as const).map(category => {
                    const categorySuggestions = suggestions[level].filter(s => s.category === category);
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
          );
        })}
      </div>
    </div>
  );
}