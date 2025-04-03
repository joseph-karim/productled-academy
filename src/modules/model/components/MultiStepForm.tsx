import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { ProductDescription } from '@/modules/model/components/ProductDescription';
import { IdealUserIdentifier } from '@/modules/model/components/IdealUserIdentifier';
import { UserEndgame } from '@/modules/model/components/UserEndgame';
import { ChallengeCollector } from '@/modules/model/components/ChallengeCollector';
import { SolutionInput } from '@/modules/model/components/SolutionInput';
import { ModelSelector } from '@/modules/model/components/ModelSelector';
import { FreeModelCanvas } from '@/modules/model/components/FreeModelCanvas';
import { Analysis } from '@/modules/model/components/Analysis';
import { useModelInputsStore, type FormState } from '@/modules/model/store/modelInputsStore';
import { useModelPackagesStore, type PackageState } from '@/modules/model/store/modelPackagesStore';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';
import type { PackageFeature } from '@/modules/model/types/package';

interface MultiStepFormProps {
  readOnly?: boolean;
  analysisId?: string;
}

interface UserOutcome {
  level: string;
  text: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  level: string;
  magnitude: string;
}

interface Solution {
  id: string;
  challengeId: string;
  text: string;
  type: string;
  cost: string;
}

const steps = [
  { 
    title: 'Product Description', 
    component: ProductDescription,
    isUnlocked: (state: FormState) => true,
    isComplete: (state: FormState) => 
      state.productDescription.length >= 10 && !state.processingState.productDescription
  },
  {
    title: 'Ideal User',
    component: IdealUserIdentifier,
    isUnlocked: (state: FormState) => 
      state.productDescription.length >= 10,
    isComplete: (state: FormState) => 
      !!state.idealUser && !state.processingState.idealUser
  },
  { 
    title: 'User Endgame', 
    component: UserEndgame,
    isUnlocked: (state: FormState) => 
      !!state.idealUser,
    isComplete: (state: FormState) => {
      const beginnerOutcome = state.outcomes.find((o: UserOutcome) => o.level === 'beginner');
      const intermediateOutcome = state.outcomes.find((o: UserOutcome) => o.level === 'intermediate');
      return (
        (beginnerOutcome?.text?.length ?? 0) >= 10 &&
        (intermediateOutcome?.text?.length ?? 0) >= 10 &&
        !state.processingState.userEndgame
      );
    }
  },
  { 
    title: 'Challenges', 
    component: ChallengeCollector,
    isUnlocked: (state: FormState) => {
      const beginnerOutcome = state.outcomes.find((o: UserOutcome) => o.level === 'beginner');
      const intermediateOutcome = state.outcomes.find((o: UserOutcome) => o.level === 'intermediate');
      return (
        (beginnerOutcome?.text?.length ?? 0) >= 10 &&
        (intermediateOutcome?.text?.length ?? 0) >= 10
      );
    },
    isComplete: (state: FormState) => 
      state.challenges.length > 0 && !state.processingState.challenges
  },
  { 
    title: 'Solutions', 
    component: SolutionInput,
    isUnlocked: (state: FormState) => 
      state.challenges.length > 0,
    isComplete: (state: FormState) => 
      state.solutions.length > 0 && !state.processingState.solutions
  },
  { 
    title: 'Model Selection', 
    component: ModelSelector,
    isUnlocked: (state: FormState) => 
      state.solutions.length > 0,
    isComplete: (state: FormState) => 
      state.selectedModel !== null && !state.processingState.modelSelection
  },
  { 
    title: 'Free Model Canvas', 
    component: FreeModelCanvas,
    isUnlocked: (state: FormState, packageState: PackageState) => 
      state.selectedModel !== null,
    isComplete: (state: FormState, packageState: PackageState) => {
      const hasFreeTier = packageState.features.some((f: PackageFeature) => f.tier === 'free');
      const hasPaidTier = packageState.features.some((f: PackageFeature) => f.tier === 'paid');
      const strategy = packageState.pricingStrategy;
      
      return (
        hasFreeTier && 
        hasPaidTier && 
        (strategy?.freePackage?.limitations?.length ?? 0) > 0 &&
        (strategy?.freePackage?.conversionGoals?.length ?? 0) > 0 &&
        (strategy?.paidPackage?.valueMetrics?.length ?? 0) > 0 &&
        (strategy?.paidPackage?.targetConversion ?? 0) > 0 &&
        !packageState.processingState.freeModelCanvas
      );
    }
  },
  { 
    title: 'Analysis', 
    component: Analysis,
    isUnlocked: (state: FormState, packageState: PackageState) => {
      const hasFreeTier = packageState.features.some((f: PackageFeature) => f.tier === 'free');
      const hasPaidTier = packageState.features.some((f: PackageFeature) => f.tier === 'paid');
      const strategy = packageState.pricingStrategy;
      
      return (
        hasFreeTier && 
        hasPaidTier && 
        (strategy?.freePackage?.limitations?.length ?? 0) > 0 &&
        (strategy?.freePackage?.conversionGoals?.length ?? 0) > 0 &&
        (strategy?.paidPackage?.valueMetrics?.length ?? 0) > 0 &&
        (strategy?.paidPackage?.targetConversion ?? 0) > 0
      );
    },
    isComplete: () => true
  },
];

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

export function MultiStepForm({ readOnly = false, analysisId: propAnalysisId }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(propAnalysisId || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  const store = useModelInputsStore();
  const packageStore = useModelPackagesStore();
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const CurrentStepComponent = steps[currentStep].component;

  useEffect(() => {
    const idToLoad = routeId || propAnalysisId;
    
    // Only reset stores if we don't have an ID to load
    if (!idToLoad) {
      store.resetState();
      packageStore.reset();
      return;
    }

    // If we have an ID and we're not in read-only mode, load the data
    if (!readOnly) {
      loadAnalysisData(idToLoad);
    }

    // Update analysisId if we have a routeId but no analysisId
    if (routeId && !analysisId) {
      setAnalysisId(routeId);
    }
  }, [routeId, readOnly, propAnalysisId]);

  const loadAnalysisData = async (idToLoad: string) => {
    try {
      const moduleData = await getModuleData('model');
      if (!moduleData) {
        console.warn("No data found for model module for user/ID", idToLoad);
        store.resetState();
        packageStore.reset();
        return;
      }

      // Reset both stores before loading new data
      store.resetState();
      packageStore.reset();

      // Update model inputs store
      store.setTitle(moduleData.title || 'Untitled Analysis');
      store.setProductDescription(moduleData.productDescription || '');
      store.setIdealUser(moduleData.idealUser || undefined);
      moduleData.outcomes?.forEach((outcome: UserOutcome) => {
        store.addOutcome(outcome);
      });
      moduleData.challenges?.forEach((challenge: Challenge) => {
        store.addChallenge({
          id: challenge.id || crypto.randomUUID(),
          title: challenge.title,
          description: challenge.description,
          level: challenge.level,
          magnitude: challenge.magnitude
        });
      });
      moduleData.solutions?.forEach((solution: Solution) => {
        store.addSolution({
          id: solution.id || crypto.randomUUID(),
          challengeId: solution.challengeId,
          text: solution.text,
          type: solution.type || 'general',
          cost: solution.cost || 'medium'
        });
      });
      store.setSelectedModel(moduleData.selectedModel || null);
      store.setUserJourney(moduleData.userJourney || undefined);
      store.setCallToAction(moduleData.callToAction || undefined);
      store.setAnalysis(moduleData.analysis || null);

      // Update package store
      moduleData.features?.forEach((feature: PackageFeature) => {
        packageStore.addFeature(feature);
      });
      if (moduleData.pricingStrategy) {
        packageStore.setPricingStrategy(moduleData.pricingStrategy);
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      store.resetState();
      packageStore.reset();
      setError('Failed to load analysis data');
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
      const dataToSave = {
        title: store.title,
        productDescription: store.productDescription,
        idealUser: store.idealUser,
        outcomes: store.outcomes,
        challenges: store.challenges,
        solutions: store.solutions,
        selectedModel: store.selectedModel,
        userJourney: store.userJourney,
        callToAction: store.callToAction,
        analysis: store.analysis,
        features: packageStore.features,
        pricingStrategy: packageStore.pricingStrategy,
      };

      const savedData = await saveModuleData('model', dataToSave);
      if (savedData) {
        setAnalysisId(savedData.id);
        navigate(`/app/model/${savedData.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (!user) {
      setShowAuthModal(true);
      setPendingAction('share');
      return;
    }
    // Implement share functionality
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction === 'save') {
      handleSave();
    } else if (pendingAction === 'share') {
      handleShare();
    }
    setPendingAction(null);
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  };

  const isStepUnlocked = (index: number) => {
    if (readOnly) {
      return true;
    }
    
    const step = steps[index];
    const state = store;
    const packageState = packageStore;
    return step.isUnlocked(state, packageState);
  };

  const isStepCompleted = (index: number) => {
    const step = steps[index];
    const state = store;
    const packageState = packageStore;
    return step.isComplete(state, packageState);
  };

  return (
    <div className="space-y-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="bg-[#2A2A2A] rounded-lg p-6">
          <CurrentStepComponent />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goPrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-4">
            {!readOnly && currentStep === steps.length - 1 && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-1" />
                      {user ? 'Save Analysis' : 'Sign Up to Save'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-opacity-90"
                >
                  {user ? 'Share Analysis' : 'Sign Up to Share'}
                </button>
              </>
            )}

            {currentStep < steps.length - 1 && (
              <button
                onClick={goNext}
                disabled={!isStepCompleted(currentStep)}
                className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            )}
          </div>
        </div>
      </ErrorBoundary>

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showTitlePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Name Your Analysis</h3>
            <input
              type="text"
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
              className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg mb-4"
              placeholder="Enter a title..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTitlePrompt(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTitlePrompt(false);
                  handleSave();
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}