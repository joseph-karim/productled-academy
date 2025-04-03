import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

// Placeholder components to be replaced with actual implementations
const IdentifyRisks = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Identify Risks</h2>
    <p className="text-gray-300">This component is under development and will allow users to identify potential risks and objections.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const DefineAssurances = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Define Assurances</h2>
    <p className="text-gray-300">This component is under development and will allow users to define assurances that address each risk.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const OfferCanvasDisplay = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Offer Canvas</h2>
    <p className="text-gray-300">This component will provide a visual canvas of your complete offer, showing how all elements work together.</p>
    {modelData && <p className="text-blue-400 mt-2">Canvas will use data from your model analysis</p>}
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

interface RiskManagementProps {
  modelData?: any;
  readOnly?: boolean;
}

export function RiskManagement({ modelData, readOnly = false }: RiskManagementProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('risks');

  // Calculate completion status for each sub-step
  const risksCompleted = store.risks.length >= 1;
  const assurancesCompleted = store.assurances.length >= 1;
  // Canvas is always completable as it's a display
  const canvasCompleted = risksCompleted && assurancesCompleted;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Risk Management & Offer Canvas</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="risks" activeValue={activeTab} className="relative">
            Identify Risks
            {risksCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="assurances" activeValue={activeTab} disabled={!risksCompleted && !readOnly} className="relative">
            Define Assurances
            {assurancesCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="canvas" activeValue={activeTab} disabled={!assurancesCompleted && !readOnly} className="relative">
            Offer Canvas
            {canvasCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" activeValue={activeTab} className="mt-0">
          <IdentifyRisks modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="assurances" activeValue={activeTab} className="mt-0">
          <DefineAssurances modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="canvas" activeValue={activeTab} className="mt-0">
          <OfferCanvasDisplay modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {risksCompleted && assurancesCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to continue</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'risks' && (
            <button
              onClick={() => {
                const tabs = ['risks', 'assurances', 'canvas'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'canvas' && (
            <button
              onClick={() => {
                const tabs = ['risks', 'assurances', 'canvas'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'risks' && !risksCompleted) || 
                       (activeTab === 'assurances' && !assurancesCompleted)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 