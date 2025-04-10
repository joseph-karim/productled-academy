import React from 'react';
import { useOfferStore } from '../../store/offerStore';

export function ExclusivityStep({ readOnly = false }: { readOnly?: boolean }) {
  const { exclusivity, setExclusivity } = useOfferStore();

  const handleRadioChange = (value: string) => {
    if (!readOnly) {
      setExclusivity({ isLimited: value === 'true' });
      // Reset other fields if changing to 'false'
      if (value === 'false') {
        setExclusivity({ limitReason: '', limitNumber: null, urgencySignal: '' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-300">
        Is there a genuine limit to how many people you can serve effectively at one time or within a specific period? 
        (e.g., limited coaching spots, cohort size, early access slots)
      </p>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="radio"
            id="limit-yes"
            name="exclusivityLimit"
            value="true"
            checked={exclusivity.isLimited === true}
            onChange={(e) => handleRadioChange(e.target.value)}
            disabled={readOnly}
            className="h-4 w-4 text-[#FFD23F] focus:ring-[#FFD23F] border-gray-500 bg-[#1A1A1A]"
          />
          <label htmlFor="limit-yes" className="ml-2 block text-sm text-white">Yes, there is a limit.</label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="limit-no"
            name="exclusivityLimit"
            value="false"
            checked={exclusivity.isLimited === false}
            onChange={(e) => handleRadioChange(e.target.value)}
            disabled={readOnly}
            className="h-4 w-4 text-[#FFD23F] focus:ring-[#FFD23F] border-gray-500 bg-[#1A1A1A]"
          />
          <label htmlFor="limit-no" className="ml-2 block text-sm text-white">No, capacity is not a major constraint.</label>
        </div>
      </div>

      {/* Show conditional inputs only if isLimited is true */}
      {exclusivity.isLimited === true && (
        <div className="space-y-4 pl-6 border-l-2 border-[#444]">
          <div>
            <label htmlFor="limitNumber" className="block text-sm font-medium text-gray-300 mb-1">
              Capacity Limit (Optional Number)
            </label>
            <input
              id="limitNumber"
              type="number"
              value={exclusivity.limitNumber ?? ''} // Handle null
              onChange={(e) => setExclusivity({ limitNumber: e.target.value ? parseInt(e.target.value, 10) : null })}
              disabled={readOnly}
              placeholder="e.g., 50"
              className="w-full p-2 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
          <div>
            <label htmlFor="limitReason" className="block text-sm font-medium text-gray-300 mb-1">
              Valid Reason for Limit <span className="text-red-500">*</span>
            </label>
            <textarea
              id="limitReason"
              rows={2}
              value={exclusivity.limitReason || ''}
              onChange={(e) => setExclusivity({ limitReason: e.target.value })}
              disabled={readOnly}
              placeholder="e.g., To ensure personalized onboarding for each customer."
              className="w-full p-2 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70 resize-none"
            />
          </div>
           <div>
            <label htmlFor="urgencySignal" className="block text-sm font-medium text-gray-300 mb-1">
              Urgency Signal (How will you communicate this? Optional)
            </label>
            <input
              id="urgencySignal"
              type="text"
              value={exclusivity.urgencySignal || ''}
              onChange={(e) => setExclusivity({ urgencySignal: e.target.value })}
              disabled={readOnly}
              placeholder="e.g., Countdown timer, 'Only X spots left' banner"
              className="w-full p-2 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        </div>
      )}
    </div>
  );
} 