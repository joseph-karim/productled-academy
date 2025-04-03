import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

// Placeholder components to be replaced with actual implementations
const RiskReversalBuilder = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Risk Reversal Builder</h2>
    <p className="text-gray-300">This component will help you create effective risk reversals that address user concerns.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const SocialProofInput = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Social Proof Input</h2>
    <p className="text-gray-300">This component will help you add testimonials, case studies, and other social proof elements.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const CtaSectionBuilder = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">CTA Section Builder</h2>
    <p className="text-gray-300">This component will help you create compelling call-to-action elements to drive conversions.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

interface LandingPageBottomProps {
  modelData?: any;
  readOnly?: boolean;
}

export function LandingPageBottom({ modelData, readOnly = false }: LandingPageBottomProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('riskReversal');

  // Calculate completion status for each sub-step
  const riskReversalCompleted = store.riskReversals.length >= 1;
  
  const socialProofCompleted = 
    store.socialProof.testimonials.length > 0 || 
    store.socialProof.caseStudies.length > 0 || 
    store.socialProof.logos.length > 0 || 
    store.socialProof.numbers.length > 0;
  
  const ctaCompleted = store.ctaSection.mainCtaText.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Landing Page Bottom Section</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="riskReversal" activeValue={activeTab} className="relative">
            Risk Reversal
            {riskReversalCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="socialProof" activeValue={activeTab} disabled={!riskReversalCompleted && !readOnly} className="relative">
            Social Proof
            {socialProofCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="cta" activeValue={activeTab} disabled={!socialProofCompleted && !readOnly} className="relative">
            Call to Action
            {ctaCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="riskReversal" activeValue={activeTab} className="mt-0">
          <RiskReversalBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="socialProof" activeValue={activeTab} className="mt-0">
          <SocialProofInput modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="cta" activeValue={activeTab} className="mt-0">
          <CtaSectionBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {riskReversalCompleted && socialProofCompleted && ctaCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to continue</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'riskReversal' && (
            <button
              onClick={() => {
                const tabs = ['riskReversal', 'socialProof', 'cta'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'cta' && (
            <button
              onClick={() => {
                const tabs = ['riskReversal', 'socialProof', 'cta'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'riskReversal' && !riskReversalCompleted) || 
                       (activeTab === 'socialProof' && !socialProofCompleted)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 