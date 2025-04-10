import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { generateRiskReversalSuggestions } from '../services/ai/contextSuggestions'; // Assuming this exists

// Define the structure for a risk reversal (matching store type)
interface RiskReversal {
  id: string;
  riskId: string;
  text: string;
}

export function RiskReversalBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    risks, 
    riskReversals, 
    addRiskReversal, 
    updateRiskReversal, 
    removeRiskReversal,
    setProcessing 
  } = useOfferStore();
  
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const getReversalForRisk = (riskId: string): RiskReversal | undefined => {
    return riskReversals.find(rr => rr.riskId === riskId);
  };

  const handleReversalChange = (riskId: string, text: string) => {
    const existingReversal = getReversalForRisk(riskId);
    if (existingReversal) {
      updateRiskReversal(existingReversal.id, { text });
    } else {
      // Add new reversal if text is entered
      if (text.trim()) {
        addRiskReversal(riskId, text);
      }
    }
  };
  
  const handleRemoveReversal = (riskId: string) => {
    const existingReversal = getReversalForRisk(riskId);
    if (existingReversal) {
      removeRiskReversal(existingReversal.id);
    }
  };

  const generateSuggestion = async (riskId: string, riskText: string) => {
    setIsGenerating(prev => ({ ...prev, [riskId]: true }));
    setProcessing('riskReversals', true); // Assuming this key exists in ProcessingState
    
    try {
      // Assuming an AI function exists to generate suggestions based on the risk text
      const suggestions = await generateRiskReversalSuggestions(riskText); 
      
      if (suggestions && suggestions.length > 0) {
        // Use the first suggestion
        handleReversalChange(riskId, suggestions[0].text); 
      } else {
        // Fallback if no suggestions
        handleReversalChange(riskId, `We mitigate '${riskText}' by offering [Your Solution/Guarantee Here].`);
      }
      
    } catch (error) {
      console.error('Error generating risk reversal suggestions:', error);
      // Provide a generic fallback on error
      handleReversalChange(riskId, `We understand concerns about '${riskText}'. We address this through [Your Approach Here].`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [riskId]: false }));
      setProcessing('riskReversals', false);
    }
  };

  const riskExamples = [
    "Integration difficulties",
    "Complex setup process",
    "Compliance/Security concerns (e.g., GDPR, SOC2)",
    "Lack of adequate training/onboarding",
    "Insufficient customer support",
    "Collaboration challenges (team/clients)",
    "Unclear ROI or hidden costs"
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Define Risk Reversals</h2>
        <p className="text-gray-300 mb-4">
          Address the key hesitations or perceived risks that might prevent potential customers from signing up. 
          For each risk you identified earlier, craft a statement that directly counters or mitigates that concern.
        </p>
        <p className="text-gray-300">
          Focus on guarantees, clear processes, support systems, or specific features that build confidence.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">Your Identified Risks & Reversals</h3>
        {risks.length === 0 ? (
          <p className="text-gray-400">No risks defined yet. Please define risks in the previous step.</p>
        ) : (
          risks.map((risk) => {
            const reversal = getReversalForRisk(risk.id);
            const processing = isGenerating[risk.id] || false;
            
            return (
              <div key={risk.id} className="bg-[#1A1A1A] p-5 rounded-lg">
                <p className="text-gray-300 mb-2">
                  <span className="font-medium text-white">Risk:</span> {risk.text}
                </p>
                <div className="space-y-2">
                  <textarea
                    value={reversal?.text || ''}
                    onChange={(e) => handleReversalChange(risk.id, e.target.value)}
                    disabled={readOnly || processing}
                    placeholder={`How do you address the risk of "${risk.text}"? (e.g., "Easy setup in minutes", "Dedicated support", "Money-back guarantee")`}
                    className="w-full h-24 p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                  />
                  {!readOnly && (
                    <div className="flex justify-between items-center pt-2">
                       <button
                        onClick={() => generateSuggestion(risk.id, risk.text)}
                        disabled={processing}
                        className="flex items-center px-3 py-1 text-sm bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Suggest Reversal
                          </>
                        )}
                      </button>
                      {reversal && (
                         <button
                          onClick={() => handleRemoveReversal(risk.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          aria-label="Remove Reversal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Risk Reversal Ideas & Examples</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-3">
          {riskExamples.map((example, index) => (
            <li key={index}>{example}</li>
          ))}
          <li>Money-back guarantees or extended trial periods</li>
          <li>Clear documentation and tutorials</li>
          <li>Testimonials specifically addressing overcome risks</li>
          <li>Case studies showing successful implementation</li>
          <li>Security compliance badges/certifications</li>
        </ul>
      </div>
      
      {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
}