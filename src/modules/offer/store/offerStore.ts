import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateUUID } from '../utils/uuid';
import { WebsiteScrapingData, InitialContext, AISuggestion, ConversationalCheckpoint } from '../services/ai/types';
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

export interface SectionCopy {
  headline: string;
  body: string;
}

interface OfferStateData {
  title: string;
  websiteUrl: string;
  initialContext: InitialContext;
  websiteScraping: WebsiteScrapingData;
  contextChat: ContextChat;
  
  coreOfferNucleus: CoreOfferNucleus;
  exclusivity: Exclusivity;
  bonuses: Bonus[];
  
  coreOfferConfirmed: boolean;
  enhancersConfirmed: boolean;
  landingPageContentRefined: boolean;
  finalReviewCompleted: boolean;
  
  refinedHeroCopy: SectionCopy;
  refinedProblemCopy: SectionCopy;
  refinedSolutionCopy: SectionCopy;
  refinedRiskReversalCopy: SectionCopy;
  refinedSocialProofNotes: string;
  refinedCtaCopy: SectionCopy;
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
  
  setCoreOfferConfirmed: (confirmed: boolean) => void;
  setEnhancersConfirmed: (confirmed: boolean) => void;
  setLandingPageContentRefined: (refined: boolean) => void;
  setFinalReviewCompleted: (completed: boolean) => void;
  
  setRefinedHeroCopy: (copy: SectionCopy) => void;
  setRefinedProblemCopy: (copy: SectionCopy) => void;
  setRefinedSolutionCopy: (copy: SectionCopy) => void;
  setRefinedRiskReversalCopy: (copy: SectionCopy) => void;
  setRefinedSocialProofNotes: (notes: string) => void;
  setRefinedCtaCopy: (copy: SectionCopy) => void;
}

const initialSectionCopy: SectionCopy = { headline: '', body: '' };
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
  coreOfferConfirmed: false,
  enhancersConfirmed: false,
  landingPageContentRefined: false,
  finalReviewCompleted: false,
  refinedHeroCopy: { ...initialSectionCopy },
  refinedProblemCopy: { ...initialSectionCopy },
  refinedSolutionCopy: { ...initialSectionCopy },
  refinedRiskReversalCopy: { ...initialSectionCopy },
  refinedSocialProofNotes: '' as string,
  refinedCtaCopy: { ...initialSectionCopy },
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
              set({ websiteScraping: { scrapingId, status: 'completed', coreOffer: findings.coreOffer || '', targetAudience: findings.targetAudience || '', keyProblem: findings.problemSolved || '', valueProposition: findings.valueProposition || '', keyFeatures: processedKeyFeatures, keyPhrases: findings.keyPhrases || [], competitiveAdvantages: findings.competitiveAdvantages || [], error: null }});
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
      setCoreOfferConfirmed: (confirmed) => set({ coreOfferConfirmed: confirmed }),
      setEnhancersConfirmed: (confirmed) => set({ enhancersConfirmed: confirmed }),
      setLandingPageContentRefined: (refined) => set({ landingPageContentRefined: refined }),
      setFinalReviewCompleted: (completed) => set({ finalReviewCompleted: completed }),
      setRefinedHeroCopy: (copy) => set({ refinedHeroCopy: copy }),
      setRefinedProblemCopy: (copy) => set({ refinedProblemCopy: copy }),
      setRefinedSolutionCopy: (copy) => set({ refinedSolutionCopy: copy }),
      setRefinedRiskReversalCopy: (copy) => set({ refinedRiskReversalCopy: copy }),
      setRefinedSocialProofNotes: (notes) => set({ refinedSocialProofNotes: notes }),
      setRefinedCtaCopy: (copy) => set({ refinedCtaCopy: copy }),
    }),
    { name: 'offer-store' }
  )
);