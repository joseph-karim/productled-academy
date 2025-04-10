import React from 'react';
// Assuming ExclusivityStep and BonusesStep exist and can be reused
import { ExclusivityStep } from './ExclusivityStep'; 
import { BonusesStep } from './BonusesStep';

export function AddEnhancersStep({ readOnly = false }: { readOnly?: boolean }) {

  return (
    <div className="space-y-12"> {/* Increased spacing */} 
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Add Offer Enhancers</h2>
        <p className="text-gray-300 mb-4">
          Layer scarcity, urgency, and added value onto your core offer to make it even more compelling.
        </p>
      </div>

      {/* Render Exclusivity Step Content */}
      <div className="bg-[#222222] p-6 rounded-lg border border-[#444]">
         <h3 className="text-xl font-semibold text-white mb-4 border-b border-[#444] pb-2">Exclusivity / Scarcity</h3>
         <ExclusivityStep readOnly={readOnly} />
      </div>

      {/* Render Bonuses Step Content */} 
      <div className="bg-[#222222] p-6 rounded-lg border border-[#444]">
         <h3 className="text-xl font-semibold text-white mb-4 border-b border-[#444] pb-2">Bonuses</h3>
         <BonusesStep readOnly={readOnly} />
      </div>

       {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
} 