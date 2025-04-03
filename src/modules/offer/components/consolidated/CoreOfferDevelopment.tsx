import React, { useState } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { OfferIntro } from '../OfferIntro';
import { DefineUserSuccess } from '../DefineUserSuccess';
import { DefineTopResults } from '../DefineTopResults';
import { DefineAdvantages } from '../DefineAdvantages';
import { CheckCircle2 } from 'lucide-react';

interface CoreOfferDevelopmentProps {
  modelData?: any;
  readOnly?: boolean;
}

export function CoreOfferDevelopment({ modelData, readOnly = false }: CoreOfferDevelopmentProps) {
  const store = useOfferStore();
  const [activeTab, setActiveTab] = useState('intro');

  // Calculate completion status for each sub-step
  const introCompleted = store.offerRating !== null;
  const userSuccessCompleted = store.userSuccess.statement.length >= 10;
  const topResultsCompleted = 
    store.topResults.tangible.length > 0 && 
    store.topResults.intangible.length > 0 && 
    store.topResults.improvement.length > 0;
  const advantagesCompleted = store.advantages.length >= 1;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Core Offer Development</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="intro" activeValue={activeTab} className="relative">
            Introduction
            {introCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="success" activeValue={activeTab} disabled={!introCompleted && !readOnly} className="relative">
            User Success
            {userSuccessCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="results" activeValue={activeTab} disabled={!userSuccessCompleted && !readOnly} className="relative">
            Top Results
            {topResultsCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="advantages" activeValue={activeTab} disabled={!topResultsCompleted && !readOnly} className="relative">
            Advantages
            {advantagesCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="intro" activeValue={activeTab} className="mt-0">
          <OfferIntro />
        </TabsContent>
        
        <TabsContent value="success" activeValue={activeTab} className="mt-0">
          <DefineUserSuccess modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="results" activeValue={activeTab} className="mt-0">
          <DefineTopResults modelData={modelData} readOnly={readOnly} />
        </TabsContent>
        
        <TabsContent value="advantages" activeValue={activeTab} className="mt-0">
          <DefineAdvantages modelData={modelData} readOnly={readOnly} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-400">
          {introCompleted && userSuccessCompleted && topResultsCompleted && advantagesCompleted ? (
            <span className="text-green-500">All sections complete!</span>
          ) : (
            <span>Complete all sections to continue</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {activeTab !== 'intro' && (
            <button
              onClick={() => {
                const tabs = ['intro', 'success', 'results', 'advantages'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'advantages' && (
            <button
              onClick={() => {
                const tabs = ['intro', 'success', 'results', 'advantages'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              disabled={(activeTab === 'intro' && !introCompleted) || 
                       (activeTab === 'success' && !userSuccessCompleted) || 
                       (activeTab === 'results' && !topResultsCompleted)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 