import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { 
  Loader2, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Sparkles,
  Mic,
  Volume2
} from 'lucide-react';

// Scorecard item type
interface ScorecardItem {
  item: string;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  justification: string;
}

// Rating component to display colored badges
const RatingBadge = ({ rating }: { rating: string }) => {
  let bgColor = '';
  let textColor = 'text-white';
  
  switch (rating) {
    case 'Excellent':
      bgColor = 'bg-green-600';
      break;
    case 'Good':
      bgColor = 'bg-blue-600';
      break;
    case 'Fair':
      bgColor = 'bg-yellow-600';
      break;
    case 'Poor':
      bgColor = 'bg-red-600';
      break;
    default:
      bgColor = 'bg-gray-600';
  }
  
  return (
    <span className={`${bgColor} ${textColor} text-xs font-semibold px-2.5 py-0.5 rounded`}>
      {rating}
    </span>
  );
};

export function AnalysisActionPlan({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    // Offer details
    title,
    userSuccess,
    topResults,
    advantages,
    risks,
    assurances,
    heroSection,
    problemSection,
    solutionSection,
    socialProof,
    ctaSection,
    aestheticsChecklistCompleted,
    
    // Analysis data
    offerScorecard,
    offerAnalysisFeedback,
    suggestedNextSteps,
    isAnalyzingOffer,
    analysisError,
    
    // Actions
    runFinalAnalysis
  } = useOfferStore();
  
  // Local state
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    scorecard: true,
    feedback: true,
    nextSteps: true,
    chat: false
  });
  
  type MessageRole = 'user' | 'assistant' | 'system';
  
  const [chatMessages, setChatMessages] = useState<Array<{role: MessageRole, content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [isVoiceOutputActive, setIsVoiceOutputActive] = useState(false);
  
  // Helper to toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Helper to get top items
  const getTopItems = <T extends { id: string }>(items: T[], count: number = 3): T[] => {
    return items.slice(0, count);
  };
  
  // Effect to run analysis if not already done
  useEffect(() => {
    if (!offerScorecard && !isAnalyzingOffer && !readOnly) {
      runFinalAnalysis();
    }
  }, [offerScorecard, isAnalyzingOffer, readOnly, runFinalAnalysis]);
  
  // Effect to initialize chat when analysis is complete
  useEffect(() => {
    if (offerScorecard && offerAnalysisFeedback && suggestedNextSteps && chatMessages.length === 0) {
      // Start with a system message that includes context
      const scorecardSummary = offerScorecard
        .map(item => `${item.item}: ${item.rating}`)
        .join(', ');
      
      const nextStepsList = suggestedNextSteps.join(', ');
      
      const systemPrompt = `You are a ProductLed coach AI assistant. The user just received this evaluation of their offer: Scorecard Summary=[${scorecardSummary}], Feedback=[${offerAnalysisFeedback}]. Suggested Next Steps are: [${nextStepsList}]. Your goal is to help the user process this feedback and create a concrete action plan. Start by asking for their reaction to the scorecard.`;
      
      const systemMessage: {role: MessageRole, content: string} = { 
        role: 'system', 
        content: systemPrompt 
      };
      
      const assistantMessage: {role: MessageRole, content: string} = { 
        role: 'assistant', 
        content: "Hi there! I've analyzed your offer based on ProductLed principles. What's your first reaction to the scorecard and feedback? Is there a specific area you'd like to discuss first?" 
      };
      
      setChatMessages([systemMessage, assistantMessage]);
    }
  }, [offerScorecard, offerAnalysisFeedback, suggestedNextSteps, chatMessages]);
  
  // Handle sending a chat message
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    try {
      // Add user message
      const userMessage: {role: MessageRole, content: string} = { 
        role: 'user', 
        content: currentMessage 
      };
      
      const newMessages = [
        ...chatMessages,
        userMessage
      ];
      setChatMessages(newMessages);
      setCurrentMessage('');
      
      // In a production implementation, this would integrate with the AI service
      const analysisContext = {
        scorecard: offerScorecard || [],
        feedback: offerAnalysisFeedback || "",
        nextSteps: suggestedNextSteps || []
      };
      
      setTimeout(() => {
        // Simulated response - would use getAnalysisCoachResponse from AI service in production
        const simulatedResponse = "That's a great question! Based on your offer details, I'd recommend focusing on clarifying your value proposition in the hero section first. The advantage statements are strong, but they could be more directly tied to your user success statement. Would you like me to help you refine a specific element of your offer?";
        
        const assistantResponse: {role: MessageRole, content: string} = { 
          role: 'assistant', 
          content: simulatedResponse 
        };
        
        setChatMessages([
          ...newMessages,
          assistantResponse
        ]);
        
        // If voice output is active, would trigger text-to-speech here
        if (isVoiceOutputActive) {
          // voiceService.speak(simulatedResponse);
          console.log('Voice output would speak:', simulatedResponse);
        }
      }, 1000);
      
      // In production, this would be:
      /*
      import { getAnalysisCoachResponse } from '../services/ai';
      
      const response = await getAnalysisCoachResponse(
        newMessages, 
        {
          scorecard: offerScorecard || [],
          feedback: offerAnalysisFeedback || "",
          nextSteps: suggestedNextSteps || []
        }
      );
      
      const assistantResponse = { 
        role: 'assistant' as MessageRole, 
        content: response 
      };
      
      setChatMessages([...newMessages, assistantResponse]);
      
      if (isVoiceOutputActive) {
        // Voice service implementation
      }
      */
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error appropriately in UI
    }
  };
  
  // Toggle voice input
  const toggleVoiceInput = () => {
    setIsVoiceInputActive(!isVoiceInputActive);
    // In real implementation, would start/stop voice recognition
    if (!isVoiceInputActive) {
      // voiceService.startListening(text => setCurrentMessage(text));
      console.log('Voice input started');
    } else {
      // voiceService.stopListening();
      console.log('Voice input stopped');
    }
  };
  
  // Toggle voice output
  const toggleVoiceOutput = () => {
    setIsVoiceOutputActive(!isVoiceOutputActive);
    console.log('Voice output:', !isVoiceOutputActive ? 'enabled' : 'disabled');
  };
  
  // Generate mock scorecard data for demo purposes
  // In a real implementation, this would come from the AI service
  const generateMockScorecard = (): ScorecardItem[] => [
    {
      item: 'Result Clarity',
      rating: 'Good',
      justification: 'Main result is clearly articulated but could be more specific with metrics.'
    },
    {
      item: 'Advantage Clarity',
      rating: 'Fair',
      justification: 'Advantages are listed but unique differentiation could be stronger.'
    },
    {
      item: 'Risk Reduction',
      rating: 'Excellent',
      justification: 'All major objections addressed with compelling assurances.'
    },
    {
      item: 'Hero Communication',
      rating: 'Good',
      justification: 'Tagline communicates value but could be more attention-grabbing.'
    },
    {
      item: 'Problem Resonance',
      rating: 'Good',
      justification: 'Underlying problem will resonate with target audience.'
    },
    {
      item: 'Solution Completeness',
      rating: 'Fair',
      justification: 'Solution steps need more detail on implementation specifics.'
    },
    {
      item: 'Trust Elements',
      rating: 'Poor',
      justification: 'More specific social proof needed with quantifiable results.'
    },
    {
      item: 'Call to Action',
      rating: 'Good',
      justification: 'CTA is clear but could create more urgency.'
    },
    {
      item: 'Visual Design',
      rating: 'Excellent',
      justification: 'Aesthetics checklist completed with attention to all key design principles.'
    }
  ];
  
  // Use real data if available, otherwise use mock data
  const scorecardData = offerScorecard || generateMockScorecard();
  
  // Mock feedback (in production would come from AI)
  const mockFeedback = `
### Key Strengths:
1. **Strong Risk Mitigation** - Your offer addresses potential objections thoroughly with well-crafted assurances.
2. **Clear Visual Design** - The attention to aesthetics principles will help the offer appear professional and trustworthy.
3. **Good Problem Framing** - Your problem statement effectively frames the pain points that will resonate with your audience.

### Areas for Improvement:
1. **Social Proof Enhancement** - Adding more specific, results-oriented testimonials would significantly strengthen credibility.
2. **Solution Specificity** - Your solution steps would benefit from more concrete implementation details.
3. **Advantage Differentiation** - Make your unique advantages more distinct from competitors' offerings.
  `;
  
  // Mock next steps (in production would come from AI)
  const mockNextSteps = [
    "Test your headline with 5-10 target customers to gauge initial reaction and comprehension",
    "Create two versions of your solution section (one feature-focused, one outcome-focused) to A/B test",
    "Gather 3-5 specific customer testimonials that include quantifiable results",
    "Refine your CTA with urgency elements and test response rates",
    "Conduct a competitive analysis to better articulate your unique advantages"
  ];
  
  // Use real data or mock data
  const analysisData = offerAnalysisFeedback || mockFeedback;
  const nextStepsData = suggestedNextSteps || mockNextSteps;
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Offer Analysis & Action Plan</h2>
        <p className="text-gray-300 mb-6">
          Review a comprehensive analysis of your offer, learn what's working well, and get
          actionable recommendations for improvement and next steps.
        </p>
        
        {isAnalyzingOffer && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-[#FFD23F] animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Offer...</h3>
            <p className="text-gray-400">
              Our AI is evaluating all aspects of your offer against ProductLed principles.
              This typically takes about 20-30 seconds.
            </p>
          </div>
        )}
        
        {analysisError && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Error</h3>
                <p className="text-gray-300 mb-4">{analysisError}</p>
                <button
                  onClick={() => runFinalAnalysis()}
                  className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!isAnalyzingOffer && !analysisError && (
          <>
            {/* SECTION 1: OFFER SUMMARY */}
            <div className="bg-[#222222] rounded-lg mb-6">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection('summary')}
              >
                <h3 className="text-xl font-semibold text-white">Offer Summary</h3>
                {expandedSections.summary ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.summary && (
                <div className="p-5 border-t border-[#333333]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1A1A1A] p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Offer Name</h4>
                      <p className="text-gray-300">{title || "Untitled Offer"}</p>
                      
                      <h4 className="text-white font-medium mt-4 mb-2">User Success Statement</h4>
                      <p className="text-gray-300">{userSuccess.statement || "No success statement defined"}</p>
                      
                      <h4 className="text-white font-medium mt-4 mb-2">Hero Tagline</h4>
                      <p className="text-gray-300">{heroSection.tagline || "No tagline defined"}</p>
                      
                      <h4 className="text-white font-medium mt-4 mb-2">Call to Action</h4>
                      <p className="text-gray-300">{ctaSection.mainCtaText || "No CTA defined"}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-[#1A1A1A] p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Top Results</h4>
                        {topResults.tangible ? (
                          <ul className="list-disc list-inside text-gray-300">
                            <li>{topResults.tangible}</li>
                            {topResults.intangible && <li>{topResults.intangible}</li>}
                            {topResults.improvement && <li>{topResults.improvement}</li>}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">No results defined</p>
                        )}
                      </div>
                      
                      <div className="bg-[#1A1A1A] p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Top Advantages</h4>
                        {advantages.length > 0 ? (
                          <ul className="list-disc list-inside text-gray-300">
                            {getTopItems(advantages).map(adv => (
                              <li key={adv.id}>{adv.text}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">No advantages defined</p>
                        )}
                      </div>
                      
                      <div className="bg-[#1A1A1A] p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Risks & Assurances</h4>
                        {risks.length > 0 ? (
                          <ul className="list-none text-gray-300">
                            {getTopItems(risks).map(risk => {
                              // Find associated assurances
                              const riskAssurances = assurances.filter(a => a.riskId === risk.id);
                              return (
                                <li key={risk.id} className="mb-2">
                                  <span className="text-red-400">Risk:</span> {risk.text}
                                  {riskAssurances.length > 0 && (
                                    <ul className="ml-4 mt-1 list-none">
                                      {riskAssurances.map(assurance => (
                                        <li key={assurance.id}>
                                          <span className="text-green-400">→ Assurance:</span> {assurance.text}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">No risks defined</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* SECTION 2: OFFER SCORECARD */}
            <div className="bg-[#222222] rounded-lg mb-6">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection('scorecard')}
              >
                <h3 className="text-xl font-semibold text-white">Offer Scorecard</h3>
                {expandedSections.scorecard ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.scorecard && (
                <div className="p-5 border-t border-[#333333]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-[#1D1D1D]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Criteria
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Justification
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333333]">
                        {scorecardData.map((item, index) => (
                          <tr key={index} className="bg-[#1A1A1A]">
                            <td className="px-4 py-3 text-sm font-medium text-white">
                              {item.item}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              <RatingBadge rating={item.rating} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {item.justification}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* SECTION 3: AI ANALYSIS & FEEDBACK */}
            <div className="bg-[#222222] rounded-lg mb-6">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection('feedback')}
              >
                <h3 className="text-xl font-semibold text-white">Analysis & Feedback</h3>
                {expandedSections.feedback ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.feedback && (
                <div className="p-5 border-t border-[#333333]">
                  <div className="prose prose-invert max-w-none">
                    {/* In production, this would be converted from markdown */}
                    <div className="bg-[#1A1A1A] p-4 rounded-lg mb-4">
                      <h4 className="text-[#FFD23F] font-semibold mb-2">Key Strengths:</h4>
                      <ol className="list-decimal list-inside text-gray-300">
                        <li className="mb-1"><span className="font-medium text-white">Strong Risk Mitigation</span> - Your offer addresses potential objections thoroughly with well-crafted assurances.</li>
                        <li className="mb-1"><span className="font-medium text-white">Clear Visual Design</span> - The attention to aesthetics principles will help the offer appear professional and trustworthy.</li>
                        <li className="mb-1"><span className="font-medium text-white">Good Problem Framing</span> - Your problem statement effectively frames the pain points that will resonate with your audience.</li>
                      </ol>
                    </div>
                    
                    <div className="bg-[#1A1A1A] p-4 rounded-lg">
                      <h4 className="text-[#FFD23F] font-semibold mb-2">Areas for Improvement:</h4>
                      <ol className="list-decimal list-inside text-gray-300">
                        <li className="mb-1"><span className="font-medium text-white">Social Proof Enhancement</span> - Adding more specific, results-oriented testimonials would significantly strengthen credibility.</li>
                        <li className="mb-1"><span className="font-medium text-white">Solution Specificity</span> - Your solution steps would benefit from more concrete implementation details.</li>
                        <li className="mb-1"><span className="font-medium text-white">Advantage Differentiation</span> - Make your unique advantages more distinct from competitors' offerings.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* SECTION 4: SUGGESTED NEXT STEPS */}
            <div className="bg-[#222222] rounded-lg mb-6">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection('nextSteps')}
              >
                <h3 className="text-xl font-semibold text-white">Suggested Next Steps</h3>
                {expandedSections.nextSteps ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.nextSteps && (
                <div className="p-5 border-t border-[#333333]">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg">
                    <ol className="list-decimal list-inside space-y-3">
                      {nextStepsData.map((step, index) => (
                        <li key={index} className="text-gray-300">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            {/* SECTION 5: ACTION PLAN CHAT/VOICE INTERFACE */}
            <div className="bg-[#222222] rounded-lg">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection('chat')}
              >
                <h3 className="text-xl font-semibold text-white">Action Plan Discussion</h3>
                {expandedSections.chat ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.chat && (
                <div className="p-5 border-t border-[#333333]">
                  <div className="mb-4 flex items-center bg-[#1F1F1F] p-3 rounded-lg">
                    <Sparkles className="w-5 h-5 text-[#FFD23F] mr-2" />
                    <p className="text-gray-300 text-sm">
                      Discuss your offer analysis and action plan with our AI coach. Ask questions, brainstorm ideas,
                      or get help prioritizing next steps.
                    </p>
                  </div>
                  
                  <div className="bg-[#1A1A1A] rounded-lg mb-4 h-80 overflow-y-auto p-4">
                    {chatMessages.filter(msg => msg.role !== 'system').map((message, index) => (
                      <div 
                        key={index} 
                        className={`mb-4 ${
                          message.role === 'user' 
                            ? 'flex justify-end' 
                            : 'flex justify-start'
                        }`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-[#333333] text-white' 
                              : 'bg-[#2A2A2A] text-gray-300'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="w-full p-3 pr-10 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
                      />
                    </div>
                    
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-3 rounded-lg ${
                        isVoiceInputActive 
                          ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                          : 'bg-[#333333] text-white hover:bg-[#444444]'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={toggleVoiceOutput}
                      className={`p-3 rounded-lg ${
                        isVoiceOutputActive 
                          ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                          : 'bg-[#333333] text-white hover:bg-[#444444]'
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim()}
                      className="px-4 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      {isVoiceInputActive ? 'Voice input is active. Speak now...' : ''}
                      {isVoiceOutputActive ? 'Voice responses are enabled' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 