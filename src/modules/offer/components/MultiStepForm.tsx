import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useOfferStore, initialState as offerInitialState } from '../store/offerStore';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';

// --- Blended Flow Step Components ---
// Import the actual components now
import { DefineCoreOfferNucleusStep } from './steps/DefineCoreOfferNucleusStep'; 
import { ReviewOfferCanvasStep } from './steps/ReviewOfferCanvasStep'; 
import { AddEnhancersStep } from './steps/AddEnhancersStep'; 
import { RefineLandingPageCopyStep } from './steps/RefineLandingPageCopyStep'; 
import { FinalReviewStep } from './steps/FinalReviewStep'; 

// --- Remove Placeholder Components --- 
// const PlaceholderStep = ...
// const DefineCoreOfferNucleusStep = ...
// const ReviewOfferCanvasStep = ...
// const AddEnhancersStep = ...
// const RefineLandingPageCopyStep = ...
// const FinalReviewStep = ...

// ErrorFallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
};

interface MultiStepFormProps {
  readOnly?: boolean;
  analysisId?: string;
}

type OfferPhase = 'Core Offer' | 'Enhancers' | 'Structure & Finalize';

interface StepDefinition {
  title: string;
  component: React.ComponentType<{ readOnly?: boolean }>;
  phase: OfferPhase;
  isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => boolean;
  isComplete: (state: ReturnType<typeof useOfferStore.getState>) => boolean;
}

// --- NEW Blended Flow Step Definitions (uses actual imports) ---
const steps: StepDefinition[] = [
  { // Step 1: Define Core RARA
    title: 'Define Core Offer',
    component: DefineCoreOfferNucleusStep, // Use actual component
    phase: 'Core Offer',
    isUnlocked: () => true,
    isComplete: (state) =>
      (state.initialContext?.targetAudience?.trim() ?? '').length > 0 && 
      (state.coreResult?.trim() ?? '').length > 0 &&
      (state.keyAdvantage?.trim() ?? '').length > 0 &&
      (state.topRisk?.trim() ?? '').length > 0 &&
      (state.primaryAssurance?.trim() ?? '').length > 0,
  },
  { // Step 2: Review Canvas Checkpoint
    title: 'Review Core Offer',
    component: ReviewOfferCanvasStep, // Use actual component
    phase: 'Core Offer',
    isUnlocked: (state) => steps[0].isComplete(state),
    isComplete: (state) => state.offerCanvasConfirmed === true,
  },
  { // Step 3: Add Enhancers
    title: 'Add Enhancers',
    component: AddEnhancersStep, // Use actual component
    phase: 'Enhancers',
    isUnlocked: (state) => steps[1].isComplete(state),
    isComplete: () => true, // Optional step
  },
  { // Step 4: Refine Landing Page Copy
    title: 'Draft Landing Page',
    component: RefineLandingPageCopyStep, // Use actual component
    phase: 'Structure & Finalize',
    isUnlocked: (state) => steps[2].isComplete(state), 
    isComplete: (state) => {
        // Basic check: ensure at least one section has been started/saved
        return Object.keys(state.landingPageCopy || {}).length > 0;
        // More robust check: Ensure key sections have minimal content
        // const sections = ['hero', 'problem', 'solution']; 
        // return sections.every(key => state.landingPageCopy?.[key] && Object.values(state.landingPageCopy[key]).some(val => (val ?? '').trim().length > 0));
    },
  },
   { // Step 5: Final Review
    title: 'Review Landing Page Copy',
    component: FinalReviewStep, // Use actual component
    phase: 'Structure & Finalize',
    isUnlocked: (state) => steps[3].isComplete(state),
    isComplete: () => true, // Display step
  },
];

// --- OLD Step Flow Definitions (Commented Out) ---
/*
const steps: StepDefinition[] = [
  // ... (Original 14 steps definition) ...
];
*/

// Helper function to get phase details (Keep)
const getPhaseInfo = (currentPhase: OfferPhase) => { /* ... */ };

export function MultiStepForm({ readOnly = false, analysisId: propAnalysisId }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(propAnalysisId || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [offerNotFound, setOfferNotFound] = useState(false);
  
  const store = useOfferStore();
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(steps.length - 1);
    }
  }, [currentStep]);

  const safeCurrentStep = Math.min(currentStep, steps.length - 1);
  const CurrentStepComponent = steps[safeCurrentStep]?.component;

  useEffect(() => {
    const idToLoad = routeId || propAnalysisId;
    
    // Only reset stores if we don't have an ID to load
    if (!idToLoad) {
      store.resetState();
      return;
    }

    // If we have an ID and we're not in read-only mode, load the data
    if (!readOnly) {
      loadOfferData(idToLoad);
    }

    // Update analysisId if we have a routeId but no analysisId
    if (routeId && !analysisId) {
      setAnalysisId(routeId);
    }
    
    // Try to load model data for context
    if (user) {
      loadModelData();
    }
  }, [routeId, readOnly, propAnalysisId, user]);

  const loadOfferData = async (idToLoad: string) => {
    try {
      console.log(`Loading offer data with ID: ${idToLoad}`);
      const moduleData = await getModuleData('offer');
      if (!moduleData) {
        console.warn("No data found for offer module");
        store.resetState();
        return;
      }

      // Reset store before loading new data
      store.resetState();
      
      // Prefer using setState for direct loading if structure matches
      // Assuming moduleData might contain a structure that can be directly applied
      if (idToLoad && moduleData) { 
         // Check if the loaded data has the core fields we expect from the *new* structure
         const hasNewFields = moduleData.coreResult !== undefined || moduleData.landingPageCopy !== undefined;
         if (hasNewFields) {
            console.log(`Loading specific offer with ID ${idToLoad} using direct setState.`);
            // Use setState to load the entire offer object if structure is suitable
            useOfferStore.setState(moduleData);
            return; // Exit early if direct load worked
         } else {
            console.warn(`Loaded data for ${idToLoad} seems to be in old format. Attempting manual mapping...`);
            // Fallback to manual mapping if structure doesn't match directly
         }
      } else {
         console.warn("Offer ID not provided or no data found.");
         store.resetState();
         return;
      }
      
      // --- Fallback Manual Mapping (If direct setState didn't apply) ---
      console.log("Applying manual mapping for potentially old data structure...")
      store.setTitle(moduleData.title || 'Untitled Offer');
      
      // Map initial context and core RARA fields
      if(moduleData.initialContext) store.setInitialContext('targetAudience', moduleData.initialContext.targetAudience || '');
      if(moduleData.coreResult) store.setCoreResult(moduleData.coreResult);
      if(moduleData.keyAdvantage) store.setKeyAdvantage(moduleData.keyAdvantage);
      if(moduleData.topRisk) store.setTopRisk(moduleData.topRisk);
      if(moduleData.primaryAssurance) store.setPrimaryAssurance(moduleData.primaryAssurance);
      if(moduleData.offerCanvasConfirmed) store.setOfferCanvasConfirmed(moduleData.offerCanvasConfirmed);

      // Map enhancers
      if(moduleData.exclusivity) store.setExclusivity(moduleData.exclusivity);
      if (moduleData.bonuses && Array.isArray(moduleData.bonuses)) {
        moduleData.bonuses.forEach((bonus: any) => store.addBonus(bonus));
      }

      // Map landing page copy (if it exists)
      if(moduleData.landingPageCopy && typeof moduleData.landingPageCopy === 'object'){
          Object.keys(moduleData.landingPageCopy).forEach(sectionKey => {
              if(typeof moduleData.landingPageCopy[sectionKey] === 'object') {
                 store.updateLandingPageCopySection(sectionKey, moduleData.landingPageCopy[sectionKey]);
              }
          });
      }
      
      // Map other potentially relevant old fields (optional, for backward compatibility view)
      if (moduleData.userSuccess) store.setUserSuccess(moduleData.userSuccess.statement || '');
      if (moduleData.topResults) store.setTopResults(moduleData.topResults);
      
    } catch (err) {
      console.error('Error loading offer data:', err);
      store.resetState();
      setError('Failed to load offer data');
    }
  };
  
  const loadModelData = async () => {
    try {
      const data = await getModuleData('model');
      if (data) {
        setModelData(data);
      }
    } catch (err) {
      console.error('Error loading model data for context:', err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      setPendingAction('save');
      return;
    }

    if (!store.title) {
      setShowTitlePrompt(true);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const storeState = useOfferStore.getState();
      const dataToSave = {
        title: storeState.title,
        websiteUrl: storeState.websiteUrl,
        initialContext: storeState.initialContext, 
        coreResult: storeState.coreResult,
        keyAdvantage: storeState.keyAdvantage,
        topRisk: storeState.topRisk,
        primaryAssurance: storeState.primaryAssurance,
        offerCanvasConfirmed: storeState.offerCanvasConfirmed,
        exclusivity: storeState.exclusivity,
        bonuses: storeState.bonuses,
        landingPageCopy: storeState.landingPageCopy,
        topResults: storeState.topResults, 
        advantages: storeState.advantages, 
        risks: storeState.risks, 
        assurances: storeState.assurances, 
      };
      const savedData = await saveModuleData('offer', dataToSave);
      if (savedData) {
        setAnalysisId(savedData.id);
        navigate(`/app/offer/${savedData.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving offer:', err);
      setError('Failed to save offer');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction === 'save') {
      handleSave();
    }
    setPendingAction(null);
  };

  const goNext = () => {
    if (safeCurrentStep < steps.length - 1) {
      setCurrentStep(safeCurrentStep + 1);
    }
  };

  const goPrevious = () => {
    if (safeCurrentStep > 0) {
      setCurrentStep(safeCurrentStep - 1);
    }
  };

  if (offerNotFound) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Offer Not Found</h2>
        <p className="text-gray-300 mb-6">
          The offer you're looking for could not be found. Please check the URL or return to the dashboard.
        </p>
        <button onClick={() => navigate('/app/dashboard')} className="px-4 py-2 bg-[#333333] text-white rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="mb-8 space-y-3">
        <h3 className="text-lg font-semibold text-[#FFD23F]">
          Phase: {steps[safeCurrentStep]?.phase || 'Loading...'}
        </h3>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {steps[safeCurrentStep]?.title || 'Loading...'}
          </h2>
          <div className="text-sm text-gray-400">
            Step {safeCurrentStep + 1} of {steps.length}
          </div>
        </div>
        
        <div className="w-full bg-[#333333] rounded-full h-2">
          <div 
            className="bg-[#FFD23F] h-2 rounded-full" 
            style={{ width: `${((safeCurrentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {showTitlePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#222222] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Name Your Offer</h3>
            <p className="text-gray-300 mb-4">
              Give your offer a name to help you identify it later.
            </p>
            <input
              type="text"
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
              placeholder="e.g., SaaS Onboarding Offer"
              className="w-full p-2 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTitlePrompt(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (store.title.trim()) {
                    setShowTitlePrompt(false);
                    handleSave();
                  }
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            if (pendingAction === 'save') {
              handleSave();
            }
            setPendingAction(null);
          }}
        />
      )}

      <div className="flex-grow">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => setError(null)}
        >
          <CurrentStepComponent readOnly={readOnly} />
        </ErrorBoundary>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={goPrevious}
          disabled={safeCurrentStep === 0}
          className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous Step
        </button>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-1" />
                  Save
                </>
              )}
            </button>
          )}
          
          <button
            onClick={goNext}
            disabled={
              safeCurrentStep === steps.length - 1 ||
              !steps[safeCurrentStep]?.isComplete(store)
            }
            className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            Next Step
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}            