import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { generateUserSuccessSuggestions } from '../services/ai/contextSuggestions';
import { ActiveConversationalCheckpoint } from './ConversationalCheckpoint';

export function DefineUserSuccess({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    userSuccess, 
    setUserSuccess, 
    setProcessing,
    addAISuggestion,
    addConversationalCheckpoint,
    setActiveCheckpoint,
    initialContext,
    websiteScraping
  } = useOfferStore();
  
  const [userSuccessStatement, setUserSuccessStatement] = useState(userSuccess.statement);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idleTimeoutId, setIdleTimeoutId] = useState<number | null>(null);
  
  // Get relevant data from model analysis if available
  const userPersonas = modelData?.userPersonas || [];
  const hasModelData = userPersonas.length > 0;
  
  useEffect(() => {
    return () => {
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }
    };
  }, [idleTimeoutId]);
  
  useEffect(() => {
    if (!readOnly && userSuccessStatement.length === 0) {
      const timeoutId = setTimeout(async () => {
        try {
          const suggestions = await generateUserSuccessSuggestions(initialContext, websiteScraping);
          
          suggestions.forEach(suggestion => {
            addAISuggestion(suggestion);
          });
          
          const checkpointId = crypto.randomUUID();
          addConversationalCheckpoint({
            type: 'userSuccess',
            triggerCondition: 'empty',
            message: "I notice you haven't defined your user success statement yet. Here are some suggestions based on your context:",
            suggestions: suggestions.map(s => ({ ...s, id: crypto.randomUUID(), createdAt: new Date() })),
          });
          setActiveCheckpoint(checkpointId);
        } catch (error) {
          console.error('Error generating user success suggestions:', error);
        }
      }, 3000); // Show after 3 seconds of inactivity with empty input
      
      setIdleTimeoutId(timeoutId as unknown as number);
    } else if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
      setIdleTimeoutId(null);
    }
  }, [userSuccessStatement, readOnly, addAISuggestion, addConversationalCheckpoint, setActiveCheckpoint, initialContext, websiteScraping]);
  
  const handleStatementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserSuccessStatement(e.target.value);
    
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    
    if (e.target.value.length > 10 && e.target.value.length < 50) {
      const newTimeoutId = setTimeout(async () => {
        try {
          const checkpointId = crypto.randomUUID();
          addConversationalCheckpoint({
            type: 'userSuccess',
            triggerCondition: 'incomplete',
            message: "Your statement is a good start! Consider making it more specific by including measurable outcomes or clear benefits for your users.",
            suggestions: [],
          });
          setActiveCheckpoint(checkpointId);
        } catch (error) {
          console.error('Error creating incomplete checkpoint:', error);
        }
      }, 5000); // Show after 5 seconds of inactivity with incomplete input
      
      setIdleTimeoutId(newTimeoutId as unknown as number);
    }
    
    setUserSuccess(e.target.value);
  };
  
  const handleUseSuggestion = (text: string) => {
    setUserSuccessStatement(text);
    setUserSuccess(text);
    setActiveCheckpoint(null);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setUserSuccessStatement(text);
      setUserSuccess(text);
    }
  };
  
  const generateSuggestion = async () => {
    setIsProcessing(true);
    setProcessing('userSuccess', true);
    
    try {
      const suggestions = await generateUserSuccessSuggestions(initialContext, websiteScraping);
      
      suggestions.forEach(suggestion => {
        addAISuggestion(suggestion);
      });
      
      const checkpointId = crypto.randomUUID();
      addConversationalCheckpoint({
        type: 'userSuccess',
        triggerCondition: 'time',
        message: "Here are some AI-powered suggestions for your user success statement:",
        suggestions: suggestions.map(s => ({ ...s, id: crypto.randomUUID(), createdAt: new Date() })),
      });
      setActiveCheckpoint(checkpointId);
      
      if (hasModelData && userPersonas[0]) {
        const customSuggestion = `Help ${userPersonas[0].role || 'users'} ${userPersonas[0].goal || 'achieve their goals'} with less friction and faster time-to-value`;
        setUserSuccessStatement(customSuggestion);
        setUserSuccess(customSuggestion);
      } else if (suggestions.length > 0) {
        setUserSuccessStatement(suggestions[0].text);
        setUserSuccess(suggestions[0].text);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsProcessing(false);
      setProcessing('userSuccess', false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Define User Success</h2>
        <p className="text-gray-300 mb-4">
          What does success look like for your users? Defining this clearly will help you craft an offer 
          that resonates with their goals and challenges.
        </p>
        <p className="text-gray-300">
          Think about the transformation your product enables for users - what can they achieve with your 
          solution that they couldn't before?
        </p>
      </div>

      <div 
        className="bg-[#222222] p-6 rounded-lg"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <h3 className="text-xl font-semibold text-white mb-4">User Success Statement</h3>
        <p className="text-gray-300 mb-6">
          Complete this statement: "Our product helps users to..."
        </p>
        
        <div className="space-y-4">
          <textarea
            value={userSuccessStatement}
            onChange={handleStatementChange}
            disabled={readOnly || isProcessing}
            placeholder="e.g., reduce support ticket volume by 40% through self-service knowledge base automation"
            className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
          
          <ActiveConversationalCheckpoint
            fieldType="userSuccess"
            onSelectSuggestion={handleUseSuggestion}
          />
          
          {!readOnly && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {userSuccessStatement.length < 10 ? (
                  <span className="text-yellow-500">Please provide a detailed success statement</span>
                ) : (
                  <span className="text-green-500">Good! Your statement is clear and specific</span>
                )}
              </div>
              
              <button
                onClick={generateSuggestion}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Success Statement Tips</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-3">
          <li>Be specific - include measurable outcomes when possible</li>
          <li>Focus on the user's perspective, not your product features</li>
          <li>Consider both tangible results (metrics, savings) and intangible benefits (feelings, status)</li>
          <li>Think about time - how quickly can users achieve this success?</li>
          <li>Highlight the transformation - before vs. after using your product</li>
        </ul>
      </div>
      
      {hasModelData && userPersonas.length > 0 && (
        <div className="bg-[#262650] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Insights from Model Analysis</h3>
          <p className="text-gray-300 mb-4">
            Based on your Product Model analysis, consider these user personas when defining success:
          </p>
          <div className="space-y-4">
            {userPersonas.slice(0, 2).map((persona: any, index: number) => (
              <div key={index} className="bg-[#1A1A1A] p-4 rounded-lg">
                <h4 className="text-white font-medium">{persona.role || 'User'}</h4>
                <p className="text-gray-300 text-sm mt-1">Goal: {persona.goal || 'No goal defined'}</p>
                <p className="text-gray-300 text-sm mt-1">Challenge: {persona.challenge || 'No challenge defined'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}    