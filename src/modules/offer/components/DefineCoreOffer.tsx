import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';
import { OfferInsights } from './OfferInsights';

interface DefineCoreOfferProps {
  modelData?: any;
  readOnly?: boolean;
}

export function DefineCoreOffer({ readOnly = false }: DefineCoreOfferProps) {
  const {
    coreOfferNucleus,
    setCoreOfferNucleus,
    coreOfferConfirmed,
    setCoreOfferConfirmed
  } = useOfferStore();

  const [showCanvas, setShowCanvas] = useState(false);

  // Get data from the store
  const websiteUrl = useOfferStore((state) => state.websiteUrl);
  const scrapingStatus = useOfferStore((state) => state.websiteScraping.status);

  const handleInputChange = (field: keyof typeof coreOfferNucleus, value: string) => {
    if (readOnly) return;
    setCoreOfferNucleus({ ...coreOfferNucleus, [field]: value });
  };

  const allFieldsFilled =
    coreOfferNucleus.targetAudience.trim() !== '' &&
    coreOfferNucleus.desiredResult.trim() !== '' &&
    coreOfferNucleus.keyAdvantage.trim() !== '' &&
    coreOfferNucleus.biggestBarrier.trim() !== '' &&
    coreOfferNucleus.assurance.trim() !== '';

  const handleConfirm = () => {
    if (!readOnly) {
      setCoreOfferConfirmed(true);
      // No need to force showing the canvas
    }
  };

  return (
    <div className="space-y-8">
      {/* Chat is now in the left column */}

      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Step 1: Define Your Core Offer Nucleus (R-A-R-A)</CardTitle>
              <CardDescription className="text-gray-400">Capture the essential components of your offer.</CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="targetAudience" className="text-gray-300">Target Audience</Label>
            <Textarea
              id="targetAudience"
              value={coreOfferNucleus.targetAudience}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Who do you specifically help?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="desiredResult" className="text-gray-300">Desired Result (#1 Result)</Label>
            <Textarea
              id="desiredResult"
              value={coreOfferNucleus.desiredResult}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('desiredResult', e.target.value)}
              placeholder="What's the #1 Result they achieve? (Inc. 'Aha moment')"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="keyAdvantage" className="text-gray-300">Key Advantage (Unique Way)</Label>
            <Textarea
              id="keyAdvantage"
              value={coreOfferNucleus.keyAdvantage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('keyAdvantage', e.target.value)}
              placeholder="What's your single most compelling Advantage?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="biggestBarrier" className="text-gray-300">Biggest Barrier (#1 Risk/Objection)</Label>
            <Textarea
              id="biggestBarrier"
              value={coreOfferNucleus.biggestBarrier}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('biggestBarrier', e.target.value)}
              placeholder="What's the #1 Risk/Objection?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="assurance" className="text-gray-300">Primary Assurance / Risk Reversal</Label>
            <Textarea
              id="assurance"
              value={coreOfferNucleus.assurance}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('assurance', e.target.value)}
              placeholder="What's your primary Assurance/Risk Reversal for the barrier?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
              rows={3}
            />
          </div>

          {!coreOfferConfirmed && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={handleConfirm}
                disabled={!allFieldsFilled || readOnly}
                className="flex-1 bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
              >
                Confirm Core Offer & Continue
              </Button>
              <Button
                onClick={() => setShowCanvas(true)}
                disabled={!allFieldsFilled || readOnly}
                variant="outline"
                className="flex-1 border-[#444] text-gray-300 hover:bg-[#333]"
              >
                Review Canvas (Optional)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(showCanvas || coreOfferConfirmed) && (
        <Card className={`border-2 ${coreOfferConfirmed ? 'border-green-500' : 'border-yellow-500'} bg-[#2A2A2A] text-white`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {coreOfferConfirmed && <CheckCircle className="w-5 h-5 mr-2 text-green-500" />}
              Core Offer Canvas Review
            </CardTitle>
            <CardDescription className="text-gray-400">Review your offer components and see insights if website analysis was performed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Current offer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Your Current Offer</h3>
                <div>
                  <p className="font-semibold text-gray-400">Target Audience:</p>
                  <p className="text-gray-100">{coreOfferNucleus.targetAudience || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Core Result:</p>
                  <p className="text-gray-100">{coreOfferNucleus.desiredResult || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Key Advantage:</p>
                  <p className="text-gray-100">{coreOfferNucleus.keyAdvantage || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Top Risk:</p>
                  <p className="text-gray-100">{coreOfferNucleus.biggestBarrier || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Assurance:</p>
                  <p className="text-gray-100">{coreOfferNucleus.assurance || '-'}</p>
                </div>
              </div>

              {/* Right column: Insights from website analysis */}
              <div className="space-y-4">
                {websiteFindings && websiteFindings.coreOffer ? (
                  <>
                    <h3 className="text-lg font-semibold text-white">Offer Insights</h3>
                    <OfferInsights
                      currentOffer={coreOfferNucleus}
                      websiteOffer={{
                        targetAudience: websiteFindings.targetAudience || '',
                        desiredResult: websiteFindings.valueProposition || '',
                        keyAdvantage: websiteFindings.keyBenefits?.length > 0 ? websiteFindings.keyBenefits[0] : '',
                        biggestBarrier: websiteFindings.problemSolved || '',
                        assurance: ''
                      }}
                    />
                  </>
                ) : (
                  <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#333] h-full flex items-center justify-center">
                    <p className="text-gray-400 text-center">
                      {scrapingStatus === 'processing' ? (
                        <>Analyzing website... This will provide insights on your offer.</>
                      ) : (
                        <>No website analysis available. Add a website URL to get insights on your offer.</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!coreOfferConfirmed && (
              <Button
                onClick={handleConfirm}
                disabled={!allFieldsFilled || readOnly}
                className="mt-6 bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90 w-full"
              >
                Confirm Core Offer & Continue
              </Button>
            )}
            {coreOfferConfirmed && (
               <p className="text-green-400 text-sm font-medium flex items-center mt-6">
                 <CheckCircle className="w-4 h-4 mr-1" /> Core Offer Confirmed. You can proceed to the next step.
               </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat components moved to the top of the page */}
    </div>
  );
}