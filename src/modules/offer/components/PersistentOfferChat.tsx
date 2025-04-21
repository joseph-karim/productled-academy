import React, { useState, useRef, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Send, Loader2, Bot } from 'lucide-react';
import { generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';
import { generateSuggestions } from '../services/ai/contextSuggestions';
import { InitialContext } from '../services/ai/types';

interface Suggestion {
  text: string;
  field: string;
}

interface PersistentOfferChatProps {
  currentStep: number;
}

export function PersistentOfferChat({ currentStep }: PersistentOfferChatProps) {
  const {
    contextChat,
    addChatMessage,
    clearChatMessages,
    setCoreOfferNucleus,
    coreOfferNucleus,
    websiteScraping,
    initialContext,
    onboardingSteps,
    exclusivity,
    bonuses,
    heroSection,
    problemSection,
    solutionSection,
    riskReversals,
    ctaSection,
    transcriptData
  } = useOfferStore();

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create website findings object with better null/undefined handling
  const websiteFindings: WebsiteFindings | null =
    websiteScraping.status === 'completed'
    ? {
        coreOffer: websiteScraping.coreOffer || '',
        targetAudience: websiteScraping.targetAudience || '',
        problemSolved: websiteScraping.keyProblem || '',
        keyBenefits: Array.isArray(websiteScraping.keyFeatures)
          ? websiteScraping.keyFeatures.map(feature =>
              typeof feature === 'string' ? feature : (feature?.benefit || '')
            ).filter(Boolean)
          : [],
        valueProposition: websiteScraping.valueProposition || '',
        cta: null,
        tone: null,
        missingInfo: null
      }
    : null;

  // Field display names for better UX
  const fieldDisplayNames: Record<string, string> = {
    targetAudience: 'Target Audience',
    desiredResult: 'Desired Result',
    keyAdvantage: 'Key Advantage',
    biggestBarrier: 'Biggest Barrier',
    assurance: 'Assurance',
    onboardingStep: 'Onboarding Step',
    exclusivity: 'Exclusivity',
    bonus: 'Bonus',
    heroSection: 'Hero Section',
    problemSection: 'Problem Section',
    solutionSection: 'Solution Section',
    riskReversal: 'Risk Reversal',
    ctaSection: 'CTA Section'
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contextChat.messages]);

  // Generate initial welcome message based on the current step
  useEffect(() => {
    if (isInitialLoad) {
      generateInitialWelcomeMessage();
      setIsInitialLoad(false);
    }
  }, [currentStep, isInitialLoad]);

  // Function to generate the initial welcome message
  const generateInitialWelcomeMessage = () => {
    // Clear previous messages if switching steps
    if (contextChat.messages.length > 0) {
      clearChatMessages();
    }

    // Add initial welcome message based on the current step
    let welcomeMessage = '';

    // Check if we have website data or transcript data
    const hasWebsiteData = websiteScraping.status === 'completed' && websiteFindings !== null;
    const hasTranscriptData = transcriptData !== null;
    const hasCompletedCoreOffer = coreOfferNucleus.targetAudience &&
                                 coreOfferNucleus.desiredResult &&
                                 coreOfferNucleus.keyAdvantage &&
                                 coreOfferNucleus.biggestBarrier &&
                                 coreOfferNucleus.assurance;

    // Step 0: Define Core Offer Nucleus
    if (currentStep === 0) {
      if (!hasWebsiteData && !hasTranscriptData) {
        welcomeMessage = "Welcome to the AI Offer Assistant! To get started, I recommend either entering your website URL or uploading a customer call transcript using the tabs on the right. This will help me provide more relevant suggestions for your offer. Alternatively, you can tell me about your business or product, and I'll help you craft your core offer nucleus.";
      } else if (hasWebsiteData && !hasTranscriptData && !hasCompletedCoreOffer) {
        welcomeMessage = "Thanks for providing your website information! I've analyzed your site and can help you define your core offer nucleus. Let me know when you're ready to start with your target audience, desired result, key advantage, biggest barrier, or assurance.";
      } else if (!hasWebsiteData && hasTranscriptData && !hasCompletedCoreOffer) {
        welcomeMessage = "Thanks for uploading your customer call transcript! I've analyzed it and extracted key insights to help you define your core offer nucleus. Let me know when you're ready to start with your target audience, desired result, key advantage, biggest barrier, or assurance.";
      } else if (hasWebsiteData && hasTranscriptData && !hasCompletedCoreOffer) {
        welcomeMessage = "Great! I have both your website analysis and customer call transcript. This gives me a comprehensive understanding of your offer. Let me know when you're ready to start defining your core offer nucleus.";
      } else {
        welcomeMessage = "I see you've already defined your core offer nucleus. Is there anything specific you'd like help with or would you like me to review what you've entered so far?";
      }
    }
    // Step 1: Setup Onboarding Steps
    else if (currentStep === 1) {
      welcomeMessage = "Now let's define the onboarding steps for your offer. These are the key steps users need to take to get value from your product. What would you like help with?";
    }
    // Step 2: Add Enhancers
    else if (currentStep === 2) {
      welcomeMessage = "Let's enhance your offer with bonuses and exclusivity. I can help you brainstorm compelling bonuses or craft exclusivity elements that create urgency. What would you like to focus on first?";
    }
    // Step 3: Generate & Refine Landing Page Content
    else if (currentStep === 3) {
      welcomeMessage = "Now let's create compelling landing page content. I can help you craft persuasive copy for your hero section, problem statement, solution description, risk reversal, and call to action. Where would you like to start?";
    }
    // Step 4: Create Landing Page Wireframes
    else if (currentStep === 4) {
      welcomeMessage = "Let's create wireframes for your landing page. I can help you visualize how your content will look and provide suggestions for layout and design elements. What aspect of the wireframes would you like help with?";
    }
    // Step 5: Final Review & Output
    else if (currentStep === 5) {
      welcomeMessage = "Let's review your complete offer. I can help you identify any areas that need improvement or suggest final touches to make your offer more compelling. What would you like me to review first?";
    }

    // Add the welcome message
    addChatMessage({
      sender: 'ai',
      content: welcomeMessage
    });
  };

  // Function to generate context-aware suggestions based on user request
  const generateContextAwareSuggestions = async (field: string) => {
    setIsProcessing(true);

    try {
      setCurrentField(field);

      if (field === 'targetAudience' ||
          field === 'desiredResult' ||
          field === 'keyAdvantage' ||
          field === 'biggestBarrier' ||
          field === 'assurance') {

        // Only generate suggestions if we have website data
        if (websiteFindings) {
          const fieldSuggestions = await generateSuggestions(
            field as any,
            initialContext,
            websiteFindings
          );

          const formattedSuggestions = fieldSuggestions.map(text => ({
            text,
            field
          }));

          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);

          addChatMessage({
            sender: 'ai',
            content: `Based on your website, here are some suggestions for ${fieldDisplayNames[field]}. You can select one or type your own.`
          });
        } else {
          // Fallback suggestions if no website data
          addChatMessage({
            sender: 'ai',
            content: `To provide more specific suggestions for your ${fieldDisplayNames[field]}, it would help to have your website URL or more information about your business. In the meantime, could you tell me more about your target audience and what problem your product solves?`
          });
        }
      } else if (field === 'onboardingStep') {
        // Generate onboarding step suggestions
        const stepSuggestions = [
          "Complete a quick 2-minute setup wizard",
          "Watch the 5-minute getting started video",
          "Import your existing data (10 minutes)",
          "Set up your first automation (15 minutes)",
          "Connect with your team members (5 minutes)"
        ];

        const formattedSuggestions = stepSuggestions.map(text => ({
          text,
          field: 'onboardingStep'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        addChatMessage({
          sender: 'ai',
          content: `Here are some suggestions for onboarding steps. You can select one or type your own.`
        });
      } else if (field === 'bonus') {
        // Generate bonus suggestions
        const bonusSuggestions = [
          "Free 30-minute strategy call",
          "Exclusive PDF guide with advanced tips",
          "Access to private community",
          "Monthly live Q&A sessions",
          "Template library worth $197"
        ];

        const formattedSuggestions = bonusSuggestions.map(text => ({
          text,
          field: 'bonus'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        addChatMessage({
          sender: 'ai',
          content: `Here are some suggestions for bonuses. You can select one or type your own.`
        });
      } else if (field === 'heroSection' && hasCompleteCoreOffer()) {
        // Generate hero section suggestions
        const heroSuggestions = [
          `Get ${coreOfferNucleus.desiredResult} Without ${coreOfferNucleus.biggestBarrier}`,
          `The Only ${coreOfferNucleus.keyAdvantage} Solution for ${coreOfferNucleus.targetAudience}`,
          `Transform Your Results: ${coreOfferNucleus.desiredResult} in Just Days`
        ];

        const formattedSuggestions = heroSuggestions.map(text => ({
          text,
          field: 'heroSection'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        addChatMessage({
          sender: 'ai',
          content: `Here are some headline suggestions for your hero section. You can select one or type your own.`
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      addChatMessage({
        sender: 'ai',
        content: `I encountered an error generating suggestions. Could you try again or provide more information about what you're looking for?`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to check if core offer is complete
  const hasCompleteCoreOffer = () => {
    return Boolean(
      coreOfferNucleus.targetAudience &&
      coreOfferNucleus.desiredResult &&
      coreOfferNucleus.keyAdvantage &&
      coreOfferNucleus.biggestBarrier &&
      coreOfferNucleus.assurance
    );
  };

  // Function to handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    // Add the selection to the chat
    addChatMessage({
      sender: 'user',
      content: `I'll use this for ${fieldDisplayNames[suggestion.field]}: "${suggestion.text}"`
    });

    // Hide suggestions
    setShowSuggestions(false);

    // Update the store based on the field
    if (suggestion.field === 'targetAudience' ||
        suggestion.field === 'desiredResult' ||
        suggestion.field === 'keyAdvantage' ||
        suggestion.field === 'biggestBarrier' ||
        suggestion.field === 'assurance') {

      setCoreOfferNucleus({
        ...coreOfferNucleus,
        [suggestion.field]: suggestion.text
      });

      // Provide feedback
      addChatMessage({
        sender: 'ai',
        content: `Great choice! I've updated your ${fieldDisplayNames[suggestion.field]}.`
      });
    }
    // Handle other field types as needed
    else if (suggestion.field === 'onboardingStep') {
      // Logic to add an onboarding step
      addChatMessage({
        sender: 'ai',
        content: `Great choice! You can add this as an onboarding step in the form.`
      });
    }
    else if (suggestion.field === 'bonus') {
      // Logic to add a bonus
      addChatMessage({
        sender: 'ai',
        content: `Excellent bonus! You can add this in the enhancers section of the form.`
      });
    }
    else if (suggestion.field === 'heroSection') {
      // Logic for hero section
      addChatMessage({
        sender: 'ai',
        content: `Great headline! You can use this in your hero section.`
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userInput = currentInput;
    setCurrentInput('');
    setShowSuggestions(false);

    addChatMessage({
      sender: 'user',
      content: userInput
    });

    setIsProcessing(true);

    try {
      // Get current website findings
      const currentFindings = websiteScraping.status === 'completed' ? websiteFindings : null;

      // Check for specific field requests in the user input
      const lowerInput = userInput.toLowerCase();
      const fieldKeywords = {
        targetAudience: ['target audience', 'audience', 'who is it for', 'customer', 'user', 'buyer'],
        desiredResult: ['desired result', 'result', 'outcome', 'benefit', 'achieve'],
        keyAdvantage: ['advantage', 'unique', 'different', 'better', 'competitive'],
        biggestBarrier: ['barrier', 'objection', 'risk', 'concern', 'worry', 'obstacle'],
        assurance: ['assurance', 'guarantee', 'promise', 'risk reversal'],
        onboardingStep: ['onboarding', 'step', 'setup', 'getting started'],
        bonus: ['bonus', 'extra', 'additional', 'free'],
        heroSection: ['hero', 'headline', 'tagline', 'above fold']
      };

      // Check if the user is asking for suggestions for a specific field
      let requestedField: string | null = null;
      for (const [field, keywords] of Object.entries(fieldKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
          requestedField = field;
          break;
        }
      }

      // If user is asking for suggestions for a specific field
      if (requestedField && (
          lowerInput.includes('suggest') ||
          lowerInput.includes('recommendation') ||
          lowerInput.includes('help with') ||
          lowerInput.includes('ideas for')
        )) {
        // Generate suggestions for the requested field
        await generateContextAwareSuggestions(requestedField);
      } else {
        // Generate a general response
        const response = await generateChatResponse(
          useOfferStore.getState().contextChat.messages,
          useOfferStore.getState().initialContext,
          currentFindings,
          useOfferStore.getState().transcriptData
        );

        addChatMessage({
          sender: 'ai',
          content: response
        });

        // Check if we should offer suggestions after the response
        if (currentStep === 0 && !hasCompleteCoreOffer()) {
          // For core offer nucleus step, check which fields are empty
          const fields = ['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'];
          const emptyFields = fields.filter(field => !coreOfferNucleus[field as keyof typeof coreOfferNucleus]);

          if (emptyFields.length > 0) {
            // Ask if the user wants suggestions for the next empty field
            setTimeout(() => {
              addChatMessage({
                sender: 'ai',
                content: `Would you like suggestions for your ${fieldDisplayNames[emptyFields[0]]}? Just ask me for suggestions.`
              });
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      addChatMessage({
        sender: 'ai',
        content: `Sorry, I encountered an error. Could you rephrase that?`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1C1C] rounded-lg border border-[#333333]">
      {/* Header - Keep compact */}
      <div className="py-3 px-4 bg-[#2A2A2A] border-b border-[#333333] flex items-center">
        <Bot className="w-5 h-5 text-[#FFD23F] mr-2" />
        <h3 className="text-white font-medium">AI Offer Assistant</h3>
      </div>

      {/* Chat content - Use flex with min-height to ensure proper distribution */}
      <div className="flex flex-col h-full">
        {/* Messages area - Set to flex-1 instead of flex-grow for better balance */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)]" style={{ scrollbarWidth: 'thin' }}>
          {contextChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.sender === 'user'
                    ? 'bg-[#FFD23F] text-[#1C1C1C]'
                    : message.sender === 'ai'
                      ? 'bg-[#3A3A3A] text-white'
                      : 'bg-transparent text-gray-400 italic'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sender !== 'system' && (
                  <div className="text-xs opacity-60 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Show suggestions if available */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-3 p-3 bg-[#2A2A2A] rounded-lg border border-[#333333]">
              <h4 className="text-sm font-medium text-white mb-2">Suggestions for {currentField && fieldDisplayNames[currentField]}:</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full justify-start text-left text-sm py-2 px-3 bg-[#333333] hover:bg-[#444444] text-white rounded-md flex items-start group h-auto min-h-[2.5rem]"
                  >
                    <div className="flex-1 overflow-hidden mr-2">
                      <div className="line-clamp-2 whitespace-normal break-words">{suggestion.text}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-center">
              <div className="bg-[#2A2A2A] px-4 py-2 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin text-[#FFD23F]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area - Fixed at bottom with auto-height */}
        <div className="p-3 border-t border-[#333333] mt-auto">
          <div className="flex space-x-2">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for help with your offer..."
              className="flex-1 p-2 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FFD23F] focus:border-transparent resize-none text-sm"
              rows={1}
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isProcessing}
              className={`p-2 rounded-lg self-end ${
                !currentInput.trim() || isProcessing
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
              aria-label="Send"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
