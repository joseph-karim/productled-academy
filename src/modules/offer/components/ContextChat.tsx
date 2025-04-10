import React, { useState, useRef, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { generateClarifyingQuestions, generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';
import { InitialContext } from '../services/ai/types';

interface ContextChatProps {
  onComplete?: () => void;
}

export function ContextChat({ onComplete }: ContextChatProps) {
  const { 
    contextChat,
    addChatMessage,
    clearChatMessages,
    websiteUrl,
    initialContext,
    websiteScraping,
  } = useOfferStore();
  
  const websiteFindings: WebsiteFindings | null = 
    websiteScraping.status === 'completed' && websiteScraping.coreOffer
    ? {
        coreOffer: websiteScraping.coreOffer,
        targetAudience: websiteScraping.targetAudience,
        problemSolved: websiteScraping.keyProblem,
        keyBenefits: Array.isArray(websiteScraping.keyFeatures)
          ? websiteScraping.keyFeatures.map(feature =>
              typeof feature === 'string' ? feature : feature.benefit || ''
            ).filter(Boolean)
          : [],
        valueProposition: websiteScraping.valueProposition,
        cta: null,
        tone: null,
        missingInfo: null 
      }
    : null;

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    clearChatMessages();
    setIsProcessing(true);
    
    const getInitialQuestion = async () => {
      let summaryLines: string[] = [];
      let analysisPerformed = false;

      if (websiteScraping.status === 'completed' && websiteFindings?.coreOffer) {
        analysisPerformed = true;
        summaryLines.push(`Hello! I've reviewed your website (${websiteUrl}) and the initial context. Let's refine your offer based on this:`);
        summaryLines.push("");
        summaryLines.push("Website Analysis Findings:");
        summaryLines.push(`  Core Offer: ${websiteFindings.coreOffer || 'Not clearly identified'}`);
        summaryLines.push(`  Target Audience: ${websiteFindings.targetAudience || 'Not clearly identified'}`);
        summaryLines.push(`  Problem Solved: ${websiteFindings.problemSolved || 'Not clearly identified'}`);
        summaryLines.push(`  Value Proposition: ${websiteFindings.valueProposition || 'Not clearly identified'}`);
        if (websiteFindings.keyBenefits && websiteFindings.keyBenefits.length > 0) {
           summaryLines.push(`  Key Benefits: ${websiteFindings.keyBenefits.slice(0, 3).join(', ')}...`);
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
        const questionsText = await generateClarifyingQuestions(initialContext, websiteFindings);
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

  }, [websiteScraping.status, websiteUrl, initialContext]);
  
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
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (contextChat.messages.length > 3) {
      setHasNewMessages(true);
    }
  }, [contextChat.messages]);
  

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
      const currentFindings = 
         useOfferStore.getState().websiteScraping.status === 'completed' && useOfferStore.getState().websiteScraping.coreOffer
         ? {
             coreOffer: useOfferStore.getState().websiteScraping.coreOffer,
             targetAudience: useOfferStore.getState().websiteScraping.targetAudience,
             problemSolved: useOfferStore.getState().websiteScraping.keyProblem,
             keyBenefits: Array.isArray(useOfferStore.getState().websiteScraping.keyFeatures)
               ? useOfferStore.getState().websiteScraping.keyFeatures.map(feature =>
                   typeof feature === 'string' ? feature : feature.benefit || ''
                 ).filter(Boolean)
               : [],
             valueProposition: useOfferStore.getState().websiteScraping.valueProposition,
             cta: null, tone: null, missingInfo: null 
           }
         : null;

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


  return (
    <div className="bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden flex flex-col h-full w-full relative">
      <div className="bg-[#1C1C1C] border-b border-[#333333] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-[#FFD23F]" />
          <h2 className="text-xl font-semibold text-white">Offer Context Assistant</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1C1C1C]">
        {contextChat.messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                  : message.sender === 'ai'
                    ? 'bg-[#3A3A3A] text-white'
                    : 'bg-[#2A2A2A] text-white'
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
              {message.sender !== 'system' && (
                 <div className="text-xs opacity-50 mt-1 text-right">
                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {contextChat.messages.length > 3 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setHasNewMessages(false);
              }}
              className={`px-3 py-1 ${hasNewMessages ? 'bg-[#FFD23F] text-[#1C1C1C]' : 'bg-[#333333] text-white'} rounded-md hover:bg-opacity-90 text-sm flex items-center`}
            >
              {hasNewMessages && (
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              )}
              View Latest Messages
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-[#333333] p-4 bg-[#2A2A2A]">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent resize-none"
            rows={2}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isProcessing}
            className={`p-3 rounded-lg ${
              !currentInput.trim() || isProcessing
                ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
            }`}
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {onComplete && (
          <div className="flex justify-end mt-4 p-4 border-t border-[#333333]">
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={isProcessing}
            >
              Continue to Offer Builder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
