import React, { useState, useRef, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { generateFromChat } from '../../services/ai';
import type { UserLevel } from '../../types';

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

interface UserEndgameWizardProps {
  onClose: () => void;
  level: UserLevel;
}

export function UserEndgameWizard({ onClose, level }: UserEndgameWizardProps) {
  const store = useFormStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const levelQuestions: Record<UserLevel, Question[]> = {
    beginner: [
      {
        id: 'quickWin',
        text: "What's the first valuable outcome a new user achieves?",
        example: "Example: \"Create their first professional-looking design in under 5 minutes without design skills\""
      },
      {
        id: 'firstSuccess',
        text: "What makes them say 'wow, this is worth it' in their first session?",
        example: "Example: \"Getting their first qualified lead through automated outreach\""
      }
    ],
    intermediate: [
      {
        id: 'teamValue',
        text: "What team-wide benefits do users unlock as they get comfortable?",
        example: "Example: \"Automated workflows between apps save the team 10 hours per week\""
      },
      {
        id: 'scaledSuccess',
        text: "How do their results scale up with experience?",
        example: "Example: \"Managing multiple client projects simultaneously with custom templates\""
      }
    ],
    advanced: [
      {
        id: 'powerResults',
        text: "What impressive results do power users achieve?",
        example: "Example: \"Scaling email marketing to millions of subscribers with 99.9% deliverability\""
      },
      {
        id: 'businessImpact',
        text: "What business-level impact justifies premium pricing?",
        example: "Example: \"Enterprise security controls and custom API access for full workflow automation\""
      }
    ]
  };

  const questions = levelQuestions[level];

  useEffect(() => {
    if (!hasInitialized) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: `👋 I'll help you define the outcomes for ${level} users. Just answer each question conversationally, and I'll generate polished content at the end.`
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
  }, [hasInitialized, level, questions]);

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
      content: "Thanks for your answers! I'm now crafting your user outcome..."
    };
    
    setMessages(prev => [...prev, generatingMessage]);
    
    try {
      const result = await generateFromChat(responses);
      
      // Update the outcome based on the level
      if (level === 'beginner' && result.beginnerOutcome) {
        store.updateOutcome('beginner', result.beginnerOutcome);
      } else if (level === 'intermediate' && result.intermediateOutcome) {
        store.updateOutcome('intermediate', result.intermediateOutcome);
      } else if (level === 'advanced' && result.advancedOutcome) {
        store.updateOutcome('advanced', result.advancedOutcome);
      }
      
      const successMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'system',
        content: "✅ Done! I've generated your user outcome. You can now review and edit it in the form."
      };
      
      setMessages(prev => [...prev, successMessage]);
      
      // Don't close immediately to allow feedback to be shown
      setTimeout(() => {
        onClose();
      }, 3000);
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
          <h2 className="text-xl font-semibold text-white capitalize">{level} User Outcome Assistant</h2>
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