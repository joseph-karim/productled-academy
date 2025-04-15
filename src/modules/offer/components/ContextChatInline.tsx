import React, { useState, useRef, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Send, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateClarifyingQuestions, generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';
import { generateSuggestions } from '../services/ai/contextSuggestions';
import { InitialContext } from '../services/ai/types';
import { Button } from '@/components/ui/button';

interface Suggestion {
  text: string;
  field: 'targetAudience' | 'desiredResult' | 'keyAdvantage' | 'biggestBarrier' | 'assurance';
}

interface ContextChatInlineProps {
  websiteUrl?: string;
  initialContext: InitialContext;
  websiteScrapingStatus: 'idle' | 'processing' | 'completed' | 'failed';
  websiteFindings: WebsiteFindings | null;
}

export function ContextChatInline({
  websiteUrl,
  initialContext,
  websiteScrapingStatus,
  websiteFindings
}: ContextChatInlineProps) {
  const {
    contextChat,
    addChatMessage,
    clearChatMessages,
    setCoreOfferNucleus,
    coreOfferNucleus
  } = useOfferStore();

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentField, setCurrentField] = useState<Suggestion['field'] | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Field display names for better UI
  const fieldDisplayNames = {
    targetAudience: 'Target Audience',
    desiredResult: '#1 Result',
    keyAdvantage: 'Key Advantage',
    biggestBarrier: 'Risk',
    assurance: 'Assurance'
  };

  // Function to handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    // Update the form with the selected suggestion
    setCoreOfferNucleus({
      ...coreOfferNucleus,
      [suggestion.field]: suggestion.text
    });

    // Add the selection to the chat
    addChatMessage({
      sender: 'user',
      content: `I'll use this for ${fieldDisplayNames[suggestion.field]}: "${suggestion.text}"`
    });

    // Hide suggestions
    setShowSuggestions(false);

    // Move to the next field if needed
    const fields: Suggestion['field'][] = ['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'];
    const currentIndex = currentField ? fields.indexOf(currentField) : -1;

    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      setTimeout(() => {
        setCurrentField(nextField);
        addChatMessage({
          sender: 'ai',
          content: `Great choice! Now, let's define your ${fieldDisplayNames[nextField]}. What would you like to use?`
        });
        generateFieldSuggestions(nextField);
      }, 500);
    } else {
      // We've completed all fields
      setTimeout(() => {
        addChatMessage({
          sender: 'ai',
          content: 'Great! We have completed all the core offer elements. You can now proceed to the next step of the form.'
        });
      }, 500);
    }
  };

  // Function to generate suggestions for a specific field
  const generateFieldSuggestions = async (field: Suggestion['field']) => {
    setIsProcessing(true);
    setShowSuggestions(false);

    try {
      // Try to use website findings if available
      if (websiteFindings && websiteScrapingStatus === 'completed' && websiteFindings.coreOffer) {
        console.log('Using website findings for suggestions');
        try {
          // Generate suggestions based on the field and website findings
          const fieldSuggestions = await generateSuggestions(field, initialContext, websiteFindings);

          // Format suggestions
          const formattedSuggestions = fieldSuggestions.map(text => ({
            text,
            field
          }));

          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);

          // Add a message to the chat about the suggestions
          if (contextChat.messages.length <= 2) {
            addChatMessage({
              sender: 'ai',
              content: `Based on your website analysis, here are some suggestions for ${fieldDisplayNames[field]}. You can select one or type your own.`
            });
          }

          setIsProcessing(false);
          return; // Exit early if successful
        } catch (apiError) {
          console.error('Error calling OpenAI API with website findings:', apiError);
          // Continue to fallback if API call fails
        }
      }

      // If no website findings or API call failed, try with just initial context
      console.log('Using initial context for suggestions');
      try {
        const fieldSuggestions = await generateSuggestions(field, initialContext, null);

        // Format suggestions
        const formattedSuggestions = fieldSuggestions.map(text => ({
          text,
          field
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Add a message to the chat about the suggestions
        if (contextChat.messages.length <= 2) {
          addChatMessage({
            sender: 'ai',
            content: `Here are some suggestions for ${fieldDisplayNames[field]}. You can select one or type your own.`
          });
        }

        setIsProcessing(false);
        return; // Exit early if successful
      } catch (apiError) {
        console.error('Error calling OpenAI API with initial context:', apiError);
        // Continue to fallback if API call fails
      }

      // If all API calls fail, use fallback suggestions
      console.log('Using fallback suggestions for', field);
      const fallbackSuggestions = getFallbackSuggestions(field);
      const formattedSuggestions = fallbackSuggestions.map(text => ({
        text,
        field
      }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);

      // Add a message about using fallback suggestions
      if (contextChat.messages.length <= 2) {
        addChatMessage({
          sender: 'ai',
          content: `Here are some suggestions for your ${fieldDisplayNames[field]}. You can select one or type your own.`
        });
      }
    } catch (error) {
      console.error(`Error generating suggestions for ${field}:`, error);
      addChatMessage({
        sender: 'ai',
        content: `I'm having trouble connecting to the AI service. Here are some standard suggestions for ${fieldDisplayNames[field]}.`
      });

      // Add some default suggestions as fallback
      const fallbackSuggestions = getFallbackSuggestions(field);
      const formattedSuggestions = fallbackSuggestions.map(text => ({
        text,
        field
      }));
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback suggestions for each field in case the API call fails
  const getFallbackSuggestions = (field: Suggestion['field']): string[] => {
    // If we have website findings, use them to customize suggestions
    if (websiteFindings && websiteScrapingStatus === 'completed') {
      const coreOffer = websiteFindings.coreOffer || '';
      const targetAudience = websiteFindings.targetAudience || '';
      const problemSolved = websiteFindings.problemSolved || '';
      const valueProposition = websiteFindings.valueProposition || '';

      switch (field) {
        case 'targetAudience':
          return [
            targetAudience || 'Small business owners looking to increase online visibility',
            'Decision-makers seeking to improve their business efficiency',
            'Professionals who need specialized solutions for their industry'
          ];
        case 'desiredResult':
          return [
            `Achieve ${problemSolved ? 'a solution to ' + problemSolved : 'significant results'} within 90 days`,
            `Experience ${valueProposition ? valueProposition : 'measurable improvements'} in your business`,
            'See tangible ROI within the first month of implementation'
          ];
        case 'keyAdvantage':
          return [
            `Our unique approach to ${coreOffer || 'solving your problems'}`,
            'Personalized solutions tailored to your specific needs',
            'Proven track record of success with similar clients'
          ];
        case 'biggestBarrier':
          return [
            'Concern about implementation complexity and time investment',
            'Uncertainty about whether this will work for your specific situation',
            'Worry about the learning curve for your team'
          ];
        case 'assurance':
          return [
            '30-day money-back guarantee if you don\'t see measurable improvements',
            'Free onboarding and implementation support',
            'Regular check-ins to ensure you\'re getting the results you expect'
          ];
        default:
          return ['Please provide your input'];
      }
    } else {
      // Default suggestions if no website findings
      switch (field) {
        case 'targetAudience':
          return [
            'Small business owners looking to increase online visibility',
            'Marketing professionals seeking to improve campaign ROI',
            'Entrepreneurs launching their first digital product'
          ];
        case 'desiredResult':
          return [
            'Generate 50% more qualified leads within 90 days',
            'Save 10+ hours per week on repetitive marketing tasks',
            'Increase conversion rates by at least 25%'
          ];
        case 'keyAdvantage':
          return [
            'AI-powered insights that competitors don\'t offer',
            'Proven methodology with over 500 success stories',
            'Personalized strategy tailored to your specific industry'
          ];
        case 'biggestBarrier':
          return [
            'Concern about implementation complexity and time investment',
            'Uncertainty about ROI and measurable results',
            'Worry about compatibility with existing systems'
          ];
        case 'assurance':
          return [
            '30-day money-back guarantee if you don\'t see measurable improvements',
            'Free onboarding support to ensure smooth implementation',
            'Monthly performance reviews with actionable optimization tips'
          ];
        default:
          return ['Please provide your input'];
      }
    }
  };

  // Initial message on component mount or when website findings change
  useEffect(() => {
    console.log('ContextChatInline - initializing chat:', {
      isInitialLoad,
      messagesLength: contextChat.messages.length,
      websiteScrapingStatus,
      websiteFindings,
      hasWebsiteFindings: !!websiteFindings
    });

    // Removed forced reinitialization to prevent multiple renders

    if (isInitialLoad && contextChat.messages.length === 0) {
      // Start with the first field
      const firstField: Suggestion['field'] = 'targetAudience';
      setCurrentField(firstField);

      // Generate initial message and suggestions without API calls
      const startConversation = async () => {
        setIsProcessing(true);

        try {
          // Create a welcome message that includes website findings
          let welcomeMessage = '';

          if (websiteFindings && websiteFindings.coreOffer && websiteScrapingStatus === 'completed') {
            welcomeMessage = `I've analyzed ${websiteUrl || 'your website'} and found some insights to help build your offer. Let's work on refining your core offer step by step.\n\nHere's what I found:\n`;

            // Safely extract string values from findings
            const coreOffer = typeof websiteFindings.coreOffer === 'string' ? websiteFindings.coreOffer : 'Not found';
            const targetAudience = typeof websiteFindings.targetAudience === 'string' ? websiteFindings.targetAudience : 'Not found';
            const problemSolved = typeof websiteFindings.problemSolved === 'string' ? websiteFindings.problemSolved : 'Not found';
            const valueProposition = typeof websiteFindings.valueProposition === 'string' ? websiteFindings.valueProposition : 'Not found';

            welcomeMessage += `• Core Offer: ${coreOffer}\n`;
            welcomeMessage += `• Target Audience: ${targetAudience}\n`;
            welcomeMessage += `• Problem Solved: ${problemSolved}\n`;
            welcomeMessage += `• Value Proposition: ${valueProposition}\n`;

            welcomeMessage += `\nNow, let's define your ${fieldDisplayNames[firstField]}. I'll provide some suggestions to help you get started.`;
          } else if (websiteScrapingStatus === 'failed') {
            welcomeMessage = `I notice there was an issue analyzing your website, but we can still create a great offer together. Let's start with your ${fieldDisplayNames[firstField]}. Who is your offer specifically designed for?`;
          } else {
            welcomeMessage = `I'm here to help you create a compelling offer. Let's work through each element step by step, starting with your ${fieldDisplayNames[firstField]}. Who is your offer specifically designed for?`;
          }

          // Add the welcome message
          addChatMessage({
            sender: 'ai',
            content: welcomeMessage
          });

          // Generate suggestions for the first field
          try {
            await generateFieldSuggestions(firstField);
          } catch (error) {
            console.error('Error generating initial suggestions:', error);
            // Fallback to predefined suggestions if API calls fail
            const fallbackSuggestions = getFallbackSuggestions(firstField);
            const formattedSuggestions = fallbackSuggestions.map(text => ({
              text,
              field: firstField
            }));

            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          }

          setIsProcessing(false);
          setIsInitialLoad(false);
        } catch (error) {
          console.error('[ContextChatInline] Error starting conversation:', error);
          addChatMessage({
            sender: 'ai',
            content: `Let's start by defining your Target Audience. Who is your offer specifically designed for?`
          });
          setIsProcessing(false);
          setIsInitialLoad(false);
        }
      };

      startConversation();
    }
  }, [isInitialLoad, websiteScrapingStatus, websiteUrl, initialContext, websiteFindings, contextChat.messages.length, clearChatMessages]);

  // Parse questions from AI response
  const parseQuestionsFromText = (text: string): string[] => {
    const numberedQuestionsRegex = /\d+\.\s+([^\d]+?)(?=\d+\.|$)/g;
    const matches = [...text.matchAll(numberedQuestionsRegex)];

    if (matches.length > 0) {
      return matches.map(match => match[1].trim());
    }

    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.endsWith('?'));
  };

  // Auto-scroll to bottom when new messages arrive, but only within the chat container
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use scrollIntoView with a block: 'nearest' option to prevent page scrolling
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [contextChat.messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userInput = currentInput;
    setCurrentInput('');

    addChatMessage({
      sender: 'user',
      content: userInput
    });

    setIsProcessing(true);

    try {
      // If we're in the middle of defining a field, use the user input for that field
      if (currentField) {
        // Update the form with the user's input
        setCoreOfferNucleus({
          ...coreOfferNucleus,
          [currentField]: userInput
        });

        // Move to the next field
        const fields: Suggestion['field'][] = ['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'];
        const currentIndex = fields.indexOf(currentField);

        if (currentIndex < fields.length - 1) {
          const nextField = fields[currentIndex + 1];
          setTimeout(() => {
            setCurrentField(nextField);
            addChatMessage({
              sender: 'ai',
              content: `Thanks! Now, let's define your ${fieldDisplayNames[nextField]}. What would you like to use?`
            });
            generateFieldSuggestions(nextField);
          }, 500);
        } else {
          // We've completed all fields
          setTimeout(() => {
            setCurrentField(null);
            addChatMessage({
              sender: 'ai',
              content: 'Great! We have completed all the core offer elements. You can now proceed to the next step of the form.'
            });
          }, 500);
        }
      } else {
        // Handle general chat
        const response = await generateChatResponse(
          useOfferStore.getState().contextChat.messages,
          useOfferStore.getState().initialContext,
          websiteFindings
        );

        addChatMessage({
          sender: 'ai',
          content: response
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      addChatMessage({
        sender: 'ai',
        content: `Sorry, I encountered an error. Could you try again?`
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
    <div className="flex flex-col">
      {/* Messages - Using max-height instead of fixed height */}
      <div className="max-h-[500px] overflow-y-auto p-5 space-y-4 bg-[#1C1C1C] rounded-lg mb-4" style={{ scrollbarWidth: 'thin' }}>
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
                <Button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full justify-start text-left text-sm py-3 px-4 bg-[#333333] hover:bg-[#444444] text-white rounded-md flex items-start group h-auto min-h-[3rem]"
                  variant="ghost"
                >
                  <div className="flex-1 overflow-hidden mr-2">
                    <div className="line-clamp-3 whitespace-normal break-words">{suggestion.text}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Invisible element for scrolling that doesn't affect layout */}
        <div ref={messagesEndRef} className="h-0 w-0 opacity-0" />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={currentField ? `Type your ${fieldDisplayNames[currentField]} here...` : "Ask about your offer..."}
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

      {/* Current progress indicator */}
      {currentField && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex space-x-2">
            {['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'].map((field) => (
              <div
                key={field}
                className={`w-2 h-2 rounded-full ${field === currentField ? 'bg-[#FFD23F]' : coreOfferNucleus[field as keyof typeof coreOfferNucleus] ? 'bg-green-500' : 'bg-[#333333]'}`}
                title={fieldDisplayNames[field as Suggestion['field']]}
              />
            ))}
          </div>
          <div>
            {currentField && `Defining: ${fieldDisplayNames[currentField]}`}
          </div>
        </div>
      )}
    </div>
  );
}
