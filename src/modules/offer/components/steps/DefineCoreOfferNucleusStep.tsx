import React from 'react';
import { useOfferStore } from '../../store/offerStore';

export function DefineCoreOfferNucleusStep({ readOnly = false }: { readOnly?: boolean }) {
  // Select relevant state and actions from the store
  const { 
    initialContext, 
    coreResult, 
    keyAdvantage, 
    topRisk, 
    primaryAssurance, 
    setInitialContext, 
    setCoreResult, 
    setKeyAdvantage, 
    setTopRisk, 
    setPrimaryAssurance 
  } = useOfferStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Define Your Core Offer (R-A-R-A)</h2>
        <p className="text-gray-300 mb-4">
          Answer these core questions to form the nucleus of your irresistible offer.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg space-y-6">
        {/* Target Audience */}
        <div>
          <label htmlFor="targetAudience" className="block text-lg font-semibold text-white mb-2">
            Target Audience: Who do you specifically help?
          </label>
          <input
            id="targetAudience"
            type="text"
            value={initialContext.targetAudience || ''}
            onChange={(e) => setInitialContext('targetAudience', e.target.value)}
            disabled={readOnly}
            placeholder="e.g., Early-stage SaaS founders launching their first product"
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
        </div>

        {/* Desired Result */}
        <div>
          <label htmlFor="coreResult" className="block text-lg font-semibold text-white mb-2">
            Desired Result: What's the #1 Result they achieve? (Include the 'Aha moment')
          </label>
          <textarea
            id="coreResult"
            rows={3}
            value={coreResult || ''}
            onChange={(e) => setCoreResult(e.target.value)}
            disabled={readOnly}
            placeholder="e.g., Confidently launch their SaaS product and acquire their first 10 paying customers within 90 days."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70 resize-none"
          />
        </div>

        {/* Key Advantage */}
        <div>
          <label htmlFor="keyAdvantage" className="block text-lg font-semibold text-white mb-2">
            Key Advantage: What's your single most compelling Advantage (unique way you deliver the Result)?
          </label>
          <textarea
            id="keyAdvantage"
            rows={3}
            value={keyAdvantage || ''}
            onChange={(e) => setKeyAdvantage(e.target.value)}
            disabled={readOnly}
            placeholder="e.g., Through a step-by-step guided system combining AI-powered market analysis with proven ProductLed launch playbooks."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70 resize-none"
          />
        </div>

        {/* Biggest Barrier */}
        <div>
          <label htmlFor="topRisk" className="block text-lg font-semibold text-white mb-2">
            Biggest Barrier: What's the #1 Risk/Objection before signing up?
          </label>
          <input
            id="topRisk"
            type="text"
            value={topRisk || ''}
            onChange={(e) => setTopRisk(e.target.value)}
            disabled={readOnly}
            placeholder="e.g., Fear of wasting time/money on another course that doesn't deliver results."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
        </div>

        {/* Primary Assurance */}
        <div>
          <label htmlFor="primaryAssurance" className="block text-lg font-semibold text-white mb-2">
            Primary Assurance: What's your main Assurance/Risk Reversal for that barrier?
          </label>
          <input
            id="primaryAssurance"
            type="text"
            value={primaryAssurance || ''}
            onChange={(e) => setPrimaryAssurance(e.target.value)}
            disabled={readOnly}
            placeholder="e.g., Get your first 10 customers guarantee or your money back."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
        </div>

      </div>
       {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
} 