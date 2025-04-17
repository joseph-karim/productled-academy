import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { CtaSectionBuilder } from '../CtaSectionBuilder';
import { RiskReversalBuilder } from '../RiskReversalBuilder'; // Import the actual component
import { GenerateLandingPageButton } from '../GenerateLandingPageButton';

interface LandingPageBottomProps {
  modelData?: any;
  readOnly?: boolean;
}

export function LandingPageBottom({ modelData, readOnly = false }: LandingPageBottomProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('riskReversal');

  // Calculate completion status for each sub-step
  const riskReversalCompleted = store.riskReversals.length >= 1;
  const ctaCompleted = store.ctaSection.mainCtaText.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Landing Page Bottom Section</h2>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="riskReversal" className="relative">
            Risk Reversal
            {riskReversalCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="cta" disabled={!riskReversalCompleted && !readOnly} className="relative">
            Call to Action
            {ctaCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="riskReversal" className="mt-0">
          <RiskReversalBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="cta" className="mt-0">
          <CtaSectionBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>

      <div className="space-y-4 mt-8">
        <div className="flex justify-between">
          <div className="text-sm text-gray-400">
            {riskReversalCompleted && ctaCompleted ? (
              <span className="text-green-500">All sections complete!</span>
            ) : (
              <span>Complete all sections to continue</span>
            )}
          </div>

          <div className="flex space-x-2">
            {activeTab !== 'riskReversal' && (
              <button
                onClick={() => setActiveTab('riskReversal')}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
              >
                Previous
              </button>
            )}

            {activeTab !== 'cta' && (
              <button
                onClick={() => setActiveTab('cta')}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
                disabled={!riskReversalCompleted && !readOnly}
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Single generate button for all sections */}
        <GenerateLandingPageButton readOnly={readOnly} />
      </div>
    </div>
  );
}