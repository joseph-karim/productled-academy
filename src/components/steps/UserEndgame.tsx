import React from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, MessageSquarePlus, CheckCircle, Users } from 'lucide-react';
import { analyzeText, suggestUserEndgame } from '../../services/ai';
import type { UserLevel } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';

export function UserEndgame() {
  const { productDescription, outcomes, updateOutcome } = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState<Record<string, boolean>>({});
  const [isSuggesting, setIsSuggesting] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = React.useState<UserLevel>('beginner');
  const [suggestions, setSuggestions] = React.useState<Record<string, Array<{
    category: 'How' | 'Who' | 'Why' | 'Results';
    text: string;
    type: 'improvement' | 'warning' | 'positive';
  }>>>({});
  const [suggestedOutcomes, setSuggestedOutcomes] = React.useState<Record<string, string>>({});
  const [breakdowns, setBreakdowns] = React.useState<Record<string, {
    how: string;
    who: string;
    why: string;
    results: string;
    roles?: {
      individual: string;
      manager?: string;
      director?: string;
    };
  }>>({});

  const examples = {
    beginner: {
      how: "Simple drag-and-drop interface and pre-built templates",
      who: "Non-technical users who need to create professional documents",
      why: "Manual document creation is time-consuming and error-prone",
      results: "Create first document in under 5 minutes, 60% faster than traditional methods"
    },
    intermediate: {
      how: "Advanced customization options and workflow automation",
      who: "Teams managing regular document workflows",
      why: "Need to scale document operations while maintaining consistency",
      results: "50% reduction in review cycles, 40% increase in team productivity"
    },
    advanced: {
      how: "API integration, custom branding, and enterprise controls",
      who: "Large organizations with complex document needs",
      why: "Require enterprise-grade security and compliance features",
      results: "90% automation of document workflows, $200K annual cost savings"
    }
  };

  const handleOutcomeChange = (level: UserLevel, text: string) => {
    updateOutcome(level, text);
    setSuggestions(prev => ({ ...prev, [level]: [] }));
    setSuggestedOutcomes(prev => ({ ...prev, [level]: '' }));
    setError(prev => ({ ...prev, [level]: '' }));
  };

  const handleGetSuggestion = async (level: UserLevel) => {
    if (!productDescription) return;
    
    setIsSuggesting(prev => ({ ...prev, [level]: true }));
    setError(prev => ({ ...prev, [level]: '' }));
    
    try {
      const result = await suggestUserEndgame(level, productDescription);
      setSuggestedOutcomes(prev => ({
        ...prev,
        [level]: result.suggestion
      }));
      setBreakdowns(prev => ({
        ...prev,
        [level]: {
          ...result.breakdown,
          roles: result.roles
        }
      }));
    } catch (error) {
      setError(prev => ({
        ...prev,
        [level]: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    } finally {
      setIsSuggesting(prev => ({ ...prev, [level]: false }));
    }
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

  const handleAcceptSuggestion = (level: UserLevel) => {
    const suggestedOutcome = suggestedOutcomes[level];
    if (suggestedOutcome) {
      updateOutcome(level, suggestedOutcome);
      setSuggestedOutcomes(prev => ({ ...prev, [level]: '' }));
      setSuggestions(prev => ({ ...prev, [level]: [] }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Endgame</h2>
          <p className="text-gray-600 mt-1">
            Describe the transformation and value your users achieve. Focus on how you solve their problems, who benefits, why it matters, and measurable results.
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
            <h3 className="font-medium text-blue-900">Value Proposition Structure</h3>
            <ul className="mt-2 list-disc list-inside text-blue-800 space-y-2 text-sm">
              <li>How: Key features/approach that enable the transformation</li>
              <li>Who: Target audience segments and their needs</li>
              <li>Why: Problems solved and pain points addressed</li>
              <li>Results: Specific, measurable outcomes and benefits</li>
            </ul>
          </div>

          <div className="border-t border-blue-100 pt-4">
            <h3 className="font-medium text-blue-900 mb-3">Examples by User Level</h3>
            <div className="flex space-x-2 mb-4">
              {(['beginner', 'intermediate', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">How & Who</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">How:</span> {examples[activeTab].how}</p>
                  <p><span className="font-medium">Who:</span> {examples[activeTab].who}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Why & Results</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">Why:</span> {examples[activeTab].why}</p>
                  <p><span className="font-medium">Results:</span> {examples[activeTab].results}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
          const outcome = outcomes.find(o => o.level === level);
          const breakdown = breakdowns[level];
          
          return (
            <div key={level} className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-900 capitalize mb-1">
                  {level} User Outcome {level === 'beginner' && <span className="text-red-500">*</span>}
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  {level === 'beginner' 
                    ? 'What transformation do new users achieve with your product?'
                    : level === 'intermediate'
                    ? 'How do regular users expand their capabilities?'
                    : 'What advanced outcomes do power users unlock?'}
                </p>

                <div className="flex justify-end space-x-2 mb-2">
                  <button
                    onClick={() => handleGetSuggestion(level)}
                    disabled={isSuggesting[level] || !productDescription}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isSuggesting[level] || !productDescription
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSuggesting[level] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Get AI Suggestion
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleGetFeedback(level)}
                    disabled={isAnalyzing[level] || !outcome?.text || outcome.text.length < 10}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isAnalyzing[level] || !outcome?.text || outcome.text.length < 10
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Describe the transformation and outcomes for ${level} users...`}
                />
              </div>

              {error[level] && (
                <ErrorMessage
                  message={error[level]}
                  onRetry={() => handleGetFeedback(level)}
                />
              )}

              {!isSuggesting[level] && breakdown && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-green-900">AI Suggestion</h4>
                    <button
                      onClick={() => handleAcceptSuggestion(level)}
                      className="flex items-center text-sm text-green-700 hover:text-green-900"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Use This Outcome
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-800">How</h5>
                      <p className="text-sm text-green-700 mt-1">{breakdown.how}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800">Who</h5>
                      <p className="text-sm text-green-700 mt-1">{breakdown.who}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800">Why</h5>
                      <p className="text-sm text-green-700 mt-1">{breakdown.why}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800">Results</h5>
                      <p className="text-sm text-green-700 mt-1">{breakdown.results}</p>
                    </div>
                  </div>

                  {breakdown.roles && (
                    <div className="border-t border-green-200 pt-4">
                      <h5 className="font-medium text-green-800 mb-2">Role-Specific Outcomes</h5>
                      <div className="space-y-2">
                        <div>
                          <h6 className="text-sm font-medium text-green-800">Individual Contributors</h6>
                          <p className="text-sm text-green-700">{breakdown.roles.individual}</p>
                        </div>
                        {breakdown.roles.manager && (
                          <div>
                            <h6 className="text-sm font-medium text-green-800">Line Managers</h6>
                            <p className="text-sm text-green-700">{breakdown.roles.manager}</p>
                          </div>
                        )}
                        {breakdown.roles.director && (
                          <div>
                            <h6 className="text-sm font-medium text-green-800">Functional Directors</h6>
                            <p className="text-sm text-green-700">{breakdown.roles.director}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-green-200 pt-4">
                    <p className="text-sm text-green-900 font-medium">Suggested Outcome:</p>
                    <p className="text-green-800 mt-2">{suggestedOutcomes[level]}</p>
                  </div>
                </div>
              )}

              {!isAnalyzing[level] && suggestions[level]?.length > 0 && (
                <div className="space-y-4">
                  {(['How', 'Who', 'Why', 'Results'] as const).map(category => {
                    const categorySuggestions = suggestions[level].filter(s => s.category === category);
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
          );
        })}
      </div>
    </div>
  );
}