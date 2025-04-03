import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

// Placeholder components to be replaced with actual implementations
const CopyRefinement = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Copy Refinement</h2>
    <p className="text-gray-300">This component will help you refine headlines and body copy for maximum impact.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
    
    <div className="mt-6 space-y-4">
      <div className="bg-[#1A1A1A] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-2">Headlines</h3>
        <p className="text-gray-300 text-sm">Refine your headlines to grab attention and communicate value quickly.</p>
      </div>
      
      <div className="bg-[#1A1A1A] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-2">Body Copy</h3>
        <p className="text-gray-300 text-sm">Polish your body copy to flow naturally and persuasively.</p>
      </div>
    </div>
  </div>
);

const AestheticsChecklist = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Aesthetics Checklist</h2>
    <p className="text-gray-300">This component will help you ensure your landing page looks professional and visually appealing.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const FinalChecklistSummary = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Final Checklist & Summary</h2>
    <p className="text-gray-300">This component will provide a final checklist and summary of your complete offer.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

interface RefinementFinalizationProps {
  modelData?: any;
  readOnly?: boolean;
}

export function RefinementFinalization({ modelData, readOnly = false }: RefinementFinalizationProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('copyRefinement');

  // Calculate completion status for each sub-step
  const copyRefinementCompleted = 
    (store.refinedHeadlines.hero.length > 0 || 
     store.refinedHeadlines.problem.length > 0 || 
     store.refinedHeadlines.solution.length > 0) &&
    (store.refinedBodyCopy.hero.length > 0 || 
     store.refinedBodyCopy.problem.length > 0 || 
     store.refinedBodyCopy.solution.length > 0);
  
  const aestheticsCompleted = store.aestheticsChecklistCompleted;
  
  // Final step is always completable
  const finalCompleted = true;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Refinement & Finalization</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="copyRefinement" activeValue={activeTab} className="relative">
            Copy Refinement
            {copyRefinementCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="aesthetics" activeValue={activeTab} disabled={!copyRefinementCompleted && !readOnly} className="relative">
            Aesthetics
            {aestheticsCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="final" activeValue={activeTab} disabled={!aestheticsCompleted && !readOnly} className="relative">
            Final Checklist
            {finalCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="copyRefinement" activeValue={activeTab} className="mt-0">
          <CopyRefinement modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="aesthetics" activeValue={activeTab} className="mt-0">
          <AestheticsChecklist modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="final" activeValue={activeTab} className="mt-0">
          <FinalChecklistSummary modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {copyRefinementCompleted && aestheticsCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to continue</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'copyRefinement' && (
            <button
              onClick={() => {
                const tabs = ['copyRefinement', 'aesthetics', 'final'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'final' && (
            <button
              onClick={() => {
                const tabs = ['copyRefinement', 'aesthetics', 'final'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'copyRefinement' && !copyRefinementCompleted) || 
                       (activeTab === 'aesthetics' && !aestheticsCompleted)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 