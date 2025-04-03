import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Loader2 } from 'lucide-react';

export function DefineUserSuccess({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { userSuccess, setUserSuccess, setProcessing } = useOfferStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get relevant data from model analysis if available
  const userPersonas = modelData?.userPersonas || [];
  const hasModelData = userPersonas.length > 0;
  
  const handleStatementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserSuccess(e.target.value);
  };
  
  const generateSuggestion = async () => {
    // In a real implementation, this would call an AI endpoint to generate suggestions
    // For now, we'll simulate the process
    setIsProcessing(true);
    setProcessing('userSuccess', true);
    
    // Simulate API call
    setTimeout(() => {
      const suggestions = [
        "Successfully reduce customer acquisition costs by 30% through improving onboarding conversion rates",
        "Enable users to complete their core task in half the time compared to previous solutions",
        "Help marketing teams increase campaign ROI by providing actionable insights from user data"
      ];
      
      // Use the first suggestion or a custom one based on user personas if available
      let suggestion = suggestions[0];
      if (hasModelData && userPersonas[0]) {
        suggestion = `Help ${userPersonas[0].role || 'users'} ${userPersonas[0].goal || 'achieve their goals'} with less friction and faster time-to-value`;
      }
      
      setUserSuccess(suggestion);
      setIsProcessing(false);
      setProcessing('userSuccess', false);
    }, 1500);
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

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">User Success Statement</h3>
        <p className="text-gray-300 mb-6">
          Complete this statement: "Our product helps users to..."
        </p>
        
        <div className="space-y-4">
          <textarea
            value={userSuccess.statement}
            onChange={handleStatementChange}
            disabled={readOnly || isProcessing}
            placeholder="e.g., reduce support ticket volume by 40% through self-service knowledge base automation"
            className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
          
          {!readOnly && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {userSuccess.statement.length < 10 ? (
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
                  'Generate Suggestion'
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