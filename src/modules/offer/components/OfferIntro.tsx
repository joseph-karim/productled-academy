import { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { MessageSquare } from 'lucide-react';
import { ContextGatheringForm } from './ContextGatheringForm';
import { ContextChat } from './ContextChat';
import { MultiStepForm } from './MultiStepForm';

export function OfferIntro() {
  const { 
    websiteScraping,
    websiteUrl,
    resetState
  } = useOfferStore();
  const [currentView, setCurrentView] = useState<'contextGathering' | 'contextChat' | 'offerBuilder'>('contextGathering');
  
  useEffect(() => {
    // Decide if a reset is needed, e.g., reset only if starting fresh
    // resetState(); 
  }, []);
  
  useEffect(() => {
    if (websiteScraping.status === 'completed' && currentView === 'contextGathering') {
      setCurrentView('contextChat');
    }
  }, [websiteScraping.status, currentView]);
  
  const handleChatComplete = () => {
    setCurrentView('offerBuilder');
  };
  
  return (
    <div className="space-y-8">
      {currentView === 'contextGathering' && (
        <>
          {!websiteUrl && (
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('contextChat')}
                className="flex items-center px-4 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-2 text-[#FFD23F]" />
                Refine Your Thinking with AI First
              </button>
              <p className="text-gray-400 mt-2 text-sm">
                Skip website analysis and jump straight to AI-assisted offer refinement
              </p>
            </div>
          )}
          <ContextGatheringForm onNext={() => setCurrentView('contextChat')} />
        </>
      )}
      
      {currentView === 'contextChat' && (
        <ContextChat onComplete={handleChatComplete} />
      )}
      
      {currentView === 'offerBuilder' && (
        <MultiStepForm />
      )}
    </div>
  );
}
