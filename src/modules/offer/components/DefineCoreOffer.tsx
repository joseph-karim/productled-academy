import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Sparkles, MessageSquare } from 'lucide-react';
import { ContextChatInline } from './ContextChatInline';

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
  const [showChat, setShowChat] = useState(false);

  // Get website findings from the store
  const websiteUrl = useOfferStore((state) => state.websiteUrl);
  const scrapingStatus = useOfferStore((state) => state.websiteScraping.status);
  const websiteFindings = useOfferStore((state) => {
    if (state.websiteScraping.status === 'completed') {
      return {
        coreOffer: state.websiteScraping.coreOffer || '',
        targetAudience: state.websiteScraping.targetAudience || '',
        problemSolved: state.websiteScraping.keyProblem || '',
        valueProposition: state.websiteScraping.valueProposition || '',
        keyBenefits: Array.isArray(state.websiteScraping.keyFeatures) ? state.websiteScraping.keyFeatures : [],
        keyPhrases: Array.isArray(state.websiteScraping.keyPhrases) ? state.websiteScraping.keyPhrases : [],
        missingInfo: []
      };
    }
    return {
      coreOffer: '',
      targetAudience: '',
      problemSolved: '',
      valueProposition: '',
      keyBenefits: [],
      keyPhrases: [],
      missingInfo: ['No website analysis available']
    };
  });

  // Listen for the launch-ai-chat event
  React.useEffect(() => {
    const handleLaunchChat = (event: Event) => {
      console.log('Received launch-ai-chat event', event);

      // Check if the event has detail data
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        console.log('Event detail:', customEvent.detail);
        // You can use the data from the event if needed
        // For example, update local state or fetch additional data
      }

      setShowChat(true);
    };

    window.addEventListener('launch-ai-chat', handleLaunchChat);

    return () => {
      window.removeEventListener('launch-ai-chat', handleLaunchChat);
    };
  }, []);

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
      setShowCanvas(true); // Keep canvas visible after confirmation
    }
  };

  return (
    <div className="space-y-8">
      {/* Chat Button - Always visible when chat is not shown */}
      {!showChat && !readOnly && (
        <div className="mb-6">
          <Button
            onClick={() => setShowChat(true)}
            className="w-full py-3 bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90 flex items-center justify-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span className="text-lg">Get AI Help with Your Offer</span>
          </Button>
        </div>
      )}

      {/* AI Chat Assistant */}
      {showChat && !readOnly && (
        <div className="mb-6 bg-[#222222] p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-white">AI Offer Assistant</h3>
            <Button
              onClick={() => setShowChat(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
          <ContextChatInline
            websiteUrl={websiteUrl}
            initialContext={useOfferStore.getState().initialContext}
            websiteScrapingStatus={scrapingStatus}
            websiteFindings={websiteFindings}
          />
        </div>
      )}

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
            <Input
              id="targetAudience"
              value={coreOfferNucleus.targetAudience}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Who do you specifically help?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <Label htmlFor="desiredResult" className="text-gray-300">Desired Result (#1 Result)</Label>
            <Input
              id="desiredResult"
              value={coreOfferNucleus.desiredResult}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('desiredResult', e.target.value)}
              placeholder="What's the #1 Result they achieve? (Inc. 'Aha moment')"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
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
            <Input
              id="biggestBarrier"
              value={coreOfferNucleus.biggestBarrier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('biggestBarrier', e.target.value)}
              placeholder="What's the #1 Risk/Objection?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
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
            <Button
              onClick={() => setShowCanvas(true)}
              disabled={!allFieldsFilled || readOnly}
              className="mt-4 bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
            >
              Review Core Offer Canvas
            </Button>
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
            <CardDescription className="text-gray-400">Confirm these foundational components are aligned and compelling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <p className="font-semibold text-gray-400">Top Risk & Assurance:</p>
              <p className="text-gray-100"><strong>Risk:</strong> {coreOfferNucleus.biggestBarrier || '-'}</p>
              <p className="text-gray-100"><strong>Assurance:</strong> {coreOfferNucleus.assurance || '-'}</p>
            </div>

            {!coreOfferConfirmed && (
              <Button
                onClick={handleConfirm}
                disabled={!allFieldsFilled || readOnly}
                className="mt-4 bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
              >
                Confirm Core Offer & Add Enhancers
              </Button>
            )}
            {coreOfferConfirmed && (
               <p className="text-green-400 text-sm font-medium flex items-center">
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