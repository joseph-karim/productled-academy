import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '../../../components/shared/Input';
import { Label } from '../../../components/shared/Label';
import { Textarea } from '../../../components/shared/Textarea';
import { Button } from '../../../components/shared/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/shared/Card';
import { CheckCircle } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Define Your Core Offer Nucleus (R-A-R-A)</CardTitle>
          <CardDescription>Capture the essential components of your offer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              value={coreOfferNucleus.targetAudience}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Who do you specifically help?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="desiredResult">Desired Result (#1 Result)</Label>
            <Input
              id="desiredResult"
              value={coreOfferNucleus.desiredResult}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('desiredResult', e.target.value)}
              placeholder="What's the #1 Result they achieve? (Inc. 'Aha moment')"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="keyAdvantage">Key Advantage (Unique Way)</Label>
            <Textarea
              id="keyAdvantage"
              value={coreOfferNucleus.keyAdvantage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('keyAdvantage', e.target.value)}
              placeholder="What's your single most compelling Advantage?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="biggestBarrier">Biggest Barrier (#1 Risk/Objection)</Label>
            <Input
              id="biggestBarrier"
              value={coreOfferNucleus.biggestBarrier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('biggestBarrier', e.target.value)}
              placeholder="What's the #1 Risk/Objection?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="assurance">Primary Assurance / Risk Reversal</Label>
            <Textarea
              id="assurance"
              value={coreOfferNucleus.assurance}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('assurance', e.target.value)}
              placeholder="What's your primary Assurance/Risk Reversal for the barrier?"
              disabled={readOnly || coreOfferConfirmed}
              className="mt-1"
              rows={3}
            />
          </div>

          {!coreOfferConfirmed && (
            <Button 
              onClick={() => setShowCanvas(true)} 
              disabled={!allFieldsFilled || readOnly}
              className="mt-4"
            >
              Review Core Offer Canvas
            </Button>
          )}
        </CardContent>
      </Card>

      {(showCanvas || coreOfferConfirmed) && (
        <Card className={`border-2 ${coreOfferConfirmed ? 'border-green-500' : 'border-yellow-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {coreOfferConfirmed && <CheckCircle className="w-5 h-5 mr-2 text-green-500" />}
              Core Offer Canvas Review
            </CardTitle>
            <CardDescription>Confirm these foundational components are aligned and compelling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-gray-400">Target Audience:</p>
              <p>{coreOfferNucleus.targetAudience || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Core Result:</p>
              <p>{coreOfferNucleus.desiredResult || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Key Advantage:</p>
              <p>{coreOfferNucleus.keyAdvantage || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Top Risk & Assurance:</p>
              <p><strong>Risk:</strong> {coreOfferNucleus.biggestBarrier || '-'}</p>
              <p><strong>Assurance:</strong> {coreOfferNucleus.assurance || '-'}</p>
            </div>

            {!coreOfferConfirmed && (
              <Button 
                onClick={handleConfirm} 
                disabled={!allFieldsFilled || readOnly}
                className="mt-4"
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
    </div>
  );
} 