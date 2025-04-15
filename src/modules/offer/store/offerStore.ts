import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateUUID } from '../utils/uuid';
import { WebsiteScrapingData, InitialContext, AISuggestion, ConversationalCheckpoint } from '../services/ai/types';
import { InsightState, InsightCategory, InsightResult } from '../components/insights/types';
import { scrapeWebsite, getScrapingResult } from '../services/webscraping';

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

export interface OfferStateData {
  title: string;
  websiteUrl: string;
  initialContext: InitialContext;
  websiteScraping: WebsiteScrapingData;
  contextChat: ContextChat;

  coreOfferNucleus: CoreOfferNucleus;
  exclusivity: Exclusivity;
  bonuses: Bonus[];
  onboardingSteps: OnboardingStep[];

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

  // Insight panel state
  insightState: InsightState;
}

export interface OfferState extends OfferStateData {
  setTitle: (title: string) => void;
  setWebsiteUrl: (url: string) => void;
  setInitialContext: (field: keyof InitialContext, value: string) => void;
  startWebsiteScraping: (url: string) => Promise<void>;
  checkScrapingStatus: (scrapingId: string) => Promise<void>;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  resetState: () => void;

  setCoreOfferNucleus: (nucleus: CoreOfferNucleus) => void;
  setExclusivity: (exclusivity: Exclusivity) => void;
  addBonus: (bonus: Bonus) => void;
  removeBonus: (index: number) => void;
  setBonuses: (bonuses: Bonus[]) => void;

  addOnboardingStep: (step: OnboardingStep) => void;
  removeOnboardingStep: (index: number) => void;
  updateOnboardingStep: (steps: OnboardingStep[]) => void;

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
  contextChat: {
    messages: [],
    lastUpdated: null
  },
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
              set({ websiteScraping: { scrapingId, status: 'completed', coreOffer: findings.coreOffer || '', targetAudience: findings.targetAudience || '', keyProblem: findings.problemSolved || '', valueProposition: findings.valueProposition || '', keyFeatures: processedKeyFeatures, keyPhrases: findings.keyPhrases || [], competitiveAdvantages: findings.competitiveAdvantages || [], error: null }});

              // Dispatch a custom event that can be listened for in components
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('scraping-completed', { detail: { scrapingId } }));
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
    }),
    { name: 'offer-store' }
  )
);