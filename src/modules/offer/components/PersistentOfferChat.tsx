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
    ctaSection
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

  // Generate context-aware suggestions based on the current step
  useEffect(() => {
    if (isInitialLoad) {
      generateContextAwareSuggestions();
      setIsInitialLoad(false);
    }
  }, [currentStep, isInitialLoad]);

  // Function to generate context-aware suggestions based on the current step
  const generateContextAwareSuggestions = async () => {
    setIsProcessing(true);
    
    try {
      // Clear previous messages if switching steps
      if (contextChat.messages.length > 0) {
        clearChatMessages();
      }
      
      // Add initial message based on the current step
      let initialMessage = '';
      let fieldToSuggest: string | null = null;
      
      // Step 0: Define Core Offer Nucleus
      if (currentStep === 0) {
        initialMessage = "I'm here to help you define your core offer nucleus. Let's start with your target audience. Who is your offer specifically designed for?";
        fieldToSuggest = 'targetAudience';
      } 
      // Step 1: Setup Onboarding Steps
      else if (currentStep === 1) {
        initialMessage = "Now let's define the onboarding steps for your offer. What are the key steps users need to take to get value from your product?";
        fieldToSuggest = 'onboardingStep';
      }
      // Step 2: Add Enhancers
      else if (currentStep === 2) {
        initialMessage = "Let's enhance your offer with bonuses and exclusivity. What bonuses could you add to make your offer more compelling?";
        fieldToSuggest = 'bonus';
      }
      // Step 3: Generate & Refine Landing Page Content
      else if (currentStep === 3) {
        initialMessage = "Now let's create compelling landing page content. I can help you craft persuasive copy for each section.";
        fieldToSuggest = 'heroSection';
      }
      // Step 4: Create Landing Page Wireframes
      else if (currentStep === 4) {
        initialMessage = "Let's create wireframes for your landing page. I can help you visualize how your content will look.";
        fieldToSuggest = null;
      }
      // Step 5: Final Review & Output
      else if (currentStep === 5) {
        initialMessage = "Let's review your complete offer. I can help you identify any areas that need improvement.";
        fieldToSuggest = null;
      }
      
      // Add the initial message
      addChatMessage({
        sender: 'ai',
        content: initialMessage
      });
      
      // Generate suggestions if needed
      if (fieldToSuggest) {
        setCurrentField(fieldToSuggest);
        
        if (fieldToSuggest === 'targetAudience' || 
            fieldToSuggest === 'desiredResult' || 
            fieldToSuggest === 'keyAdvantage' || 
            fieldToSuggest === 'biggestBarrier' || 
            fieldToSuggest === 'assurance') {
          
          const fieldSuggestions = await generateSuggestions(
            fieldToSuggest as any,
            initialContext,
            websiteFindings
          );
          
          const formattedSuggestions = fieldSuggestions.map(text => ({
            text,
            field: fieldToSuggest as string
          }));
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
          
          addChatMessage({
            sender: 'ai',
            content: `Here are some suggestions for ${fieldDisplayNames[fieldToSuggest]}. You can select one or type your own.`
          });
        } else if (fieldToSuggest === 'onboardingStep') {
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
        } else if (fieldToSuggest === 'bonus') {
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
        } else if (fieldToSuggest === 'heroSection') {
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
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      addChatMessage({
        sender: 'ai',
        content: `I'm here to help with your offer. What would you like assistance with?`
      });
    } finally {
      setIsProcessing(false);
    }
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

      // Generate response based on the current step and user input
      const response = await generateChatResponse(
        useOfferStore.getState().contextChat.messages,
        useOfferStore.getState().initialContext,
        currentFindings
      );

      addChatMessage({
        sender: 'ai',
        content: response
      });

      // Generate new suggestions based on the response
      if (currentStep === 0) {
        // For core offer nucleus step, generate suggestions for the next field
        const fields = ['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'];
        const emptyFields = fields.filter(field => !coreOfferNucleus[field as keyof typeof coreOfferNucleus]);
        
        if (emptyFields.length > 0) {
          const nextField = emptyFields[0];
          setCurrentField(nextField);
          
          const fieldSuggestions = await generateSuggestions(
            nextField as any,
            initialContext,
            websiteFindings
          );
          
          const formattedSuggestions = fieldSuggestions.map(text => ({
            text,
            field: nextField
          }));
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        }
      }
      // Handle other steps similarly
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
      <div className="p-4 bg-[#2A2A2A] border-b border-[#333333] flex items-center">
        <Bot className="w-5 h-5 text-[#FFD23F] mr-2" />
        <h3 className="text-white font-medium">AI Offer Assistant</h3>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
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
          <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg border border-[#333333]">
            <h4 className="text-sm font-medium text-white mb-3">Suggestions for {currentField && fieldDisplayNames[currentField]}:</h4>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full justify-start text-left text-sm py-3 px-4 bg-[#333333] hover:bg-[#444444] text-white rounded-md flex items-start group h-auto min-h-[3rem]"
                >
                  <div className="flex-1 overflow-hidden mr-2">
                    <div className="line-clamp-3 whitespace-normal break-words">{suggestion.text}</div>
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

      <div className="p-4 border-t border-[#333333]">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for help with your offer..."
            className="flex-1 p-3 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FFD23F] focus:border-transparent resize-none text-sm"
            rows={2}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isProcessing}
            className={`p-3 rounded-lg self-end ${
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
  );
}
