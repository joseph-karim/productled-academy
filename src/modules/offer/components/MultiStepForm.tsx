import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';

// Keep imports for the blended flow components
import { DefineCoreOffer } from './DefineCoreOffer';
import { SetupSteps } from './SetupSteps';
import { AddEnhancers } from './AddEnhancers';
import { GenerateRefineContent } from './GenerateRefineContent';
import { FinalReview } from './FinalReview';
import { WebsiteContextInput } from './WebsiteContextInput';

// Remove imports from HEAD branch
// import { DefineCoreOfferNucleusStep } from './steps/DefineCoreOfferNucleusStep';
// import { ReviewOfferCanvasStep } from './steps/ReviewOfferCanvasStep';
// import { AddEnhancersStep } from './steps/AddEnhancersStep';
// import { RefineLandingPageCopyStep } from './steps/RefineLandingPageCopyStep';
// import { FinalReviewStep } from './steps/FinalReviewStep';
// import { AnalyzeHomepageStep } from './steps/AnalyzeHomepageStep';

// Remove other unused imports if any (like the old consolidated components)
// import { CoreOfferDevelopment } from './consolidated/CoreOfferDevelopment';
// import { RiskManagement } from './consolidated/RiskManagement';
// import { LandingPageTop } from './consolidated/LandingPageTop';
// import { LandingPageBottom } from './consolidated/LandingPageBottom';
// import { RefinementFinalization } from './consolidated/RefinementFinalization';

// Context components for sidebar
// import { ContextChat } from './ContextChat';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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

// Keep the step definitions for the blended flow
const steps = [
  {
    title: 'Define Core Offer Nucleus',
    component: DefineCoreOffer,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.coreOfferConfirmed
  },
  {
    title: 'Setup Onboarding Steps',
    component: SetupSteps,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.coreOfferConfirmed,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.onboardingStepsConfirmed
  },
  {
    title: 'Add Offer Enhancers (Optional)',
    component: AddEnhancers,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.onboardingStepsConfirmed,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.enhancersConfirmed
  },
  {
    title: 'Generate & Refine Landing Page Content',
    component: GenerateRefineContent,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.onboardingStepsConfirmed && state.enhancersConfirmed,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.landingPageContentRefined
  },
  {
    title: 'Final Review & Output',
    component: FinalReview,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.landingPageContentRefined,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) =>
      state.finalReviewCompleted
  }
];

// Remove commented out old step definitions
// /* const steps: StepDefinition[] = [ ... ]; */

// Remove unused helper function if only used by old steps
// const getPhaseInfo = (currentPhase: OfferPhase) => { /* ... */ };

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
  const { resetState } = store;
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  // Mount effect
  useEffect(() => {
    if (!routeId && !propAnalysisId) {
      resetState();
    }
  }, []);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(steps.length - 1);
    }
  }, [currentStep]);

  const safeCurrentStep = Math.min(currentStep, steps.length - 1);
  const CurrentStepComponent = steps[safeCurrentStep]?.component;

  if (!CurrentStepComponent) {
     return <div>Loading step...</div>;
  }

  // Load data effect
  useEffect(() => {
    const idToLoad = routeId || propAnalysisId;
    if (!idToLoad) return;
    if (!readOnly) {
      loadOfferData(idToLoad);
    }
    if (routeId && !analysisId) {
      setAnalysisId(routeId);
    }
    if (user) {
      loadModelData();
    }
  }, [routeId, readOnly, propAnalysisId, user]);

  const loadOfferData = async (idToLoad: string) => {
    try {
      console.log(`Loading offer data with ID: ${idToLoad}`);
      const moduleData = await getModuleData('offer');

      if (!moduleData) {
        console.warn("No data found for offer module or ID");
        resetState();
        setOfferNotFound(true);
        return;
      }

      resetState();

      console.log(`Loading offer with ID ${idToLoad} using direct setState.`);
      useOfferStore.setState(moduleData);

    } catch (err) {
      console.error('Error loading offer data:', err);
      resetState();
      setError('Failed to load offer data');
      setOfferNotFound(true);
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
        id: analysisId,
        title: storeState.title,
        websiteUrl: storeState.websiteUrl,
        initialContext: storeState.initialContext,
        coreOfferNucleus: storeState.coreOfferNucleus,
        exclusivity: storeState.exclusivity,
        bonuses: storeState.bonuses,
        coreOfferConfirmed: storeState.coreOfferConfirmed,
        enhancersConfirmed: storeState.enhancersConfirmed,
        landingPageContentRefined: storeState.landingPageContentRefined,
        finalReviewCompleted: storeState.finalReviewCompleted,
        refinedHeroCopy: storeState.refinedHeroCopy,
        refinedProblemCopy: storeState.refinedProblemCopy,
        refinedSolutionCopy: storeState.refinedSolutionCopy,
        refinedRiskReversalCopy: storeState.refinedRiskReversalCopy,
        refinedSocialProofNotes: storeState.refinedSocialProofNotes,
        refinedCtaCopy: storeState.refinedCtaCopy,
      };

      const savedData = await saveModuleData('offer', dataToSave);
      if (savedData && savedData.id) {
        if (!analysisId) {
          setAnalysisId(savedData.id);
          navigate(`/app/offer/${savedData.id}`, { replace: true });
        }
      } else {
         throw new Error("Save operation did not return expected data.");
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
    <div className="min-h-[80vh] flex flex-col max-w-4xl mx-auto">
      <div className="mb-8 space-y-3">
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

      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
          {error}
        </div>
      )}

      <WebsiteContextInput readOnly={readOnly} />

      <div className="flex-grow mb-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => setError(null)}
        >
          <CurrentStepComponent readOnly={readOnly} />
        </ErrorBoundary>
      </div>

      <div className="mt-auto flex justify-between sticky bottom-0 py-4 bg-opacity-90 backdrop-blur-sm">
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
              {isSaving ? <Loader2 className="w-5 h-5 mr-1 animate-spin" /> : <Save className="w-5 h-5 mr-1" />}
              {isSaving ? 'Saving...' : 'Save Progress'}
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
            {safeCurrentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}