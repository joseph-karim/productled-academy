import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { AuthModal } from '@/core/auth/AuthModal';
import { ErrorBoundary } from 'react-error-boundary';

// Import our consolidated components
import { CoreOfferDevelopment } from './consolidated/CoreOfferDevelopment';
import { RiskManagement } from './consolidated/RiskManagement';
import { LandingPageTop } from './consolidated/LandingPageTop';
import { LandingPageBottom } from './consolidated/LandingPageBottom';
import { RefinementFinalization } from './consolidated/RefinementFinalization';

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

// New consolidated step definitions
const steps = [
  { 
    title: 'Core Offer Development',
    component: CoreOfferDevelopment,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => true,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.offerRating !== null &&
      state.userSuccess.statement.trim().length >= 10 && // Trim whitespace
      state.topResults.tangible.length > 0 && 
      state.topResults.intangible.length > 0 && 
      state.topResults.improvement.length > 0 &&
      state.advantages.length >= 1
  },
  {
    title: 'Risk Management & Offer Canvas',
    component: RiskManagement,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.advantages.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.risks.length >= 1 && 
      state.assurances.length >= 1
  },
  {
    title: 'Landing Page Top Section',
    component: LandingPageTop,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.assurances.length >= 1,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.heroSection.tagline.length > 0 && 
      state.heroSection.subCopy.length > 0 && 
      state.heroSection.ctaText.length > 0 &&
      state.problemSection.alternativesProblems.length > 0 && 
      state.problemSection.underlyingProblem.length > 0 &&
      state.solutionSection.steps.length > 0
  },
  {
    title: 'Landing Page Bottom Section',
    component: LandingPageBottom,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.heroSection.tagline.length > 0 && 
      state.solutionSection.steps.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.riskReversals.length >= 1 &&
      (state.socialProof.testimonials.length > 0 || 
       state.socialProof.caseStudies.length > 0 || 
       state.socialProof.logos.length > 0 || 
       state.socialProof.numbers.length > 0) &&
      state.ctaSection.mainCtaText.length > 0
  },
  {
    title: 'Refinement & Finalization',
    component: RefinementFinalization,
    isUnlocked: (state: ReturnType<typeof useOfferStore.getState>) => 
      state.riskReversals.length >= 1 && 
      state.ctaSection.mainCtaText.length > 0,
    isComplete: (state: ReturnType<typeof useOfferStore.getState>) => 
      ((state.refinedHeadlines.hero.length > 0 || 
        state.refinedHeadlines.problem.length > 0 || 
        state.refinedHeadlines.solution.length > 0) &&
       (state.refinedBodyCopy.hero.length > 0 || 
        state.refinedBodyCopy.problem.length > 0 || 
        state.refinedBodyCopy.solution.length > 0)) &&
      state.aestheticsChecklistCompleted &&
      state.offerScorecard !== null
  }
];

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
      console.log(`Loading offer data with ID: ${idToLoad}`);
      const moduleData = await getModuleData('offer');
      if (!moduleData) {
        console.warn("No data found for offer module");
        store.resetState();
        return;
      }

      // Reset store before loading new data
      store.resetState();
      
      if (idToLoad && moduleData.offers) {
        const specificOffer = moduleData.offers.find((offer: any) => offer.id === idToLoad);
        
        if (specificOffer) {
          console.log(`Loading specific offer with ID: ${idToLoad}`);
          useOfferStore.setState(specificOffer);
          return;
        } else {
          console.warn(`Offer with ID ${idToLoad} not found`);
          setOfferNotFound(true);
        }
      }
      
      useOfferStore.setState(moduleData);

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
      
      // Analysis data
      if (moduleData.offerScorecard) {
        store.setOfferScorecard(moduleData.offerScorecard);
      }
      
      if (moduleData.offerAnalysisFeedback) {
        store.setOfferAnalysisFeedback(moduleData.offerAnalysisFeedback);
      }
      
      if (moduleData.suggestedNextSteps) {
        store.setSuggestedNextSteps(moduleData.suggestedNextSteps);
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
        aestheticsChecklistCompleted: storeState.aestheticsChecklistCompleted,
        // Analysis data
        offerScorecard: storeState.offerScorecard,
        offerAnalysisFeedback: storeState.offerAnalysisFeedback,
        suggestedNextSteps: storeState.suggestedNextSteps
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
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">
            {steps[currentStep].title}
          </h2>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        
        <div className="w-full bg-[#333333] rounded-full h-2">
          <div 
            className="bg-[#FFD23F] h-2 rounded-full" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Title prompt dialog */}
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

      {/* Auth modal */}
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

      {/* Current step */}
      <div className="flex-grow">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => setError(null)}
        >
          <CurrentStepComponent modelData={modelData} readOnly={readOnly} />
        </ErrorBoundary>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
          {error}
        </div>
      )}

      {/* Navigation and actions */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous Step
        </button>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <button
              onClick={() => handleSave()}
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
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={
              currentStep === steps.length - 1 ||
              !steps[currentStep].isComplete(store) ||
              (currentStep + 1 < steps.length && !steps[currentStep + 1].isUnlocked(store))
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