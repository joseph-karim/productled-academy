import React, { useState } from 'react';
import { useOfferStore, OfferState } from '../store/offerStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Edit, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Import AI generator and types with corrected path
import { generateSectionDraft, LandingPageSection } from '../services/ai/generators';
import type { CoreOfferNucleus, Exclusivity, Bonus, SectionCopy } from '../services/ai/generators'; // Corrected path

// Define structure for section copy if not imported from store types
// interface SectionCopy { ... }

interface GenerateRefineContentProps {
  modelData?: any;
  readOnly?: boolean;
}

// Simplified Section Editor
const SectionEditor = ({ title, value, onChange, readOnly, confirmed }: 
  { 
    title: string, 
    value: SectionCopy | string,
    onChange: (newValue: SectionCopy | string) => void,
    readOnly?: boolean, 
    confirmed?: boolean 
  }
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<SectionCopy | string>(value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Get necessary state from store for AI context
  const { coreOfferNucleus, exclusivity, bonuses } = useOfferStore(
    (state) => ({ 
      coreOfferNucleus: state.coreOfferNucleus,
      exclusivity: state.exclusivity,
      bonuses: state.bonuses
    })
  );

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  // Map component title to AI function section type
  const getSectionType = (sectionTitle: string): LandingPageSection | null => {
     const mapping: Record<string, LandingPageSection> = {
       "Hero Section": "Hero",
       "Problem Section": "Problem",
       "Solution Section": "Solution",
       "Risk Reversal": "Risk Reversal",
       "Social Proof Angles": "Social Proof",
       "Final CTA Section": "CTA"
     };
     return mapping[sectionTitle] || null;
  };

  const handleGenerateDraft = async () => {
    const sectionType = getSectionType(title);
    if (!sectionType || readOnly) return;

    setIsGenerating(true);
    setGenerateError(null);
    try {
      // Call the AI service
      const aiDraft = await generateSectionDraft(
        sectionType, 
        coreOfferNucleus, 
        exclusivity, 
        bonuses
      );
      
      // If section is Social Proof, AI returns notes in 'body', handle appropriately
      if (sectionType === 'Social Proof') {
         onChange(aiDraft.body); // Update store with the notes string
      } else {
         onChange(aiDraft); // Update store with the SectionCopy object
      }
      setIsEditing(true); // Enter editing mode with the new draft
    } catch (error) {
      console.error(`Error generating draft for ${title}:`, error);
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onChange(draft); // Call the onChange prop to update the store state
    setIsEditing(false);
  };

  const handleEdit = () => {
    setDraft(value); // Start editing from the current prop value
    setIsEditing(true);
  };

  const handleDraftChange = (field: keyof SectionCopy, newValue: string) => {
    if (typeof draft === 'object') {
      setDraft({ ...draft, [field]: newValue });
    }
  };
  
  const handleNotesChange = (newValue: string) => {
     if (typeof draft === 'string') {
       setDraft(newValue);
     }
  };

  const isSectionComplete = typeof value === 'string' 
      ? value.trim() !== '' 
      : (value as SectionCopy).headline.trim() !== '' || (value as SectionCopy).body.trim() !== '';
  
  // Generate a unique key/id suffix based on the title
  const sectionIdSuffix = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <Card className="mb-4 bg-[#1C1C1C] border-[#333333] text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center text-gray-200">
             {isSectionComplete && !isEditing && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
             {title}
          </CardTitle>
          {!isEditing && <CardDescription className="text-gray-400">{isSectionComplete ? 'Content saved.' : 'Generate or edit content.'}</CardDescription>}
        </div>
        {!isEditing && !confirmed && (
          <div className="flex space-x-2">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleGenerateDraft} 
               disabled={readOnly || isGenerating}
               className="border-[#444444] text-gray-300 hover:bg-[#333333]"
             >
               {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : null}
               {isGenerating ? 'Generating...' : 'Generate Draft'}
             </Button>
             <Button 
               variant="secondary" 
               size="sm" 
               onClick={handleEdit} 
               disabled={readOnly || isGenerating}
               className="bg-[#333333] text-gray-300 hover:bg-[#444444]"
             >
               <Edit className="w-4 h-4 mr-1" /> Edit Manually
             </Button>
           </div>
        )}
      </CardHeader>
      {generateError && (
         <CardContent className="pt-0 pb-4">
            <p className="text-sm text-red-500">Error: {generateError}</p>
         </CardContent>
      )}
      {isEditing && (
        <CardContent className="space-y-4">
          {typeof draft === 'object' ? (
            <>
              <div>
                <Label htmlFor={`${sectionIdSuffix}-headline`} className="text-gray-300">Headline</Label>
                <Textarea
                  id={`${sectionIdSuffix}-headline`}
                  value={draft.headline}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDraftChange('headline', e.target.value)}
                  placeholder={`Enter headline for ${title}`}
                  disabled={readOnly}
                  rows={2}
                  className="mt-1 bg-[#2A2A2A] border-[#444444] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor={`${sectionIdSuffix}-body`} className="text-gray-300">Body Copy</Label>
                <Textarea
                  id={`${sectionIdSuffix}-body`}
                  value={draft.body}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDraftChange('body', e.target.value)}
                  placeholder={`Enter body copy for ${title}`}
                  disabled={readOnly}
                  rows={5}
                  className="mt-1 bg-[#2A2A2A] border-[#444444] text-white placeholder:text-gray-500"
                />
              </div>
            </>
          ) : (
            <div>
               <Label htmlFor={`${sectionIdSuffix}-notes`} className="text-gray-300">Notes / Angles</Label>
               <Textarea
                 id={`${sectionIdSuffix}-notes`}
                 value={draft}
                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(e.target.value)}
                 placeholder={`Enter notes/angles for ${title}`}
                 disabled={readOnly}
                 rows={4}
                 className="mt-1 bg-[#2A2A2A] border-[#444444] text-white placeholder:text-gray-500"
               />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={readOnly}
              className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
            >Save {title}</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export function GenerateRefineContent({ readOnly = false }: GenerateRefineContentProps) {
  const {
    landingPageContentRefined,
    setLandingPageContentRefined,
    refinedHeroCopy,
    setRefinedHeroCopy,
    refinedProblemCopy,
    setRefinedProblemCopy,
    refinedSolutionCopy,
    setRefinedSolutionCopy,
    refinedRiskReversalCopy,
    setRefinedRiskReversalCopy,
    refinedSocialProofNotes,
    setRefinedSocialProofNotes,
    refinedCtaCopy,
    setRefinedCtaCopy
  } = useOfferStore();

  // Basic check if all sections have at least some content (can be refined)
  const allSectionsHaveContent = 
    (refinedHeroCopy.headline || refinedHeroCopy.body) &&
    (refinedProblemCopy.headline || refinedProblemCopy.body) &&
    (refinedSolutionCopy.headline || refinedSolutionCopy.body) &&
    (refinedRiskReversalCopy.headline || refinedRiskReversalCopy.body) &&
    refinedSocialProofNotes &&
    (refinedCtaCopy.headline || refinedCtaCopy.body);

  const handleConfirm = () => {
    if (!readOnly) {
      setLandingPageContentRefined(true);
    }
  };

  // Wrapper functions for type safety
  const handleHeroChange = (copy: SectionCopy | string) => {
    if (typeof copy === 'object') setRefinedHeroCopy(copy);
  };
  const handleProblemChange = (copy: SectionCopy | string) => {
    if (typeof copy === 'object') setRefinedProblemCopy(copy);
  };
  const handleSolutionChange = (copy: SectionCopy | string) => {
    if (typeof copy === 'object') setRefinedSolutionCopy(copy);
  };
  const handleRiskReversalChange = (copy: SectionCopy | string) => {
    if (typeof copy === 'object') setRefinedRiskReversalCopy(copy);
  };
  const handleSocialProofChange = (notes: SectionCopy | string) => {
    if (typeof notes === 'string') setRefinedSocialProofNotes(notes);
  };
  const handleCtaChange = (copy: SectionCopy | string) => {
    if (typeof copy === 'object') setRefinedCtaCopy(copy);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <CardTitle>Step 3: Generate & Refine Landing Page Content</CardTitle>
          <CardDescription className="text-gray-400">
            Use AI to generate draft copy points for each section based on your core offer and enhancers.
            Review and edit the drafts to match your voice and add specifics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionEditor 
             title="Hero Section" 
             value={refinedHeroCopy} 
             onChange={handleHeroChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />
          <SectionEditor 
             title="Problem Section" 
             value={refinedProblemCopy} 
             onChange={handleProblemChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />
          <SectionEditor 
             title="Solution Section" 
             value={refinedSolutionCopy} 
             onChange={handleSolutionChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />
          <SectionEditor 
             title="Risk Reversal" 
             value={refinedRiskReversalCopy} 
             onChange={handleRiskReversalChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />
          <SectionEditor 
             title="Social Proof Angles" 
             value={refinedSocialProofNotes} 
             onChange={handleSocialProofChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />
          <SectionEditor 
             title="Final CTA Section" 
             value={refinedCtaCopy} 
             onChange={handleCtaChange} 
             readOnly={readOnly} 
             confirmed={landingPageContentRefined} 
          />

          {!landingPageContentRefined && (
            <div className="mt-6">
              <Button 
                onClick={handleConfirm} 
                disabled={readOnly || !allSectionsHaveContent} 
                title={!allSectionsHaveContent ? "Please add content to all sections before confirming." : ""}
                className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90 disabled:opacity-50"
              >
                Confirm Landing Page Content & Proceed to Final Review
              </Button>
            </div>
          )}
          {landingPageContentRefined && (
            <p className="mt-6 text-green-400 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Landing Page Content Refined. You can proceed to the next step.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 