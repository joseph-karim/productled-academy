import React, { useState, useRef, useEffect } from 'react';
import { useModelInputsStore } from '../../modules/model/store/modelInputsStore';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { generateFromChat } from '../../services/ai';

interface Question {
  id: string;
  text: string;
  example: string;
}

interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  content: string;
  questionId?: string;
}

export function ProductDescriptionWizard({ onClose }: { onClose: () => void }) {
  const { setProductDescription } = useModelInputsStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const questions: Question[] = [
    {
      id: 'productCategory',
      text: "What type of product/service is this? Focus on the core category.",
      example: "Example: \"A customer feedback platform\" or \"A sales automation tool\" or \"A project management system\""
    },
    {
      id: 'coreProblem',
      text: "What's the main problem your product solves?",
      example: "Example: \"Helps teams collect, analyze, and act on customer feedback 3x faster than traditional survey tools\""
    },
    {
      id: 'uniqueDifferentiators',
      text: "What makes your solution unique compared to alternatives?",
      example: "Example: \"Unlike traditional feedback tools, we offer AI-powered sentiment analysis, automated response routing, and native integration with CRM systems\""
    }
  ];

  useEffect(() => {
    if (!hasInitialized) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: "👋 I'll help you craft a compelling B2B product description. Let's start by identifying what type of product/service this is at its core."
      };

      const firstQuestion = questions[0];
      const questionMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: `${firstQuestion.text}\n\n${firstQuestion.example}`,
        questionId: firstQuestion.id
      };

      setMessages([welcomeMessage, questionMessage]);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: currentInput,
      questionId: currentQuestion.id
    };
    
    setMessages(prev => [...prev, userMessage]);
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: currentInput
    }));
    
    setCurrentInput('');
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      
      const nextQuestion = questions[nextQuestionIndex];
      const nextQuestionMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: `${nextQuestion.text}\n\n${nextQuestion.example}`,
        questionId: nextQuestion.id
      };
      setMessages(prev => [...prev, nextQuestionMessage]);
    } else {
      handleGenerateContent();
    }
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    const generatingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'system',
      content: "Thanks for your answers! I'm now crafting your product description..."
    };
    
    setMessages(prev => [...prev, generatingMessage]);
    
    try {
      const result = await generateFromChat(responses);
      
      if (result.productDescription) {
        setProductDescription(result.productDescription);
        
        const successMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'system',
          content: "✅ Done! I've generated your product description. You can now review and edit it in the form."
        };
        
        setMessages(prev => [...prev, successMessage]);
        
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error('No product description generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: "I'm sorry, I encountered an error while generating content. Please try again or continue manually."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh] w-full max-w-3xl">
      <div className="bg-[#1C1C1C] border-b border-[#333333] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-[#FFD23F]" />
          <h2 className="text-xl font-semibold text-white">Product Description Assistant</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-[#FFD23F] rounded-full p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1C1C1C]">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                  : 'bg-[#2A2A2A] text-white'
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-[#333333] p-4 bg-[#2A2A2A]">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            className="flex-1 p-3 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent resize-none"
            rows={2}
            disabled={isGenerating || currentQuestionIndex >= questions.length}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isGenerating || currentQuestionIndex >= questions.length}
            className={`p-3 rounded-lg ${
              !currentInput.trim() || isGenerating || currentQuestionIndex >= questions.length
                ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
            }`}
            aria-label="Send"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
    </div>
  );
}