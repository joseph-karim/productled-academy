import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

// Placeholder components to be replaced with actual implementations
const HeroSectionBuilder = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Hero Section Builder</h2>
    <p className="text-gray-300">This component will help you create a compelling hero section with headlines, subheadlines, and CTAs.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const ProblemSectionBuilder = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Problem Section Builder</h2>
    <p className="text-gray-300">This component will help you articulate the problem your product solves in a way that resonates with users.</p>
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

const SolutionSectionBuilder = ({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">Solution Section Builder</h2>
    <p className="text-gray-300">This component will help you showcase your solution and its unique advantages.</p>
    {modelData && <p className="text-blue-400 mt-2">This section will use advantages defined earlier</p>}
    {readOnly && <p className="text-yellow-500 mt-2">This view is read-only</p>}
  </div>
);

interface LandingPageTopProps {
  modelData?: any;
  readOnly?: boolean;
}

export function LandingPageTop({ modelData, readOnly = false }: LandingPageTopProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('hero');

  // Calculate completion status for each sub-step
  const heroCompleted = 
    store.heroSection.tagline.length > 0 && 
    store.heroSection.subCopy.length > 0 && 
    store.heroSection.ctaText.length > 0;
  
  const problemCompleted = 
    store.problemSection.alternativesProblems.length > 0 && 
    store.problemSection.underlyingProblem.length > 0;
  
  const solutionCompleted = store.solutionSection.steps.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Landing Page Top Section</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="hero" activeValue={activeTab} className="relative">
            Hero Section
            {heroCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="problem" activeValue={activeTab} disabled={!heroCompleted && !readOnly} className="relative">
            Problem Section
            {problemCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="solution" activeValue={activeTab} disabled={!problemCompleted && !readOnly} className="relative">
            Solution Section
            {solutionCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hero" activeValue={activeTab} className="mt-0">
          <HeroSectionBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="problem" activeValue={activeTab} className="mt-0">
          <ProblemSectionBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="solution" activeValue={activeTab} className="mt-0">
          <SolutionSectionBuilder modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {heroCompleted && problemCompleted && solutionCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to continue</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'hero' && (
            <button
              onClick={() => {
                const tabs = ['hero', 'problem', 'solution'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'solution' && (
            <button
              onClick={() => {
                const tabs = ['hero', 'problem', 'solution'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'hero' && !heroCompleted) || 
                       (activeTab === 'problem' && !problemCompleted)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 