import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { getAnalysisCoachResponse } from '../services/ai/chat';
import { Loader2 } from 'lucide-react';

export function ContextGatheringForm() {
  const { websiteUrl, initialContext, setWebsiteUrl, setInitialContext } = useOfferStore();
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentField, setCurrentField] = useState<keyof typeof initialContext | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const questions = [
    { question: "What's your current offer or product?", field: "currentOffer" as const },
    { question: "Who is your target audience?", field: "targetAudience" as const },
    { question: "What problem does your product or service solve?", field: "problemSolved" as const }
  ];
  
  useEffect(() => {
    if (questions.length > 0 && questionIndex < questions.length) {
      setCurrentQuestion(questions[questionIndex].question);
      setCurrentField(questions[questionIndex].field);
      setCurrentAnswer(initialContext[questions[questionIndex].field]);
    }
  }, [questionIndex, initialContext]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
  };
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };
  
  const handleSubmitAnswer = async () => {
    if (!currentField || !currentAnswer.trim()) return;
    
    setInitialContext(currentField, currentAnswer);
    
    setIsProcessingQuestion(true);
    
    try {
      const context = {
        websiteUrl,
        ...initialContext,
        [currentField]: currentAnswer
      };
      
      const mockAnalysisContext = {
        scorecard: [
          {
            item: 'Initial Context',
            rating: 'Fair' as const,
            justification: 'Building initial context for offer creation'
          }
        ],
        feedback: `### Key Strengths:
        - The user is providing initial context about their offer
        
        ### Areas for Improvement:
        - More specific details would help create a better tailored offer`,
        nextSteps: [
          `Consider the specific value your ${context.currentOffer || 'product'} provides to ${context.targetAudience || 'your audience'}`
        ]
      };
      
      const response = await getAnalysisCoachResponse(
        [{ 
          role: 'user', 
          content: `I'm creating an offer for: ${context.currentOffer || 'my product'}. 
          Target audience: ${context.targetAudience || 'Not specified yet'}.
          Problem solved: ${context.problemSolved || 'Not specified yet'}.
          Website URL: ${websiteUrl || 'Not provided'}.
          
          My current answer: ${currentAnswer}
          
          Please provide feedback on this information and suggest how I can improve it.`
        }],
        mockAnalysisContext
      );
      
      setAiResponse(response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('Sorry, I had trouble analyzing your response. Please continue with the next question.');
    } finally {
      setIsProcessingQuestion(false);
    }
    
    if (questionIndex < questions.length - 1) {
      setTimeout(() => {
        setQuestionIndex(questionIndex + 1);
        setCurrentAnswer('');
        setAiResponse(null);
      }, 2000);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Let's Gather Some Context</h2>
        <p className="text-gray-300 mb-4">
          Before we start building your irresistible offer, let's gather some information about your product or service.
          This will help us create a more tailored experience for you.
        </p>
      </div>
      
      {/* Website URL Input */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Your Website</h3>
        <p className="text-gray-300 mb-6">
          If you have a website for your product or service, please enter the URL below.
          This will help us understand your current positioning.
        </p>
        
        <div className="space-y-4">
          <input
            type="url"
            value={websiteUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
          />
          <p className="text-sm text-gray-400">
            (Optional) Providing your website helps us give more relevant suggestions.
          </p>
        </div>
      </div>
      
      {/* Current Question */}
      {currentQuestion && (
        <div className="bg-[#222222] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion}</h3>
          
          <div className="space-y-4">
            <textarea
              value={currentAnswer}
              onChange={handleAnswerChange}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
            />
            
            <div className="flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={isProcessingQuestion || !currentAnswer.trim()}
                className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
              >
                {isProcessingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </div>
          </div>
          
          {/* AI Response */}
          {aiResponse && (
            <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg">
              <h4 className="text-white font-medium mb-2">Feedback:</h4>
              <p className="text-gray-300">{aiResponse}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Question {questionIndex + 1} of {questions.length}
        </div>
        <div className="flex space-x-1">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= questionIndex ? 'bg-[#FFD23F]' : 'bg-[#333333]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
