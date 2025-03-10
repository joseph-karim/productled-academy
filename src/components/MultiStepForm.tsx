import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductDescription } from './steps/ProductDescription';
import { UserEndgame } from './steps/UserEndgame';
import { ChallengeCollector } from './steps/ChallengeCollector';
import { SolutionInput } from './steps/SolutionInput';
import { ModelSelector } from './steps/ModelSelector';
import { FreeModelCanvas } from './steps/FreeModelCanvas';
import { Analysis } from './Analysis';
import { useFormStore } from '../store/formStore';

const steps = [
  { 
    title: 'Product Description', 
    component: ProductDescription,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.productDescription.length >= 10
  },
  { 
    title: 'User Endgame', 
    component: UserEndgame,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.productDescription.length >= 10,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.outcomes.some(o => o.level === 'beginner' && o.text.length >= 10)
  },
  { 
    title: 'Challenges', 
    component: ChallengeCollector,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.outcomes.some(o => o.level === 'beginner' && o.text.length >= 10),
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.challenges.length > 0
  },
  { 
    title: 'Solutions', 
    component: SolutionInput,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.challenges.length > 0,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.solutions.length > 0
  },
  { 
    title: 'Model Selection', 
    component: ModelSelector,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.solutions.length > 0,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => 
      state.selectedModel !== null
  },
  { 
    title: 'Free Model Canvas', 
    component: FreeModelCanvas,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.selectedModel !== null,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => true
  },
  { 
    title: 'Analysis', 
    component: Analysis,
    isUnlocked: (state: ReturnType<typeof useFormStore.getState>) => 
      state.selectedModel !== null,
    isComplete: (state: ReturnType<typeof useFormStore.getState>) => true
  },
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const store = useFormStore();
  const CurrentStepComponent = steps[currentStep].component;

  const goNext = () => {
    if (currentStep < steps.length - 1 && steps[currentStep].isComplete(store)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    if (steps[index].isUnlocked(store)) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => {
            const isUnlocked = step.isUnlocked(store);
            const isComplete = step.isComplete(store);
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.title}
                onClick={() => goToStep(index)}
                disabled={!isUnlocked}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  !isUnlocked
                    ? 'text-gray-400 cursor-not-allowed'
                    : isCurrent
                    ? 'text-white bg-blue-600'
                    : isComplete
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {step.title}
              </button>
            );
          })}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded ${
            currentStep === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentStep === steps.length - 1 || !steps[currentStep].isComplete(store)}
          className={`flex items-center px-4 py-2 rounded ${
            currentStep === steps.length - 1 || !steps[currentStep].isComplete(store)
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}