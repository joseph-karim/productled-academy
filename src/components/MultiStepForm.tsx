import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const formStore = useFormStore();
  const packageStore = usePackageStore();
  const CurrentStepComponent = steps[currentStep].component;

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
                onClick={() => goToStep(index)}
                disabled={!isUnlocked}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  !isUnlocked
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
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
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
  );
}