import React from 'react';
import { useOfferStore } from '../store/offerStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

// Define structure for section copy if not imported from store types
interface SectionCopy {
  headline: string;
  body: string;
}

interface FinalReviewProps {
  modelData?: any;
  readOnly?: boolean; // Although this step is mostly read-only by nature
}

const SectionDisplay = ({ title, content }: { title: string, content: SectionCopy | string }) => {
  return (
    <div className="mb-6 p-4 border border-[#444444] rounded-md bg-[#1C1C1C]">
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {typeof content === 'object' ? (
        <div className="space-y-3">
          {content.headline && (
            <div>
              <p className="text-sm font-medium text-gray-400">Headline:</p>
              <p className="text-gray-100 whitespace-pre-wrap">{content.headline}</p>
            </div>
          )}
          {content.body && (
             <div>
              <p className="text-sm font-medium text-gray-400">Body Copy:</p>
              <p className="text-gray-100 whitespace-pre-wrap">{content.body}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
            <p className="text-sm font-medium text-gray-400">Notes/Angles:</p>
            <p className="text-gray-100 whitespace-pre-wrap">{content || '-'}</p>
        </div>
      )}
    </div>
  );
};

export function FinalReview({ readOnly = false }: FinalReviewProps) {
  const { 
    finalReviewCompleted, 
    setFinalReviewCompleted,
    refinedHeroCopy,
    refinedProblemCopy,
    refinedSolutionCopy,
    refinedRiskReversalCopy,
    refinedSocialProofNotes,
    refinedCtaCopy
  } = useOfferStore();

  const handleFinalize = () => {
    if (!readOnly) { // Prevent finalization in read-only mode if needed
      setFinalReviewCompleted(true);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <CardTitle>Step 4: Final Review & Output</CardTitle>
          <CardDescription className="text-gray-400">
            Review the complete set of landing page copy points you've refined.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionDisplay title="Hero Section" content={refinedHeroCopy} />
          <SectionDisplay title="Problem Section" content={refinedProblemCopy} />
          <SectionDisplay title="Solution Section" content={refinedSolutionCopy} />
          <SectionDisplay title="Risk Reversal" content={refinedRiskReversalCopy} />
          <SectionDisplay title="Social Proof Angles" content={refinedSocialProofNotes} />
          <SectionDisplay title="Final CTA Section" content={refinedCtaCopy} />

          {!finalReviewCompleted && (
            <div className="mt-6">
              <Button 
                onClick={handleFinalize} 
                disabled={readOnly}
                className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
              >
                Finalize Landing Page Inputs
              </Button>
            </div>
          )}
          {finalReviewCompleted && (
            <p className="mt-6 text-green-400 text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Module Complete!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 