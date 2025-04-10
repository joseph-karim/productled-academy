import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOfferStore } from '../store/offerStore';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { generateClarifyingQuestions, generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';

interface ContextChatProps {
  onComplete: () => void;
}

export function ContextChat({ onComplete }: ContextChatProps) {
  const { 
    websiteUrl, 
    initialContext, 
    websiteScraping,
    contextChat,
    addChatMessage,
    clearChatMessages
  } = useOfferStore();
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // For AI response generation
  const [isInitializing, setIsInitializing] = useState(true); // For initial loading/question generation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Removed websiteFindings useMemo hook

  useEffect(() => {
    // Show loading message if scraping is in progress
    if (websiteScraping.status === 'processing') {
      clearChatMessages(); 
      addChatMessage({ sender: 'system', content: 'Reviewing website content...' });
      setIsInitializing(true); // Keep initializing flag true while scraping
      return; // Exit effect if still processing
    }

    // --- Initialize chat only when scraping is NOT processing ---
    
    // Clear previous messages and state only once after scraping is resolved
    clearChatMessages();
    setCurrentQuestionIndex(0); 
    setQuestions([]); 
    setIsInitializing(true); // Set initializing flag

    const initializeChat = async () => {
      let summaryLines: string[] = [];
      let currentWebsiteFindings: WebsiteFindings | null = null;
      let analysisPerformed = false;

      // Prepare website findings if completed
      if (websiteScraping.status === 'completed' && websiteScraping.coreOffer) {
        analysisPerformed = true;
        currentWebsiteFindings = {
          coreOffer: websiteScraping.coreOffer,
          targetAudience: websiteScraping.targetAudience,
          problemSolved: websiteScraping.keyProblem,
          keyBenefits: Array.isArray(websiteScraping.keyFeatures)
            ? websiteScraping.keyFeatures.map(feature =>
                typeof feature === 'string' ? feature : feature.benefit
              )
            : [],
          valueProposition: websiteScraping.valueProposition,
          cta: null, tone: null, missingInfo: null
        };
      }

      // Construct the opening line
      if (analysisPerformed) {
        summaryLines.push(`Hello! I've reviewed your website (${websiteUrl}) and the initial context. Let's refine your offer based on this:`);
      } else {
        summaryLines.push("Okay, let's refine your offer based on the initial context you provided:");
      }
      summaryLines.push(""); // Add a blank line

      // Add manual inputs only if they have content AND analysis didn't provide it
      let manualInputAdded = false;
      if (initialContext.currentOffer?.trim() && !currentWebsiteFindings?.coreOffer) {
        summaryLines.push(`Current Offer: ${initialContext.currentOffer}`);
        manualInputAdded = true;
      }
      if (initialContext.targetAudience?.trim() && !currentWebsiteFindings?.targetAudience) {
        summaryLines.push(`Target Audience: ${initialContext.targetAudience}`);
        manualInputAdded = true;
      }
      if (initialContext.problemSolved?.trim() && !currentWebsiteFindings?.problemSolved) {
        summaryLines.push(`Problem Solved: ${initialContext.problemSolved}`);
        manualInputAdded = true;
      }
      if (manualInputAdded) {
         summaryLines.push(""); // Add blank line after manual inputs if any were added
      }

      // Add website analysis section if successful
      if (analysisPerformed && currentWebsiteFindings) {
        summaryLines.push("Website Analysis Findings:");
        summaryLines.push(`  Core Offer: ${currentWebsiteFindings.coreOffer || 'Not clearly identified'}`);
        summaryLines.push(`  Target Audience: ${currentWebsiteFindings.targetAudience || 'Not clearly identified'}`);
        summaryLines.push(`  Problem Solved: ${currentWebsiteFindings.problemSolved || 'Not clearly identified'}`);
        summaryLines.push(`  Value Proposition: ${currentWebsiteFindings.valueProposition || 'Not clearly identified'}`);
        if (currentWebsiteFindings.keyBenefits && currentWebsiteFindings.keyBenefits.length > 0) {
           summaryLines.push(`  Key Benefits: ${currentWebsiteFindings.keyBenefits.slice(0, 3).join(', ')}...`);
        }
         summaryLines.push(""); // Add blank line after analysis
      } else if (websiteUrl && websiteScraping.status !== 'idle') { // Only mention if URL provided AND scraping was attempted
         summaryLines.push(`Website URL Provided: ${websiteUrl} (Analysis was skipped, failed, or is pending)`);
         summaryLines.push(""); 
      }
      
      const summaryContent = summaryLines.join('\n').trim(); // Trim potential trailing newline

      // Only add summary if it has meaningful context beyond the opening line
      if (summaryContent.length > summaryLines[0].length + 1) { 
          addChatMessage({ sender: 'ai', content: summaryContent });
      } else {
          // If no real context, just use a simple opening line
          addChatMessage({ sender: 'ai', content: "Okay, let's refine your offer. Please tell me about it." });
      }

      // Generate and ask questions
      // setIsProcessing(true); // Already handled by isInitializing
      try {
        const questionsText = await generateClarifyingQuestions(initialContext, currentWebsiteFindings);
        const parsedQuestions = parseQuestionsFromText(questionsText);
        setQuestions(parsedQuestions);

        if (parsedQuestions.length > 0) {
          // Add a slight delay before asking the first question
          setTimeout(() => {
            addChatMessage({ sender: 'ai', content: parsedQuestions[0] });
            setCurrentQuestionIndex(1);
          }, 500); 
        } else {
          // If no questions generated, provide a concluding message
          setTimeout(() => {
            addChatMessage({ sender: 'ai', content: "I think I have enough context for now. Feel free to add more details or ask questions, otherwise you can proceed to the next step." });
          }, 500);
        }
      } catch (error) {
        console.error('Error generating clarifying questions:', error);
        const fallbackQuestions = [
          "What specific results do your customers achieve with your offer?",
          "What makes your solution unique compared to alternatives?",
          "What objections do potential customers typically have?"
        ];
        setQuestions(fallbackQuestions);
        setTimeout(() => {
          addChatMessage({ sender: 'ai', content: fallbackQuestions[0] });
          setCurrentQuestionIndex(1);
        }, 500);
      } finally {
        setIsInitializing(false); // Mark initialization complete
      }
    };

    initializeChat();

  // Rerun when scraping status changes or initial context changes
  }, [initialContext, websiteScraping.status, websiteUrl, addChatMessage, clearChatMessages]); 
  // Note: Removed specific scraping fields from deps, status change handles it.
  
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
    if (contextChat.messages.length > 3) {
      setHasNewMessages(true);
    }
  }, [contextChat.messages.length]);
  
  useEffect(() => {
    if (messagesEndRef.current && contextChat.messages.length <= 3) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isInitializing || isProcessing) return; // Prevent sending during init or processing

    const userInput = currentInput; // Capture input before clearing
    setCurrentInput('');
    setHasNewMessages(false); // Reset notification when user sends a message

    // Add user message immediately
    addChatMessage({
      sender: 'user',
      content: userInput
    });
    
    setIsProcessing(true); // Start processing indicator for AI response

    // Recalculate websiteFindings based on current store state before sending message
    let currentWebsiteFindings: WebsiteFindings | null = null;
    if (websiteScraping.status === 'completed' && websiteScraping.coreOffer) {
      currentWebsiteFindings = {
        coreOffer: websiteScraping.coreOffer,
        targetAudience: websiteScraping.targetAudience,
        problemSolved: websiteScraping.keyProblem,
        keyBenefits: Array.isArray(websiteScraping.keyFeatures)
          ? websiteScraping.keyFeatures.map(feature =>
              typeof feature === 'string' ? feature : feature.benefit
            )
          : [],
        valueProposition: websiteScraping.valueProposition,
        cta: null, tone: null, missingInfo: null
      };
    }

    try {
      const response = await generateChatResponse(
        // Pass the updated messages array from the store
        useOfferStore.getState().contextChat.messages, 
        initialContext, 
        currentWebsiteFindings // Use the locally calculated findings
      );
      
      addChatMessage({
        sender: 'ai',
        content: response
      });
      
      if (currentQuestionIndex < questions.length) {
        setTimeout(() => {
          addChatMessage({
            sender: 'ai',
            content: questions[currentQuestionIndex]
          });
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1500);
      } else {
        setTimeout(() => {
          addChatMessage({
            sender: 'ai',
            content: `Thank you for sharing all this information! I now have a much better understanding of your offer.
            
Based on our conversation, I recommend focusing on:
1. Making your value proposition crystal clear
2. Addressing specific pain points with concrete solutions
3. Including specific results or outcomes customers can expect

Are you ready to continue building your offer?`
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      addChatMessage({
        sender: 'ai',
        content: `Thank you for sharing that information. This helps me understand your offer better.`
      });
      
      if (currentQuestionIndex < questions.length) {
        setTimeout(() => {
          addChatMessage({
            sender: 'ai',
            content: questions[currentQuestionIndex]
          });
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1000);
      }
    } finally {
      setIsProcessing(false); // Stop processing indicator
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden flex flex-col h-[70vh] w-full">
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
                    : 'bg-[#2A2A2A] text-white' // System messages
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
              {/* Only show timestamp for non-system messages */}
              {message.sender !== 'system' && (
                 <div className="text-xs opacity-50 mt-1 text-right">
                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
              )}
            </div>
          </div>
        ))}
        {/* Show thinking indicator during initial question generation OR AI response generation */}
        {(isInitializing || isProcessing) && ( 
          <div className="flex justify-start">
            <div className="bg-[#3A3A3A] text-white rounded-lg p-3">
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{isInitializing ? 'Initializing...' : 'Thinking...'}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button with notification indicator */}
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
            disabled={isInitializing || isProcessing} // Disable input during init and processing
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isInitializing || isProcessing} // Disable send during init and processing
            className={`p-3 rounded-lg ${
              !currentInput.trim() || isInitializing || isProcessing
                ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
            }`}
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
            disabled={isInitializing} // Disable continue button during initialization
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
