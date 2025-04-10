import React from 'react';
import { useOfferStore } from '../../store/offerStore';

export function ReviewOfferCanvasStep({ readOnly = false }: { readOnly?: boolean }) {
  // Select the core RARA fields and the confirmation status
  const {
    initialContext,
    coreResult,
    keyAdvantage,
    topRisk,
    primaryAssurance,
    offerCanvasConfirmed,
    setOfferCanvasConfirmed
  } = useOfferStore((state) => ({
    initialContext: state.initialContext,
    coreResult: state.coreResult,
    keyAdvantage: state.keyAdvantage,
    topRisk: state.topRisk,
    primaryAssurance: state.primaryAssurance,
    offerCanvasConfirmed: state.offerCanvasConfirmed,
    setOfferCanvasConfirmed: state.setOfferCanvasConfirmed,
  }));

  // Function to handle confirmation
  const handleConfirm = () => {
    if (!readOnly) {
      setOfferCanvasConfirmed(true);
      // Optionally trigger moving to the next step if MultiStepForm doesn't handle it automatically
      // const goNext = useMultiStepNavigation(); // Hypothetical hook
      // goNext();
    }
  };

  const isComplete = (
      (initialContext?.targetAudience?.trim() ?? '').length > 0 && 
      (coreResult?.trim() ?? '').length > 0 &&
      (keyAdvantage?.trim() ?? '').length > 0 &&
      (topRisk?.trim() ?? '').length > 0 &&
      (primaryAssurance?.trim() ?? '').length > 0
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Review Your Core Offer Canvas</h2>
        <p className="text-gray-300 mb-4">
          Confirm that these foundational components accurately represent your offer before adding enhancers.
        </p>
      </div>

      {!isComplete && (
         <p className="text-yellow-500 text-center mb-4">Please complete all fields in the previous step first.</p>
      )}

      {isComplete && (
        <div className="bg-[#222222] p-6 rounded-lg space-y-4 border border-[#444]">
          <h3 className="text-xl font-semibold text-[#FFD23F] border-b border-[#444] pb-2 mb-4">Core Offer Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Target Audience</p>
              <p className="text-white bg-[#1A1A1A] p-2 rounded">{initialContext.targetAudience || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Core Result</p>
              <p className="text-white bg-[#1A1A1A] p-2 rounded">{coreResult || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Key Advantage</p>
              <p className="text-white bg-[#1A1A1A] p-2 rounded">{keyAdvantage || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Top Risk/Barrier</p>
              <p className="text-white bg-[#1A1A1A] p-2 rounded">{topRisk || '-'}</p>
            </div>
            <div className="md:col-span-2"> {/* Span across both columns */} 
              <p className="text-sm font-medium text-gray-400 mb-1">Primary Assurance / Risk Reversal</p>
              <p className="text-white bg-[#1A1A1A] p-2 rounded">{primaryAssurance || '-'}</p>
            </div>
          </div>

          {!readOnly && (
            <div className="mt-6 pt-4 border-t border-[#444]">
              {offerCanvasConfirmed ? (
                <p className="text-center text-green-500 font-medium">Core Offer Confirmed!</p>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="w-full px-6 py-3 bg-[#FFD23F] text-[#1C1C1C] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  Confirm Core Offer & Add Enhancers
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
} 