import React from 'react';
import { useOfferStore } from '../../store/offerStore';

// Define the sections structure again for consistency
// (Ideally, this would be shared from a common types file)
const landingPageSections = {
  hero: { title: 'Hero Section', fields: ['headline', 'subheadline', 'cta'] },
  problem: { title: 'Problem/Agitation', fields: ['headline', 'body'] },
  solution: { title: 'Solution/Value', fields: ['headline', 'body'] },
  // Add other sections if they were defined in RefineLandingPageCopyStep
};

export function FinalReviewStep({ readOnly = false }: { readOnly?: boolean }) {
  const { landingPageCopy } = useOfferStore((state) => ({
    landingPageCopy: state.landingPageCopy,
  }));

  const sections = Object.keys(landingPageSections) as Array<keyof typeof landingPageSections>;
  const hasContent = sections.some(key => landingPageCopy[key] && Object.keys(landingPageCopy[key]).length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Review Landing Page Copy</h2>
        <p className="text-gray-300 mb-4">
          Here is the final edited copy for your landing page sections.
        </p>
      </div>

      {!hasContent && (
        <p className="text-yellow-500 text-center">No landing page copy has been drafted or saved yet. Please complete the previous step.</p>
      )}

      {hasContent && (
        <div className="space-y-6">
          {sections.map((sectionKey) => {
            const sectionData = landingPageCopy[sectionKey];
            const sectionConfig = landingPageSections[sectionKey];
            // Only render sections that have saved data
            if (!sectionData || Object.keys(sectionData).length === 0) {
              return null;
            }
            return (
              <div key={sectionKey} className="bg-[#222222] p-6 rounded-lg border border-[#444]">
                <h3 className="text-xl font-semibold text-[#FFD23F] border-b border-[#444] pb-2 mb-4">
                  {sectionConfig.title}
                </h3>
                <div className="space-y-3">
                  {sectionConfig.fields.map(fieldKey => (
                    <div key={fieldKey}>
                      <p className="text-sm font-medium text-gray-400 mb-1 capitalize">{fieldKey}</p>
                      <p className="text-white bg-[#1A1A1A] p-2 rounded whitespace-pre-line">
                        {sectionData[fieldKey] || <span className="text-gray-500 italic">Not provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

       {/* In a real app, might have a "Finalize" or "Export" button here */}
       {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
} 