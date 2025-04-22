import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateUUID } from '../utils/uuid';
import { WebsiteScrapingData, InitialContext, AISuggestion, ConversationalCheckpoint } from '../services/ai/types';
import { InsightState, InsightCategory, InsightResult } from '../components/insights/types';
import { scrapeWebsite, getScrapingResult } from '../services/webscraping';
import { TranscriptData } from '../services/ai/transcriptProcessor';

export interface ChatMessage {
  id: string;
  sender: 'system' | 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ContextChat {
  messages: ChatMessage[];
  lastUpdated: Date | null;
}

export interface CoreOfferNucleus {
  targetAudience: string;
  desiredResult: string;
  keyAdvantage: string;
  biggestBarrier: string;
  assurance: string;
}

export interface Exclusivity {
  hasLimit: boolean;
  capacityLimit: string;
  validReason: string;
}

export interface Bonus {
  id: string;
  name: string;
  benefit: string;
}

export interface OnboardingStep {
  id: string;
  description: string;
  timeEstimate: string;
}

export interface SectionCopy {
  headline: string;
  body: string;
}

export interface HeroSection {
  tagline: string;
  subCopy: string;
  ctaText: string;
  visualDesc: string;
  socialProofExample?: string;
}

export interface FeaturesSection {
  title: string;
  description: string;
  features: {
    id: string;
    title: string;
    description: string;
  }[];
}

export interface ProblemSection {
  alternativesProblems: string;
  underlyingProblem: string;
}

export interface SolutionSection {
  headline: string;
  steps: {
    id: string;
    title: string;
    description: string;
  }[];
}

export interface CtaSection {
  mainCtaText: string;
  surroundingCopy: string;
}

export interface OfferStateData {
  title: string;
  websiteUrl: string;
  initialContext: InitialContext;
  websiteScraping: WebsiteScrapingData;
  transcriptData: TranscriptData | null;
  contextChat: ContextChat;
  contextChatInitialLoad: boolean;

  coreOfferNucleus: CoreOfferNucleus;
  exclusivity: Exclusivity;
  bonuses: Bonus[];
  onboardingSteps: OnboardingStep[];

  // Landing page sections
  heroSection: HeroSection;
  featuresSection: FeaturesSection;
  problemSection: ProblemSection;
  solutionSection: SolutionSection;
  riskReversals: { id: string; objection: string; assurance: string }[];
  socialProof: {
    testimonials: string[];
    caseStudies: string[];
    logos: string[];
    numbers: string[];
  };
  ctaSection: CtaSection;

  coreOfferConfirmed: boolean;
  onboardingStepsConfirmed: boolean;
  enhancersConfirmed: boolean;
  landingPageContentRefined: boolean;
  finalReviewCompleted: boolean;

  refinedHeroCopy: SectionCopy;
  refinedProblemCopy: SectionCopy;
  refinedSolutionCopy: SectionCopy;
  refinedRiskReversalCopy: SectionCopy;
  refinedSocialProofNotes: string;
  refinedCtaCopy: SectionCopy;

  // Processing state for different sections
  processingState: Record<string, boolean>;

  // Insight panel state
  insightState: InsightState;
}

export interface OfferState extends OfferStateData {
  setTitle: (title: string) => void;
  setWebsiteUrl: (url: string) => void;
  setInitialContext: (field: keyof InitialContext, value: string) => void;
  startWebsiteScraping: (url: string) => Promise<void>;
  checkScrapingStatus: (scrapingId: string) => Promise<void>;
  setTranscriptData: (data: TranscriptData) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  resetState: () => void;
  setContextChatInitialLoad: (value: boolean) => void;

  setCoreOfferNucleus: (nucleus: CoreOfferNucleus) => void;
  setExclusivity: (exclusivity: Exclusivity) => void;
  addBonus: (bonus: Bonus) => void;
  removeBonus: (index: number) => void;
  setBonuses: (bonuses: Bonus[]) => void;

  addOnboardingStep: (step: OnboardingStep) => void;
  removeOnboardingStep: (index: number) => void;
  updateOnboardingStep: (steps: OnboardingStep[]) => void;

  // Landing page section actions
  setHeroSection: (section: HeroSection) => void;
  setFeaturesSection: (section: FeaturesSection) => void;
  setProblemSection: (section: ProblemSection) => void;
  setSolutionSection: (section: SolutionSection) => void;
  addRiskReversal: (riskReversal: { id: string; objection: string; assurance: string }) => void;
  removeRiskReversal: (index: number) => void;
  setRiskReversals: (riskReversals: { id: string; objection: string; assurance: string }[]) => void;
  addSocialProof: (type: 'testimonials' | 'caseStudies' | 'logos' | 'numbers', item: string) => void;
  removeSocialProof: (type: 'testimonials' | 'caseStudies' | 'logos' | 'numbers', index: number) => void;
  setCtaSection: (section: CtaSection) => void;

  // Set processing state for a section
  setProcessing: (section: string, isProcessing: boolean) => void;

  setCoreOfferConfirmed: (confirmed: boolean) => void;
  setOnboardingStepsConfirmed: (confirmed: boolean) => void;
  setEnhancersConfirmed: (confirmed: boolean) => void;
  setLandingPageContentRefined: (refined: boolean) => void;
  setFinalReviewCompleted: (completed: boolean) => void;

  setRefinedHeroCopy: (copy: SectionCopy) => void;
  setRefinedProblemCopy: (copy: SectionCopy) => void;
  setRefinedSolutionCopy: (copy: SectionCopy) => void;
  setRefinedRiskReversalCopy: (copy: SectionCopy) => void;
  setRefinedSocialProofNotes: (notes: string) => void;
  setRefinedCtaCopy: (copy: SectionCopy) => void;

  // Insight panel actions
  setInsightCategory: (category: InsightCategory) => void;
  setInsightResult: (result: InsightResult) => void;
  completeInsights: () => void;
  resetInsights: () => void;
}

const initialSectionCopy: SectionCopy = { headline: '', body: '' };
const initialInsightState: InsightState = {
  results: {
    customer: null,
    result: null,
    better: null,
    risk: null
  },
  currentCategory: 'customer',
  isComplete: false
};

const initialState: OfferStateData = {
  title: 'Untitled Offer',
  websiteUrl: '',
  initialContext: {
    currentOffer: '',
    targetAudience: '',
    problemSolved: ''
  },
  websiteScraping: {
    scrapingId: null,
    status: 'idle',
    coreOffer: '',
    targetAudience: '',
    keyProblem: '',
    valueProposition: '',
    keyFeatures: [],
    keyPhrases: [],
    competitiveAdvantages: [],
    error: null
  },
  transcriptData: null,
  contextChat: {
    messages: [],
    lastUpdated: null
  },
  contextChatInitialLoad: true,
  coreOfferNucleus: {
    targetAudience: '' as string,
    desiredResult: '' as string,
    keyAdvantage: '' as string,
    biggestBarrier: '' as string,
    assurance: '' as string
  },
  exclusivity: {
    hasLimit: false as boolean,
    capacityLimit: '' as string,
    validReason: '' as string
  },
  bonuses: [] as Bonus[],
  onboardingSteps: [] as OnboardingStep[],

  // Landing page sections
  heroSection: {
    tagline: '',
    subCopy: '',
    ctaText: '',
    visualDesc: ''
  },
  featuresSection: {
    title: '',
    description: '',
    features: []
  },
  problemSection: {
    alternativesProblems: '',
    underlyingProblem: ''
  },
  solutionSection: {
    headline: '',
    steps: []
  },
  riskReversals: [],
  socialProof: {
    testimonials: [],
    caseStudies: [],
    logos: [],
    numbers: []
  },
  ctaSection: {
    mainCtaText: '',
    surroundingCopy: ''
  },

  coreOfferConfirmed: false,
  onboardingStepsConfirmed: false,
  enhancersConfirmed: false,
  landingPageContentRefined: false,
  finalReviewCompleted: false,
  refinedHeroCopy: { ...initialSectionCopy },
  refinedProblemCopy: { ...initialSectionCopy },
  refinedSolutionCopy: { ...initialSectionCopy },
  refinedRiskReversalCopy: { ...initialSectionCopy },
  refinedSocialProofNotes: '' as string,
  refinedCtaCopy: { ...initialSectionCopy },

  // Processing state for different sections
  processingState: {},

  // Insight panel state
  insightState: initialInsightState
};

export const useOfferStore = create<OfferState>()(
  devtools(
    (set): OfferState => ({
      ...initialState,

      setTitle: (title) => set({ title }),
      setWebsiteUrl: (url) => set({ websiteUrl: url }),
      setInitialContext: (field, value) => set((state) => ({ initialContext: { ...state.initialContext, [field]: value }})),
      setTranscriptData: (data) => {
        // Update transcript data
        set({ transcriptData: data });

        // Also update core offer nucleus with transcript data
        set((state) => ({
          coreOfferNucleus: {
            ...state.coreOfferNucleus,
            targetAudience: data.targetAudience || state.coreOfferNucleus.targetAudience,
            desiredResult: data.desiredResult || state.coreOfferNucleus.desiredResult,
            keyAdvantage: data.keyAdvantage || state.coreOfferNucleus.keyAdvantage,
            biggestBarrier: data.biggestBarrier || state.coreOfferNucleus.biggestBarrier,
            assurance: data.assurance || state.coreOfferNucleus.assurance
          }
        }));

        // Dispatch a custom event that can be listened for in components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transcript-processed'));
        }
      },
      startWebsiteScraping: async (url) => {
         if (!url) return;
         set((state) => ({ websiteScraping: { ...state.websiteScraping, status: 'processing', error: null }}));
         try {
           const { scrapingId } = await scrapeWebsite(url);
           set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId, status: 'processing' }}));
           setTimeout(() => { const get = useOfferStore.getState; get().checkScrapingStatus(scrapingId); }, 100);
         } catch (error) {
           set((state) => ({ websiteScraping: { ...state.websiteScraping, status: 'failed', error: error instanceof Error ? error.message : 'Failed to start scraping' }}));
         }
      },
      checkScrapingStatus: async (scrapingId) => {
        if (!scrapingId) return;
        try {
          const result = await getScrapingResult(scrapingId);
          if (result) {
            if (result.status === 'completed' && result.analysisResult?.findings) {
              const findings = result.analysisResult.findings;
              let processedKeyFeatures: string[] = [];
              if (findings.keyBenefits && Array.isArray(findings.keyBenefits)) {
                 processedKeyFeatures = findings.keyBenefits.map(item => typeof item === 'string' ? item : item.benefit || '').filter(Boolean);
              }

              // DIRECT FIX: Create a custom event when scraping completes
              console.log('DIRECT FIX: Scraping completed, dispatching custom event');
              set({ websiteScraping: {
                scrapingId,
                status: 'completed',
                coreOffer: findings.coreOffer || '',
                targetAudience: findings.targetAudience || '',
                keyProblem: findings.problemSolved || '',
                valueProposition: findings.valueProposition || '',
                keyFeatures: processedKeyFeatures,
                keyPhrases: findings.keyPhrases || [],
                competitiveAdvantages: findings.competitiveAdvantages || [],
                onboardingSteps: findings.onboardingSteps || [],
                error: null
              }});

              // Dispatch custom events that can be listened for in components
              if (typeof window !== 'undefined') {
                // Event for general scraping completion
                window.dispatchEvent(new CustomEvent('scraping-completed', { detail: { scrapingId } }));

                // Also dispatch launch-ai-chat event to automatically start the chat
                window.dispatchEvent(new CustomEvent('launch-ai-chat', {
                  detail: {
                    websiteUrl: useOfferStore.getState().websiteUrl,
                    scrapingStatus: 'completed',
                    hasFindings: true
                  }
                }));
              }
            } else if (result.status === 'failed') {
              set((state) => ({ websiteScraping: { ...state.websiteScraping, status: 'failed', error: result.error || 'Scraping failed' }}));
            } else if (result.status === 'processing') {
               console.log(`Scraping ID ${scrapingId} still processing...`);
               setTimeout(() => useOfferStore.getState().checkScrapingStatus(scrapingId), 5000);
            }
          }
        } catch (error) {
          console.error('Error checking scraping status:', error);
        }
      },
      addChatMessage: (message) => set((state) => ({ contextChat: { ...state.contextChat, messages: [ ...state.contextChat.messages, { id: generateUUID(), timestamp: new Date(), ...message }], lastUpdated: new Date() }})),
      clearChatMessages: () => set({ contextChat: { messages: [], lastUpdated: null } }),
      resetState: () => set(initialState),
      setContextChatInitialLoad: (value) => set({ contextChatInitialLoad: value }),

      setCoreOfferNucleus: (nucleus) => set({ coreOfferNucleus: nucleus }),
      setExclusivity: (exclusivity) => set({ exclusivity: exclusivity }),
      addBonus: (bonus) => set((state) => ({ bonuses: [...state.bonuses, bonus] })),
      removeBonus: (index) => set((state) => ({ bonuses: state.bonuses.filter((_, i) => i !== index) })),
      setBonuses: (bonuses) => set({ bonuses: bonuses }),

      addOnboardingStep: (step) => set((state) => ({ onboardingSteps: [...state.onboardingSteps, step] })),
      removeOnboardingStep: (index) => set((state) => ({ onboardingSteps: state.onboardingSteps.filter((_, i) => i !== index) })),
      updateOnboardingStep: (steps) => set({ onboardingSteps: steps }),

      setCoreOfferConfirmed: (confirmed) => set({ coreOfferConfirmed: confirmed }),
      setOnboardingStepsConfirmed: (confirmed) => set({ onboardingStepsConfirmed: confirmed }),
      setEnhancersConfirmed: (confirmed) => set({ enhancersConfirmed: confirmed }),
      setLandingPageContentRefined: (refined) => set({ landingPageContentRefined: refined }),
      setFinalReviewCompleted: (completed) => set({ finalReviewCompleted: completed }),
      setRefinedHeroCopy: (copy) => set({ refinedHeroCopy: copy }),
      setRefinedProblemCopy: (copy) => set({ refinedProblemCopy: copy }),
      setRefinedSolutionCopy: (copy) => set({ refinedSolutionCopy: copy }),
      setRefinedRiskReversalCopy: (copy) => set({ refinedRiskReversalCopy: copy }),
      setRefinedSocialProofNotes: (notes) => set({ refinedSocialProofNotes: notes }),
      setRefinedCtaCopy: (copy) => set({ refinedCtaCopy: copy }),

      // Insight panel actions
      setInsightCategory: (category) => set((state) => ({
        insightState: {
          ...state.insightState,
          currentCategory: category
        }
      })),

      setInsightResult: (result) => set((state) => ({
        insightState: {
          ...state.insightState,
          results: {
            ...state.insightState.results,
            [result.category]: result
          }
        }
      })),

      completeInsights: () => set((state) => ({
        insightState: {
          ...state.insightState,
          isComplete: true
        }
      })),

      resetInsights: () => set((state) => ({
        insightState: initialInsightState
      })),

      // Landing page section actions
      setHeroSection: (section) => set({ heroSection: section }),
      setFeaturesSection: (section) => set({ featuresSection: section }),
      setProblemSection: (section) => set({ problemSection: section }),
      setSolutionSection: (section) => set({ solutionSection: section }),
      addRiskReversal: (riskReversal) => set((state) => ({ riskReversals: [...state.riskReversals, riskReversal] })),
      removeRiskReversal: (index) => set((state) => ({ riskReversals: state.riskReversals.filter((_, i) => i !== index) })),
      setRiskReversals: (riskReversals) => set({ riskReversals }),
      addSocialProof: (type, item) => set((state) => ({
        socialProof: {
          ...state.socialProof,
          [type]: [...state.socialProof[type], item]
        }
      })),
      removeSocialProof: (type, index) => set((state) => ({
        socialProof: {
          ...state.socialProof,
          [type]: state.socialProof[type].filter((_, i) => i !== index)
        }
      })),
      setCtaSection: (section) => set({ ctaSection: section }),

      // Set processing state for a section
      setProcessing: (section, isProcessing) => set((state) => ({
        processingState: {
          ...state.processingState,
          [section]: isProcessing
        }
      })),
    }),
    { name: 'offer-store' }
  )
);