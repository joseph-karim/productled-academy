import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Loader2 } from 'lucide-react';
// We need new AI generator functions
// import { 
//   generateHeroCopyDraft, 
//   generateProblemCopyDraft, 
//   generateSolutionCopyDraft, 
//   // ... etc
// } from '../../services/ai/generators';

// Define the sections and their expected copy points
const landingPageSections = {
  hero: { 
    title: 'Hero Section',
    fields: ['headline', 'subheadline', 'cta'] 
  },
  problem: { 
    title: 'Problem/Agitation',
    fields: ['headline', 'body']
  },
  solution: { 
    title: 'Solution/Value',
    fields: ['headline', 'body']
  },
  // Add other sections like RiskReversal, SocialProof, FinalCTA etc.
};

type SectionKey = keyof typeof landingPageSections;

// Placeholder for AI generator functions
const generateDraft = async (sectionKey: SectionKey, context: any): Promise<Record<string, string>> => {
  console.log(`AI Placeholder: Generating draft for ${sectionKey} with context:`, context);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI delay
  const sectionFields = landingPageSections[sectionKey]?.fields || [];
  const draft: Record<string, string> = {};
  sectionFields.forEach(field => {
    draft[field] = `[AI Draft for ${sectionKey} - ${field}]`;
  });
  return draft;
};

export function RefineLandingPageCopyStep({ readOnly = false }: { readOnly?: boolean }) {
  const { 
    initialContext,
    coreResult,
    keyAdvantage,
    topRisk,
    primaryAssurance,
    exclusivity,
    bonuses,
    landingPageCopy, 
    updateLandingPageCopySection 
  } = useOfferStore((state) => ({
    initialContext: state.initialContext,
    coreResult: state.coreResult,
    keyAdvantage: state.keyAdvantage,
    topRisk: state.topRisk,
    primaryAssurance: state.primaryAssurance,
    exclusivity: state.exclusivity,
    bonuses: state.bonuses,
    landingPageCopy: state.landingPageCopy,
    updateLandingPageCopySection: state.updateLandingPageCopySection,
  }));

  const [selectedSection, setSelectedSection] = useState<SectionKey>('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionDraft, setSectionDraft] = useState<Record<string, string>>({});
  const [editedCopy, setEditedCopy] = useState<Record<string, string>>({});

  // Extract context for AI
  const aiContext = {
    audience: initialContext.targetAudience,
    result: coreResult,
    advantage: keyAdvantage,
    risk: topRisk,
    assurance: primaryAssurance,
    isLimited: exclusivity.isLimited,
    limitReason: exclusivity.limitReason,
    bonuses: bonuses.map(b => b.name).join(', ')
  };

  // Effect to load draft and edited copy when section changes
  useEffect(() => {
    const currentSectionKey = selectedSection;
    const existingEdits = landingPageCopy[currentSectionKey] || {};
    setEditedCopy(existingEdits); // Load existing user edits
    setSectionDraft({}); // Clear previous draft

    // Generate draft if no edits exist for this section yet
    if (Object.keys(existingEdits).length === 0 && !readOnly) {
      setIsGenerating(true);
      generateDraft(currentSectionKey, aiContext)
        .then(draft => {
          setSectionDraft(draft);
          // Pre-fill editor with draft if no edits exist
          setEditedCopy(draft); 
        })
        .catch(err => console.error("Error generating draft:", err))
        .finally(() => setIsGenerating(false));
    } else {
       // If edits exist, don't auto-generate draft, let user edit existing
       // Or potentially add a button to explicitly request AI regen?
       console.log("Using existing edits for section:", currentSectionKey);
    }

  }, [selectedSection, landingPageCopy, readOnly, /* Include aiContext fields if needed? */ ]);

  const handleEditChange = (field: string, value: string) => {
    if (readOnly) return;
    setEditedCopy(prev => ({ ...prev, [field]: value }));
  };

  // Save edits for the current section to the store
  const handleSaveSection = () => {
    if (readOnly) return;
    updateLandingPageCopySection(selectedSection, editedCopy);
    // Optionally provide feedback to user (e.g., toast notification)
    alert(`${landingPageSections[selectedSection].title} saved!`); 
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Draft Landing Page Copy</h2>
        <p className="text-gray-300 mb-4">
          Select a section, review the AI-generated draft (based on your core offer and enhancers), and edit the copy points.
        </p>
      </div>

      {/* Section Selector - Use basic buttons */}
      <div className="flex flex-wrap gap-2 border-b border-[#444] pb-2 mb-6">
        {Object.keys(landingPageSections).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedSection(key as SectionKey)}
            className={`px-3 py-1 rounded text-sm ${selectedSection === key ? 'bg-[#FFD23F] text-[#1C1C1C]' : 'bg-[#333] text-gray-300 hover:bg-[#444]'}`}
          >
            {landingPageSections[key as SectionKey].title}
          </button>
        ))}
      </div>

      {/* Editor for Selected Section - Use basic textarea */}
      <div className="bg-[#222222] p-6 rounded-lg space-y-6 border border-[#444]">
        <h3 className="text-xl font-semibold text-white mb-4">Editing: {landingPageSections[selectedSection].title}</h3>
        
        {isGenerating && (
          <div className="flex items-center text-gray-400">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating AI draft...
          </div>
        )}

        {!isGenerating && (
          <div className="space-y-4">
            {(landingPageSections[selectedSection]?.fields || []).map(field => (
              <div key={field}>
                <label htmlFor={`${selectedSection}-${field}`} className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                  {field}
                </label>
                {/* Use basic textarea */}
                <textarea
                  id={`${selectedSection}-${field}`}
                  value={editedCopy[field] || ''} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEditChange(field, e.target.value)}
                  disabled={readOnly}
                  placeholder={`Enter copy for ${field}...`}
                  className="w-full min-h-[80px] p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70 resize-y"
                  rows={field === 'headline' || field === 'cta' ? 1 : 4} // Adjust rows based on field
                />
              </div>
            ))}
          </div>
        )}

        {!readOnly && (
           <div className="mt-6 pt-4 border-t border-[#444] flex justify-end">
              {/* Use basic button */}
              <button onClick={handleSaveSection} disabled={isGenerating} className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 text-sm font-medium disabled:opacity-50">
                 Save {landingPageSections[selectedSection].title} Section
              </button>
           </div>
        )}
      </div>

       {readOnly && <p className="text-yellow-500 mt-4 text-center">This view is read-only</p>}
    </div>
  );
} 