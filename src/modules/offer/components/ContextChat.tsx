import React, { useState, useRef, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { generateClarifyingQuestions, generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';
import { InitialContext } from '../services/ai/types';

export function ContextChat() {
  const {
    contextChat,
    addChatMessage,
    clearChatMessages,
    websiteUrl,
    initialContext,
    websiteScraping,
  } = useOfferStore();

  // Helper function to create website findings object with proper null/undefined handling
  const createWebsiteFindings = (scrapingData: any): WebsiteFindings | null => {
    if (scrapingData.status !== 'completed') return null;

    return {
      coreOffer: scrapingData.coreOffer || '',
      targetAudience: scrapingData.targetAudience || '',
      problemSolved: scrapingData.keyProblem || '',
      keyBenefits: Array.isArray(scrapingData.keyFeatures)
        ? scrapingData.keyFeatures.map(feature =>
            typeof feature === 'string' ? feature : (feature?.benefit || '')
          ).filter(Boolean)
        : [],
      valueProposition: scrapingData.valueProposition || '',
      cta: null,
      tone: null,
      missingInfo: null
    };
  };

  // Use the helper function to get the current website findings
  const getWebsiteFindings = (): WebsiteFindings | null => {
    return createWebsiteFindings(useOfferStore.getState().websiteScraping);
  };

  // Get the initial website findings
  const websiteFindings = createWebsiteFindings(websiteScraping);

  // Log website findings for debugging
  useEffect(() => {
    console.log('ContextChat - websiteScraping status:', websiteScraping.status);
    console.log('ContextChat - websiteFindings:', getWebsiteFindings());
  }, [websiteScraping.status]);

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!isInitialLoad) return;

    clearChatMessages();
    setIsProcessing(true);
    setIsInitialLoad(false);

    const getInitialQuestion = async () => {
      let summaryLines: string[] = [];
      let analysisPerformed = false;

      const currentWebsiteFindings = getWebsiteFindings();
      if (websiteScraping.status === 'completed' && currentWebsiteFindings?.coreOffer) {
        analysisPerformed = true;
        summaryLines.push(`Hello! I've reviewed your website (${websiteUrl}) and the initial context. Let's refine your offer based on this:`);
        summaryLines.push("");
        summaryLines.push("Website Analysis Findings:");
        summaryLines.push(`  Core Offer: ${currentWebsiteFindings.coreOffer || 'Not clearly identified'}`);
        summaryLines.push(`  Target Audience: ${currentWebsiteFindings.targetAudience || 'Not clearly identified'}`);
        summaryLines.push(`  Problem Solved: ${currentWebsiteFindings.problemSolved || 'Not clearly identified'}`);
        summaryLines.push(`  Value Proposition: ${currentWebsiteFindings.valueProposition || 'Not clearly identified'}`);
        if (currentWebsiteFindings.keyBenefits && currentWebsiteFindings.keyBenefits.length > 0) {
           summaryLines.push(`  Key Benefits: ${currentWebsiteFindings.keyBenefits.slice(0, 3).join(', ')}...`);
        }
        summaryLines.push("");
      } else {
        summaryLines.push("Okay, let's start refining your offer based on the initial context you provided.");
        summaryLines.push("");
      }

      let manualInputAdded = false;
      if (initialContext.currentOffer?.trim()) {
        summaryLines.push(`Current Offer: ${initialContext.currentOffer}`);
        manualInputAdded = true;
      }
      if (initialContext.targetAudience?.trim()) {
        summaryLines.push(`Target Audience: ${initialContext.targetAudience}`);
        manualInputAdded = true;
      }
      if (initialContext.problemSolved?.trim()) {
        summaryLines.push(`Problem Solved: ${initialContext.problemSolved}`);
        manualInputAdded = true;
      }
      if (manualInputAdded) {
         summaryLines.push("");
      }

      const summaryContent = summaryLines.join('\n').trim();
      addChatMessage({ sender: 'ai', content: summaryContent });

      try {
        console.log('[ContextChat] Generating initial question...');
        const questionsText = await generateClarifyingQuestions(initialContext, getWebsiteFindings());
        const parsedQuestions = parseQuestionsFromText(questionsText);
        console.log(`[ContextChat] Generated ${parsedQuestions.length} questions.`);

        if (parsedQuestions.length > 0) {
          setTimeout(() => {
            addChatMessage({ sender: 'ai', content: parsedQuestions[0] });
          }, 500);
        } else {
          setTimeout(() => {
            addChatMessage({ sender: 'ai', content: "Where would you like to start refining your offer?" });
          }, 500);
        }
      } catch (error) {
        console.error('[ContextChat] Error generating initial question:', error);
        setTimeout(() => {
          addChatMessage({ sender: 'ai', content: "What's the main goal of your offer?" });
        }, 500);
      } finally {
        setIsProcessing(false);
      }
    };

    getInitialQuestion();

  }, [isInitialLoad, websiteScraping.status, websiteUrl, initialContext]);

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

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isOpen && contextChat.messages.length > 0 && !isInitialLoad) {
      if(contextChat.messages[contextChat.messages.length - 1]?.sender !== 'system'){
         setHasNewMessages(true);
      }
    }
  }, [contextChat.messages, isOpen, isInitialLoad]);


  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userInput = currentInput;
    setCurrentInput('');
    setHasNewMessages(false);

    addChatMessage({
      sender: 'user',
      content: userInput
    });

    setIsProcessing(true);

    try {
      // Get current store state
      const store = useOfferStore.getState();

      // Get the latest website findings using our helper function
      const currentFindings = getWebsiteFindings();

      // Log for debugging
      console.log('handleSendMessage - currentFindings:', currentFindings);

      const response = await generateChatResponse(
        useOfferStore.getState().contextChat.messages,
        useOfferStore.getState().initialContext,
        currentFindings
      );

      addChatMessage({
        sender: 'ai',
        content: response
      });

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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessages(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className={`relative w-16 h-16 rounded-full bg-[#FFD23F] text-[#1C1C1C] flex items-center justify-center shadow-lg hover:bg-[#FFD23F]/90 transition-all`}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Bot className="w-8 h-8" />
        )}
        {hasNewMessages && !isOpen && (
           <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 max-w-[90vw] bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden flex flex-col border border-[#333333]">
          <div className="bg-[#1C1C1C] p-4 flex justify-between items-center border-b border-[#333333]">
            <h3 className="text-white font-medium">Offer Context Assistant</h3>
            <button onClick={toggleChat} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={messagesEndRef}
            className="h-96 overflow-y-auto p-4 space-y-4 bg-[#1C1C1C]"
          >
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
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-[#3A3A3A] text-white rounded-lg p-3">
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#333333] p-4 bg-[#2A2A2A]">
            <div className="flex space-x-2">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your offer context..."
                className="flex-1 p-2 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FFD23F] focus:border-transparent resize-none text-sm"
                rows={2}
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isProcessing}
                className={`p-2 rounded-lg ${
                  !currentInput.trim() || isProcessing
                    ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                }`}
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
