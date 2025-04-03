import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';

// Import our implemented components
import { OfferIntro } from './OfferIntro';
import { DefineUserSuccess } from './DefineUserSuccess';
import { DefineTopResults } from './DefineTopResults';
import { DefineAdvantages } from './DefineAdvantages';

// Temporary placeholder component while we implement the actual step components
const Placeholder = ({ title, modelData, readOnly }: { title: string; modelData?: any; readOnly?: boolean }) => (
  <div className="p-4 bg-[#2A2A2A] rounded-lg">
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <p className="text-gray-300">This component is under development.</p>
  </div>
);

// Step components (remaining placeholders will be replaced with actual implementations)
const IdentifyRisks = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Identify Risks" modelData={modelData} readOnly={readOnly} />;
const DefineAssurances = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Define Assurances" modelData={modelData} readOnly={readOnly} />;
const OfferCanvasDisplay = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Offer Canvas Display" modelData={modelData} readOnly={readOnly} />;
const HeroSectionBuilder = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Hero Section Builder" modelData={modelData} readOnly={readOnly} />;
const ProblemSectionBuilder = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Problem Section Builder" modelData={modelData} readOnly={readOnly} />;
const SolutionSectionBuilder = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Solution Section Builder" modelData={modelData} readOnly={readOnly} />;
const RiskReversalBuilder = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Risk Reversal Builder" modelData={modelData} readOnly={readOnly} />;
const SocialProofInput = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Social Proof Input" modelData={modelData} readOnly={readOnly} />;
const CtaSectionBuilder = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="CTA Section Builder" modelData={modelData} readOnly={readOnly} />;
const RefineHeadlines = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Refine Headlines" modelData={modelData} readOnly={readOnly} />;
const RefineBodyCopy = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Refine Body Copy" modelData={modelData} readOnly={readOnly} />;
const AestheticsChecklist = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Aesthetics Checklist" modelData={modelData} readOnly={readOnly} />;
const FinalChecklistSummary = ({ modelData, readOnly }: { modelData?: any; readOnly?: boolean }) => <Placeholder title="Final Checklist Summary" modelData={modelData} readOnly={readOnly} />;

interface MultiStepFormProps {
  readOnly?: boolean;
  analysisId?: string;
}

const steps = [
  { 
    title: 'Offer Introduction',
    component: OfferIntro,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.offerRating !== null
  },
  {
    title: 'Define User Success',
    component: DefineUserSuccess,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.userSuccess.statement.length >= 10
  },
  {
    title: 'Define Top Results',
    component: DefineTopResults,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.userSuccess.statement.length >= 10,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.topResults.tangible.length > 0 && 
      state.topResults.intangible.length > 0 && 
      state.topResults.improvement.length > 0
  },
  {
    title: 'Define Advantages',
    component: DefineAdvantages,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.topResults.tangible.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.advantages.length >= 1
  },
  {
    title: 'Identify Risks',
    component: IdentifyRisks,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.advantages.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.risks.length >= 1
  },
  {
    title: 'Define Assurances',
    component: DefineAssurances,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.risks.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.assurances.length >= 1
  },
  {
    title: 'Offer Canvas Display',
    component: OfferCanvasDisplay,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.assurances.length >= 1,
    isComplete: () => true // Always completable as it's a display
  },
  {
    title: 'Hero Section Builder',
    component: HeroSectionBuilder,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.assurances.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.heroSection.tagline.length > 0 && 
      state.heroSection.subCopy.length > 0 && 
      state.heroSection.ctaText.length > 0
  },
  {
    title: 'Problem Section Builder',
    component: ProblemSectionBuilder,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.heroSection.tagline.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.problemSection.alternativesProblems.length > 0 && 
      state.problemSection.underlyingProblem.length > 0
  },
  {
    title: 'Solution Section Builder',
    component: SolutionSectionBuilder,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.problemSection.underlyingProblem.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.solutionSection.steps.length > 0
  },
  {
    title: 'Risk Reversal Builder',
    component: RiskReversalBuilder,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.solutionSection.steps.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.riskReversals.length >= 1
  },
  {
    title: 'Social Proof Input',
    component: SocialProofInput,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.riskReversals.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.socialProof.testimonials.length > 0 || 
      state.socialProof.caseStudies.length > 0 || 
      state.socialProof.logos.length > 0 || 
      state.socialProof.numbers.length > 0
  },
  {
    title: 'CTA Section Builder',
    component: CtaSectionBuilder,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.socialProof.testimonials.length > 0 || 
      state.socialProof.caseStudies.length > 0 || 
      state.socialProof.logos.length > 0 || 
      state.socialProof.numbers.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.ctaSection.mainCtaText.length > 0
  },
  {
    title: 'Refine Headlines',
    component: RefineHeadlines,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.ctaSection.mainCtaText.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.refinedHeadlines.hero.length > 0 || 
      state.refinedHeadlines.problem.length > 0 || 
      state.refinedHeadlines.solution.length > 0
  },
  {
    title: 'Refine Body Copy',
    component: RefineBodyCopy,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.refinedHeadlines.hero.length > 0 || 
      state.refinedHeadlines.problem.length > 0 || 
      state.refinedHeadlines.solution.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.refinedBodyCopy.hero.length > 0 || 
      state.refinedBodyCopy.problem.length > 0 || 
      state.refinedBodyCopy.solution.length > 0
  },
  {
    title: 'Aesthetics Checklist',
    component: AestheticsChecklist,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.refinedBodyCopy.hero.length > 0 || 
      state.refinedBodyCopy.problem.length > 0 || 
      state.refinedBodyCopy.solution.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.aestheticsChecklistCompleted
  },
  {
    title: 'Final Checklist',
    component: FinalChecklistSummary,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.aestheticsChecklistCompleted,
    isComplete: () => true // Last step is always completable
  }
];

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

export function MultiStepForm({ readOnly = false, analysisId: propAnalysisId }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(propAnalysisId || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [modelData, setModelData] = useState<any>(null);
  
  const store = useOfferStore();
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const CurrentStepComponent = steps[currentStep].component;

  // Load data effect
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
      const moduleData = await getModuleData('offer');
      if (!moduleData) {
        console.warn("No data found for offer module");
        store.resetState();
        return;
      }

      // Reset store before loading new data
      store.resetState();

      // Map data from Supabase to store
      store.setTitle(moduleData.title || 'Untitled Offer');
      store.setOfferRating(moduleData.offerRating || null);
      
      if (moduleData.userSuccess) {
        store.setUserSuccess(moduleData.userSuccess.statement || '');
      }
      
      if (moduleData.topResults) {
        store.setTopResults(moduleData.topResults);
      }
      
      // Advantages
      if (moduleData.advantages && Array.isArray(moduleData.advantages)) {
        moduleData.advantages.forEach((adv: any) => {
          store.addAdvantage(adv.text, adv.description);
        });
      }
      
      // Risks
      if (moduleData.risks && Array.isArray(moduleData.risks)) {
        moduleData.risks.forEach((risk: any) => {
          store.addRisk(risk.text);
        });
      }
      
      // Assurances
      if (moduleData.assurances && Array.isArray(moduleData.assurances)) {
        moduleData.assurances.forEach((assurance: any) => {
          store.addAssurance(assurance.riskId, assurance.text);
        });
      }
      
      // Hero Section
      if (moduleData.heroSection) {
        store.setHeroSection(moduleData.heroSection);
      }
      
      // Problem Section
      if (moduleData.problemSection) {
        store.setProblemSection(moduleData.problemSection);
      }
      
      // Solution Section
      if (moduleData.solutionSection && moduleData.solutionSection.steps) {
        moduleData.solutionSection.steps.forEach((step: any) => {
          store.addSolutionStep(step.title, step.description);
        });
      }
      
      // Risk Reversals
      if (moduleData.riskReversals && Array.isArray(moduleData.riskReversals)) {
        moduleData.riskReversals.forEach((reversal: any) => {
          store.addRiskReversal(reversal.riskId, reversal.text);
        });
      }
      
      // Social Proof
      if (moduleData.socialProof) {
        const socialProof = moduleData.socialProof;
        
        (['testimonials', 'caseStudies', 'logos', 'numbers'] as const).forEach((type) => {
          if (socialProof[type] && Array.isArray(socialProof[type])) {
            socialProof[type].forEach((item: string) => {
              store.addSocialProof(type, item);
            });
          }
        });
      }
      
      // CTA Section
      if (moduleData.ctaSection) {
        store.setCtaSection(moduleData.ctaSection);
      }
      
      // Refined Headlines
      if (moduleData.refinedHeadlines) {
        const headlines = moduleData.refinedHeadlines;
        
        (['hero', 'problem', 'solution'] as const).forEach((type) => {
          if (headlines[type] && Array.isArray(headlines[type])) {
            headlines[type].forEach((headline: string) => {
              store.addHeadline(type, headline);
            });
          }
        });
      }
      
      // Refined Body Copy
      if (moduleData.refinedBodyCopy) {
        if (moduleData.refinedBodyCopy.hero) {
          store.setBodyCopy('hero', moduleData.refinedBodyCopy.hero);
        }
        if (moduleData.refinedBodyCopy.problem) {
          store.setBodyCopy('problem', moduleData.refinedBodyCopy.problem);
        }
        if (moduleData.refinedBodyCopy.solution) {
          store.setBodyCopy('solution', moduleData.refinedBodyCopy.solution);
        }
      }
      
      // Aesthetics Checklist
      if (moduleData.aestheticsChecklistCompleted !== undefined) {
        store.setAestheticsChecklistCompleted(moduleData.aestheticsChecklistCompleted);
      }
      
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
      // Get the current state from the store to save
      const storeState = useOfferStore.getState();
      
      const dataToSave = {
        title: storeState.title,
        offerRating: storeState.offerRating,
        userSuccess: storeState.userSuccess,
        topResults: storeState.topResults,
        advantages: storeState.advantages,
        risks: storeState.risks,
        assurances: storeState.assurances,
        heroSection: storeState.heroSection,
        problemSection: storeState.problemSection,
        solutionSection: storeState.solutionSection,
        riskReversals: storeState.riskReversals,
        socialProof: storeState.socialProof,
        ctaSection: storeState.ctaSection,
        refinedHeadlines: storeState.refinedHeadlines,
        refinedBodyCopy: storeState.refinedBodyCopy,
        aestheticsChecklistCompleted: storeState.aestheticsChecklistCompleted
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepUnlocked = (index: number) => {
    if (readOnly) {
      return true;
    }
    
    const step = steps[index];
    const state = useOfferStore.getState();
    return step.isUnlocked(state);
  };

  const isStepCompleted = (index: number) => {
    const step = steps[index];
    const state = useOfferStore.getState();
    return step.isComplete(state);
  };

  return (
    <div className="space-y-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="bg-[#2A2A2A] rounded-lg p-6">
          <CurrentStepComponent modelData={modelData} readOnly={readOnly} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
          {/* Step indicators */}
          <div className="hidden lg:flex flex-col w-48 space-y-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => isStepUnlocked(index) && setCurrentStep(index)}
                disabled={!isStepUnlocked(index)}
                className={`text-left p-2 rounded-lg transition-colors ${
                  currentStep === index
                    ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                    : isStepUnlocked(index)
                    ? 'hover:bg-[#2A2A2A] text-gray-300'
                    : 'opacity-50 cursor-not-allowed text-gray-500'
                } ${isStepCompleted(index) ? 'border-l-4 border-green-500 pl-4' : ''}`}
              >
                {step.title}
              </button>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between w-full">
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
                      {user ? 'Save Offer' : 'Sign Up to Save'}
                    </>
                  )}
                </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Name Your Offer</h3>
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
                  if (store.title) {
                    setShowTitlePrompt(false);
                    handleSave();
                  }
                }}
                disabled={!store.title}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 disabled:opacity-50"
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