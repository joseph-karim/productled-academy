import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { ProductDescription } from './steps/ProductDescription';
import { IdealUserIdentifier } from './steps/IdealUserIdentifier';
import { UserEndgame } from './steps/UserEndgame';
import { ChallengeCollector } from './steps/ChallengeCollector';
import { SolutionInput } from './steps/SolutionInput';
import { ModelSelector } from './steps/ModelSelector';
import { FreeModelCanvas } from './steps/FreeModelCanvas';
import { Analysis } from './Analysis';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';
import { getAnalysis, saveAnalysis, updateAnalysis } from '../services/supabase';

interface MultiStepFormProps {
  readOnly?: boolean;
}

const steps = [
  { 
    title: 'Product Description', 
    component: ProductDescription,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.productDescription.length >= 10 && !state.processingState.productDescription
  },
  {
    title: 'Ideal User',
    component: IdealUserIdentifier,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.productDescription.length >= 10,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      !!state.idealUser && !state.processingState.idealUser
  },
  { 
    title: 'User Endgame', 
    component: UserEndgame,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      !!state.idealUser,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => {
      const beginnerOutcome = state.outcomes.find(o => o.level === 'beginner');
      const intermediateOutcome = state.outcomes.find(o => o.level === 'intermediate');
      return (
        beginnerOutcome?.text.length >= 10 &&
        intermediateOutcome?.text.length >= 10 &&
        !state.processingState.userEndgame
      );
    }
  },
  { 
    title: 'Challenges', 
    component: ChallengeCollector,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => {
      const beginnerOutcome = state.outcomes.find(o => o.level === 'beginner');
      const intermediateOutcome = state.outcomes.find(o => o.level === 'intermediate');
      return (
        beginnerOutcome?.text.length >= 10 &&
        intermediateOutcome?.text.length >= 10
      );
    },
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.challenges.length > 0 && !state.processingState.challenges
  },
  { 
    title: 'Solutions', 
    component: SolutionInput,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.challenges.length > 0,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.solutions.length > 0 && !state.processingState.solutions
  },
  { 
    title: 'Model Selection', 
    component: ModelSelector,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.solutions.length > 0,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.selectedModel !== null && !state.processingState.modelSelection
  },
  { 
    title: 'Free Model Canvas', 
    component: FreeModelCanvas,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>, packageState: ReturnType<typeof usePackageStore.getState>) => 
      state.selectedModel !== null,
    isComplete: (state: ReturnType<typeof useFormStore.getState>, packageState: ReturnType<typeof usePackageStore.getState>) => {
      const hasFreeTier = packageState.features.some(f => f.tier === 'free');
      const hasPaidTier = packageState.features.some(f => f.tier === 'paid');
      const strategy = packageState.pricingStrategy;
      
      return (
        hasFreeTier && 
        hasPaidTier && 
        strategy?.freePackage.limitations.length > 0 &&
        strategy?.freePackage.conversionGoals.length > 0 &&
        strategy?.paidPackage.valueMetrics.length > 0 &&
        strategy?.paidPackage.targetConversion > 0 &&
        !packageState.processingState.freeModelCanvas
      );
    }
  },
  { 
    title: 'Analysis', 
    component: Analysis,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>, packageState: ReturnType<typeof usePackageStore.getState>) => {
      const hasFreeTier = packageState.features.some(f => f.tier === 'free');
      const hasPaidTier = packageState.features.some(f => f.tier === 'paid');
      const strategy = packageState.pricingStrategy;
      
      return (
        hasFreeTier && 
        hasPaidTier && 
        strategy?.freePackage.limitations.length > 0 &&
        strategy?.freePackage.conversionGoals.length > 0 &&
        strategy?.paidPackage.valueMetrics.length > 0 &&
        strategy?.paidPackage.targetConversion > 0
      );
    },
    isComplete: () => true
  },
];

export function MultiStepForm({ readOnly = false }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const formStore = useFormStore();
  const packageStore = usePackageStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const CurrentStepComponent = steps[currentStep].component;

  useEffect(() => {
    if (id) {
      loadAnalysis(id);
    } else {
      // Reset state for new analysis
      formStore.resetState();
      packageStore.reset();
    }
  }, [id]);

  const loadAnalysis = async (analysisId: string) => {
    try {
      const analysis = await getAnalysis(analysisId);
      
      // Update form store with loaded data
      formStore.setTitle(analysis.title || 'Untitled Analysis');
      formStore.setProductDescription(analysis.product_description || '');
      if (analysis.ideal_user) formStore.setIdealUser(analysis.ideal_user);
      if (analysis.outcomes) {
        analysis.outcomes.forEach((outcome: any) => {
          formStore.updateOutcome(outcome.level, outcome.text);
        });
      }
      if (analysis.challenges) {
        analysis.challenges.forEach((challenge: any) => {
          formStore.addChallenge(challenge);
        });
      }
      if (analysis.solutions) {
        analysis.solutions.forEach((solution: any) => {
          formStore.addSolution(solution);
        });
      }
      if (analysis.selected_model) formStore.setSelectedModel(analysis.selected_model);
      if (analysis.features) {
        packageStore.reset(); // Clear existing features
        analysis.features.forEach((feature: any) => {
          packageStore.addFeature(feature);
        });
      }
      if (analysis.user_journey) formStore.setUserJourney(analysis.user_journey);
      if (analysis.analysis_results) formStore.setAnalysis(analysis.analysis_results);
      if (analysis.pricing_strategy) packageStore.setPricingStrategy(analysis.pricing_strategy);
      
    } catch (error) {
      console.error('Error loading analysis:', error);
      setError('Failed to load analysis');
    }
  };

  const handleSave = async () => {
    if (readOnly) return;

    try {
      setIsSaving(true);
      setError(null);

      const analysisData = {
        title: formStore.title,
        productDescription: formStore.productDescription,
        idealUser: formStore.idealUser,
        outcomes: formStore.outcomes,
        challenges: formStore.challenges,
        solutions: formStore.solutions,
        selectedModel: formStore.selectedModel,
        features: packageStore.features,
        userJourney: formStore.userJourney,
        analysisResults: formStore.analysis,
        pricingStrategy: packageStore.pricingStrategy
      };

      if (id) {
        await updateAnalysis(id, {
          ...analysisData,
          pricingStrategy: packageStore.pricingStrategy
        });
      } else {
        setShowTitlePrompt(true);
      }

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Progress saved successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error saving analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = () => {
    if (currentStep < steps.length - 1 && 
        steps[currentStep].isComplete(formStore, packageStore)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    if (steps[index].isUnlocked(formStore, packageStore)) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Title input for new analysis */}
      {showTitlePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Name your analysis</h3>
            <input
              type="text"
              value={formStore.title}
              onChange={(e) => formStore.setTitle(e.target.value)}
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
                onClick={async () => {
                  const savedAnalysis = await saveAnalysis({
                    title: formStore.title || 'Untitled Analysis',
                    ...analysisData,
                    pricingStrategy: packageStore.pricingStrategy
                  });
                  setShowTitlePrompt(false);
                  navigate(`/analysis/${savedAnalysis.id}`);
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => {
            const isUnlocked = step.isUnlocked(formStore, packageStore);
            const isComplete = step.isComplete(formStore, packageStore);
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.title}
                onClick={() => !readOnly && goToStep(index)}
                disabled={!isUnlocked || readOnly}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  !isUnlocked || readOnly
                    ? 'text-gray-600 cursor-not-allowed'
                    : isCurrent
                    ? 'text-[#1C1C1C] bg-[#FFD23F]'
                    : isComplete
                    ? 'text-[#FFD23F] hover:bg-[#2A2A2A]'
                    : 'text-gray-300 hover:bg-[#2A2A2A]'
                }`}
              >
                {step.title}
              </button>
            );
          })}
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
        <CurrentStepComponent readOnly={readOnly} />
      </div>

      {/* Navigation and Save */}
      {!readOnly && (
        <div className="flex justify-between items-center">
          <button
            onClick={goPrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded ${
              currentStep === 0
                ? 'bg-[#2A2A2A] text-gray-600 cursor-not-allowed'
                : 'bg-[#2A2A2A] text-white hover:border-[#FFD23F] border border-gray-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] rounded hover:bg-[#FFD23F] hover:text-[#1C1C1C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </>
              )}
            </button>

            <button
              onClick={goNext}
              disabled={currentStep === steps.length - 1 || !steps[currentStep].isComplete(formStore, packageStore)}
              className={`flex items-center px-4 py-2 rounded ${
                currentStep === steps.length - 1 || !steps[currentStep].isComplete(formStore, packageStore)
                  ? 'bg-[#2A2A2A] text-gray-600 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}