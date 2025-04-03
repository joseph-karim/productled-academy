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
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';
import type { PackageFeature } from '@/modules/model/types/package';

interface MultiStepFormProps {
  readOnly?: boolean;
}

interface UserOutcome {
  level: string;
  text: string;
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

export function MultiStepForm({ readOnly = false }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  const store = useModelInputsStore();
  const packageStore = useModelPackagesStore();
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const CurrentStepComponent = steps[currentStep].component;

  useEffect(() => {
    const idToLoad = routeId || analysisId;
    if (idToLoad && !readOnly) {
      loadAnalysisData(idToLoad);
    } else if (!idToLoad && !readOnly) {
      store.resetState();
      packageStore.reset();
    }
    if (routeId && !analysisId) {
        setAnalysisId(routeId);
    }
  }, [routeId, readOnly, analysisId]);

  const loadAnalysisData = async (idToLoad: string) => {
    try {
      const moduleData = await getModuleData('model');
      if (!moduleData) {
          console.warn("No data found for model module for user/ID", idToLoad);
          return;
      }

      store.setTitle(moduleData.title || 'Untitled Analysis');
      store.setProductDescription(moduleData.productDescription || '');
      if (moduleData.idealUser) store.setIdealUser(moduleData.idealUser);
      if (moduleData.outcomes) {
          store.setProcessingState({ outcomes: true });
          moduleData.outcomes.forEach((o: any) => store.updateOutcome(o.level, o.text));
          store.setProcessingState({ outcomes: false });
      }
      if (moduleData.challenges) {
          store.setProcessingState({ challenges: true });
          moduleData.challenges.forEach((c: any) => store.addChallenge(c));
          store.setProcessingState({ challenges: false });
      }
      if (moduleData.solutions) {
          store.setProcessingState({ solutions: true });
          moduleData.solutions.forEach((s: any) => store.addSolution(s));
          store.setProcessingState({ solutions: false });
      }
      if (moduleData.selectedModel) store.setSelectedModel(moduleData.selectedModel);
      
      packageStore.reset();
      if (moduleData.features) {
        moduleData.features.forEach((feature: any) => packageStore.addFeature(feature));
      }
      if (moduleData.pricingStrategy) {
        packageStore.setPricingStrategy(moduleData.pricingStrategy);
      }
      
      setAnalysisId(idToLoad);

    } catch (err) {
      console.error('Error loading model module data:', err);
      setError('Failed to load progress.');
    }
  };

  const handleSave = async () => {
    if (readOnly) return;

    if (!user) {
      setShowAuthModal(true);
      setPendingAction('save');
      return;
    }

    const moduleDataToSave = {
      title: store.title,
      productDescription: store.productDescription,
      idealUser: store.idealUser,
      outcomes: store.outcomes,
      challenges: store.challenges,
      solutions: store.solutions,
      selectedModel: store.selectedModel,
      features: packageStore.features,
      pricingStrategy: packageStore.pricingStrategy,
    };

    if (!moduleDataToSave.title?.trim()) {
      setShowTitlePrompt(true);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveModuleData('model', moduleDataToSave);
      
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Progress saved successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (err) { 
      console.error('Error saving model module data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save progress.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
      setShowTitlePrompt(false);
    }
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
      {showTitlePrompt && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Name your analysis</h3>
            <input
              type="text"
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTitlePrompt(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTitlePrompt(false);
                  handleSave();
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-center mb-2">
          <nav className="bg-[#1C1C1C] rounded-lg p-1 inline-flex">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const state = store;
              const packageState = packageStore;
              const isCompleted = 
                index !== currentStep && 
                (index < currentStep || step.isComplete(state, packageState));
              
              const isUnlocked = step.isUnlocked(state, packageState);
              
              const isClickable = index <= currentStep || (index > currentStep && isUnlocked);
              
              return (
                <button
                  key={index}
                  onClick={() => isClickable ? setCurrentStep(index) : null}
                  disabled={!isClickable}
                  className={`
                    px-4 py-2 text-sm rounded-md transition-colors duration-200
                    focus:outline-none
                    ${isActive 
                      ? 'bg-[#2A2A2A] text-white font-medium shadow-sm' 
                      : isCompleted
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {step.title}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="w-full bg-[#2A2A2A] h-1 rounded-full overflow-hidden">
          <div 
            className="bg-[#FFD23F] h-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <CurrentStepComponent readOnly={readOnly} />
        </ErrorBoundary>
      </div>

      <div className="flex justify-between">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            currentStep === 0
              ? 'bg-[#1C1C1C] text-gray-600 cursor-not-allowed'
              : 'bg-[#1C1C1C] text-white hover:bg-[#333333]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!isStepCompleted(currentStep) && !readOnly}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              !isStepCompleted(currentStep) && !readOnly
                ? 'bg-[#1C1C1C] text-gray-600 cursor-not-allowed'
                : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : !readOnly ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-green-500 text-white hover:bg-green-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Analysis</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            if (pendingAction === 'save') handleSave(); 
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}