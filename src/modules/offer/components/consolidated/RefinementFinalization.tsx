import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { HeadlineRefinementTool } from '../HeadlineRefinementTool';
import { BodyCopyImprovement } from '../BodyCopyImprovement';
import { AestheticsChecklist } from '../AestheticsChecklist';
import { AnalysisActionPlan } from '../AnalysisActionPlan';

interface RefinementFinalizationProps {
  modelData?: any;
  readOnly?: boolean;
}

export function RefinementFinalization({ modelData, readOnly = false }: RefinementFinalizationProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('headlines');

  // Calculate completion status for each sub-step
  const headlinesCompleted = 
    (store.refinedHeadlines.hero.length > 0 || 
     store.refinedHeadlines.problem.length > 0 || 
     store.refinedHeadlines.solution.length > 0);
  
  const bodyCopyCompleted = 
    (store.refinedBodyCopy.hero.length > 0 || 
     store.refinedBodyCopy.problem.length > 0 || 
     store.refinedBodyCopy.solution.length > 0);
  
  const aestheticsCompleted = store.aestheticsChecklistCompleted;
  
  const analysisCompleted = store.offerScorecard !== null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Refinement & Finalization</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="headlines" className="relative">
            Headline Refinement
            {headlinesCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="bodyCopy" disabled={!headlinesCompleted && !readOnly} className="relative">
            Body Copy Improvement
            {bodyCopyCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="aesthetics" disabled={!bodyCopyCompleted && !readOnly} className="relative">
            Aesthetics Checklist
            {aestheticsCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!aestheticsCompleted && !readOnly} className="relative">
            Analysis & Next Steps
            {analysisCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="headlines" className="mt-0">
          <HeadlineRefinementTool modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="bodyCopy" className="mt-0">
          <BodyCopyImprovement modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="aesthetics" className="mt-0">
          <AestheticsChecklist modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-0">
          <AnalysisActionPlan modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {headlinesCompleted && bodyCopyCompleted && aestheticsCompleted && analysisCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to finish your offer</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'headlines' && (
            <button
              onClick={() => {
                const tabs = ['headlines', 'bodyCopy', 'aesthetics', 'analysis'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'analysis' && (
            <button
              onClick={() => {
                const tabs = ['headlines', 'bodyCopy', 'aesthetics', 'analysis'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'headlines' && !headlinesCompleted) || 
                       (activeTab === 'bodyCopy' && !bodyCopyCompleted) ||
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