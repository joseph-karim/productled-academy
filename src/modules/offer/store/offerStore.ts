import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateUUID } from '../utils/uuid';
import { WebsiteScrapingData, InitialContext } from '../services/ai/types';
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

// Interfaces for the Offer module components
interface UserSuccess {
  statement: string;
}

interface TopResults {
  tangible: string;
  intangible: string;
  improvement: string;
}

interface Advantage {
  id: string;
  text: string;
  description?: string;
}

interface Risk {
  id: string;
  text: string;
}

interface Assurance {
  id: string;
  riskId: string;
  text: string;
}

interface HeroSection {
  tagline: string;
  subCopy: string;
  ctaText: string;
  visualDesc?: string;
  socialProofExample?: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesSection {
  title: string;
  description: string;
  features: Feature[];
}

interface ProblemSection {
  alternativesProblems: string;
  underlyingProblem: string;
}

interface SolutionStep {
  id: string;
  title: string;
  description: string;
}

interface SolutionSection {
  steps: SolutionStep[];
}

interface RiskReversal {
  id: string;
  riskId: string;
  text: string;
}

interface SocialProof {
  testimonials: string[];
  caseStudies: string[];
  logos: string[];
  numbers: string[];
}

interface CtaSection {
  mainCtaText: string;
  surroundingCopy?: string;
}

interface RefinedHeadlines {
  hero: string[];
  problem: string[];
  solution: string[];
}

interface RefinedBodyCopy {
  hero: string;
  problem: string;
  solution: string;
}

// --- New Interfaces for Added Steps ---

export interface Exclusivity {
  isLimited: boolean | null;
  limitReason: string;
  limitNumber: number | null;
  urgencySignal: string;
}

export interface Bonus {
  id: string;
  name: string;
  description: string;
  value?: number; // Optional perceived value
}

export interface ProofItem {
  id: string;
  type: 'testimonial' | 'caseStudy' | 'dataPoint' | 'logo';
  content: string; // Could be text, URL for logo/case study link
  source?: string; // e.g., Customer name, publication
}

export interface LandingPageSummary {
  headline: string;
  subheadline: string;
  keyPoints: string[];
  callToAction: string;
  analysis: string; // AI-generated analysis
  messagingDetails: string; // Key messaging points
  nextSteps: string[]; // Suggested next actions
}

// --- End New Interfaces ---


// Scorecard item for the Analysis component
interface ScorecardItem {
  item: string;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  justification: string;
}

interface ProcessingState {
  userSuccess: boolean;
  topResults: boolean;
  advantages: boolean;
  risks: boolean;
  assurances: boolean;
  heroSection: boolean;
  featuresSection: boolean;
  problemSection: boolean;
  solutionSection: boolean;
  riskReversals: boolean;
  ctaSection: boolean;
  headlinesSection: boolean;
  bodyCopySection: boolean;
  socialProof: boolean;
  valueProposition: boolean; // Added
}

// Define missing types simply locally
export interface AISuggestion {
  id: string;
  type: string; // Keep it simple
  text: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ConversationalCheckpoint {
  id: string;
  type: string; // Keep it simple
  triggerCondition: string;
  message: string;
  suggestions: AISuggestion[];
  createdAt: Date;
}

// --- State Structure ---
interface OfferStateData {
  title: string;
  websiteUrl: string;
  initialContext: InitialContext;
  websiteScraping: WebsiteScrapingData;
  contextChat: ContextChat;
  // offerRating: number | null; // Removed
  userSuccess: UserSuccess;
  topResults: TopResults;
  advantages: Advantage[];
  risks: Risk[];
  assurances: Assurance[];
  heroSection: HeroSection;
  featuresSection: FeaturesSection;
  problemSection: ProblemSection;
  solutionSection: SolutionSection;
  riskReversals: RiskReversal[];
  socialProof: SocialProof;
  ctaSection: CtaSection;
  refinedHeadlines: RefinedHeadlines;
  refinedBodyCopy: RefinedBodyCopy;
  aestheticsChecklistCompleted: boolean;
  processingState: ProcessingState;
  underlyingResult: string; // Added
  underlyingReasonBetter: string; // Added
  offerCanvasConfirmed: boolean; // Added
  valueProposition: { // Added
    suggestions: string[];
    selected: string[]; 
  };
  
  aiSuggestions: AISuggestion[]; // Use local type
  conversationalCheckpoints: ConversationalCheckpoint[]; // Use local type
  activeCheckpoint: string | null;
  
  // Analysis data
  offerScorecard: ScorecardItem[] | null;
  offerAnalysisFeedback: string | null;
  suggestedNextSteps: string[] | null;
  isAnalyzingOffer: boolean;
  analysisError: string | null;

  // Added State Properties
  exclusivity: Exclusivity;
  bonuses: Bonus[];
  topProof: ProofItem[];
  landingPageSummary: LandingPageSummary | null;
}

interface OfferState extends OfferStateData {
  // Actions
  setTitle: (title: string) => void;
  setWebsiteUrl: (url: string) => void;
  setInitialContext: (field: keyof InitialContext, value: string) => void;
  startWebsiteScraping: (url: string) => Promise<void>;
  refreshScrapingStatus: (scrapingId: string) => Promise<void>;
  
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  
  // setOfferRating: (rating: number) => void; // Removed
  setUserSuccess: (statement: string) => void;
  setTopResults: (results: TopResults) => void;
  
  // Advantages
  addAdvantage: (text: string, description?: string) => void;
  updateAdvantage: (id: string, advantage: Partial<Advantage>) => void;
  removeAdvantage: (id: string) => void;
  
  // Risks
  addRisk: (text: string) => void;
  updateRisk: (id: string, text: string) => void;
  removeRisk: (id: string) => void;
  
  // Assurances
  addAssurance: (riskId: string, text: string) => void;
  updateAssurance: (id: string, assurance: Partial<Assurance>) => void;
  removeAssurance: (id: string) => void;
  
  // Hero Section
  setHeroSection: (heroSection: Partial<HeroSection>) => void;
  
  // Features Section
  setFeaturesSection: (featuresSection: Partial<FeaturesSection>) => void;
  
  // Problem Section
  setProblemSection: (problemSection: Partial<ProblemSection>) => void;
  
  // Solution Section
  addSolutionStep: (title: string, description: string) => void;
  updateSolutionStep: (id: string, step: Partial<SolutionStep>) => void;
  removeSolutionStep: (id: string) => void;
  
  // Risk Reversals
  addRiskReversal: (riskId: string, text: string) => void;
  updateRiskReversal: (id: string, reversal: Partial<RiskReversal>) => void;
  removeRiskReversal: (id: string) => void;
  
  // Social Proof
  addSocialProof: (type: keyof SocialProof, text: string) => void;
  removeSocialProof: (type: keyof SocialProof, index: number) => void;
  
  // CTA Section
  setCtaSection: (ctaSection: Partial<CtaSection>) => void;
  
  // Headlines
  addHeadline: (type: keyof RefinedHeadlines, headline: string) => void;
  removeHeadline: (type: keyof RefinedHeadlines, index: number) => void;
  
  // Body Copy
  setBodyCopy: (type: keyof RefinedBodyCopy, text: string) => void;
  
  // Aesthetics
  setAestheticsChecklistCompleted: (completed: boolean) => void;
  
  // Processing State
  setProcessing: (key: keyof ProcessingState, isProcessing: boolean) => void;
  
  // Analysis actions
  runFinalAnalysis: () => void;
  setOfferScorecard: (scorecard: ScorecardItem[]) => void;
  setOfferAnalysisFeedback: (feedback: string) => void;
  setSuggestedNextSteps: (steps: string[]) => void;
  setIsAnalyzingOffer: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  
  addAISuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => void;
  removeAISuggestion: (id: string) => void;
  addConversationalCheckpoint: (checkpoint: Omit<ConversationalCheckpoint, 'id' | 'createdAt'>) => void;
  setActiveCheckpoint: (id: string | null) => void;
  setUnderlyingResult: (text: string) => void; // Added
  setUnderlyingReasonBetter: (text: string) => void; // Added
  setValueProposition: (valuePropState: { suggestions: string[]; selected: string[] }) => void; // Added
  setOfferCanvasConfirmed: (confirmed: boolean) => void; // Added

  // Exclusivity Actions
  setExclusivity: (exclusivity: Partial<Exclusivity>) => void; // Added

  // Bonus Actions
  addBonus: (bonus: Omit<Bonus, 'id'>) => void; // Added
  updateBonus: (id: string, bonus: Partial<Bonus>) => void; // Added
  removeBonus: (id: string) => void; // Added

  // Top Proof Actions
  addTopProof: (proof: Omit<ProofItem, 'id'>) => void; // Added
  updateTopProof: (id: string, proof: Partial<ProofItem>) => void; // Added
  removeTopProof: (id: string) => void; // Added

  // Landing Page Summary Action
  setLandingPageSummary: (summary: LandingPageSummary | null) => void; // Added

  // Reset
  resetState: () => void;
}

// Initial state
export const initialState: OfferStateData = { // Export initialState
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
    error: null
  },
  contextChat: {
    messages: [],
    lastUpdated: null
  },
  // offerRating: null, // Removed
  userSuccess: { statement: '' },
  topResults: { 
    tangible: '', 
    intangible: '', 
    improvement: '' 
  },
  advantages: [],
  risks: [],
  assurances: [],
  heroSection: {
    tagline: '',
    subCopy: '',
    ctaText: '',
  },
  featuresSection: {
    title: 'Why Choose Our Solution',
    description: 'Our platform is designed to help you achieve better results with less effort.',
    features: [],
  },
  problemSection: {
    alternativesProblems: '',
    underlyingProblem: '',
  },
  solutionSection: {
    steps: [],
  },
  riskReversals: [],
  socialProof: {
    testimonials: [],
    caseStudies: [],
    logos: [],
    numbers: [],
  },
  ctaSection: {
    mainCtaText: '',
  },
  refinedHeadlines: {
    hero: [],
    problem: [],
    solution: [],
  },
  refinedBodyCopy: {
    hero: '',
    problem: '',
    solution: '',
  },
  aestheticsChecklistCompleted: false,
  
  // Analysis state
  offerScorecard: null,
  offerAnalysisFeedback: null,
  suggestedNextSteps: null,
  isAnalyzingOffer: false,
  analysisError: null,
  
  processingState: {
    userSuccess: false,
    topResults: false,
    advantages: false,
    risks: false,
    assurances: false,
    heroSection: false,
    featuresSection: false,
    problemSection: false,
    solutionSection: false,
    riskReversals: false,
    ctaSection: false,
    headlinesSection: false,
    bodyCopySection: false,
    socialProof: false,
    valueProposition: false, // Added
  },
  
  aiSuggestions: [], 
  conversationalCheckpoints: [], 
  activeCheckpoint: null,
  underlyingResult: '', // Added
  underlyingReasonBetter: '', // Added
  offerCanvasConfirmed: false, // Added
  valueProposition: { suggestions: [], selected: [] }, // Added

  // Added Initial State Values
  exclusivity: {
    isLimited: null,
    limitReason: '',
    limitNumber: null,
    urgencySignal: '',
  },
  bonuses: [],
  topProof: [],
  landingPageSummary: null,
};

export const useOfferStore = create<OfferState>()(
  devtools(
    (set): OfferState => ({
      ...initialState,
      
      // Title
      setTitle: (title) => set({ title }),
      
      setWebsiteUrl: (url) => set({ websiteUrl: url }),
      
      setInitialContext: (field, value) => set((state) => ({
        initialContext: { ...state.initialContext, [field]: value }
      })),
      
      startWebsiteScraping: async (url) => {
        set((state) => ({ websiteScraping: { ...initialState.websiteScraping, status: 'processing' } }), false, 'startWebsiteScraping/processing');
        try {
          const { scrapingId } = await scrapeWebsite(url);
          set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId, status: 'processing' } }), false, 'startWebsiteScraping/success');
        } catch (error) {
           set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId: state.websiteScraping.scrapingId, status: 'failed', error: error instanceof Error ? error.message : 'Failed to start' }}), false, 'startWebsiteScraping/error');
        }
      },
      
      refreshScrapingStatus: async (scrapingId) => {
        const idToCheck = scrapingId || useOfferStore.getState().websiteScraping.scrapingId;
        if (!idToCheck) { return; }
        const currentState = useOfferStore.getState().websiteScraping;
        try {
          const result = await getScrapingResult(idToCheck);
          if (!result) { return; } 
          if (result.status !== currentState.status || (result.status === 'completed' && !currentState.coreOffer)) {
              if (result.status === 'completed' && result.analysisResult?.findings) {
                const findings = result.analysisResult.findings;
                let processedKeyFeatures: string[] = [];
                if (findings.keyBenefits && Array.isArray(findings.keyBenefits)) {
                  processedKeyFeatures = findings.keyBenefits.map((item: any) => typeof item === 'string' ? item : (item?.benefit || '')).filter(Boolean);
                }
                set({
                  websiteScraping: {
                    scrapingId: idToCheck,
                    status: 'completed',
                    coreOffer: findings.coreOffer || '',
                    targetAudience: findings.targetAudience || '',
                    keyProblem: findings.problemSolved || '', 
                    valueProposition: findings.valueProposition || '',
                    keyFeatures: processedKeyFeatures, 
                    error: null 
                  }
                }, false, 'checkScrapingStatus/completed');
                console.log("[Store] Status set to COMPLETED.");
              } else if (result.status === 'failed') {
                set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId: idToCheck, status: 'failed', error: result.error || 'Failed' }}), false, 'checkScrapingStatus/failed');
                console.log("[Store] Status set to FAILED.");
              } else if (result.status === 'processing') {
                set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId: idToCheck, status: 'processing', error: null }}), false, 'checkScrapingStatus/processing');
                console.log("[Store] Status is PROCESSING.");
              } else { 
                  console.warn(`[Store] Received unexpected status: ${result.status}`);
                  set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId: idToCheck, status: 'failed', error: `Unexpected status: ${result.status}` }}), false, 'checkScrapingStatus/unexpected');
              }
          } else {
            console.log(`[Store] Status (${result.status}) hasn't changed. No update needed.`);
          }
        } catch (error) { 
             console.error('[Store] Error in checkScrapingStatus:', error);
             set((state) => ({ websiteScraping: { ...state.websiteScraping, scrapingId: idToCheck, status: 'failed', error: `Check failed: ${error instanceof Error ? error.message : 'Unknown'}` }}), false, 'checkScrapingStatus/error');
        }
      },
      
      addChatMessage: (message) => set((state) => ({
        contextChat: {
          ...state.contextChat,
          messages: [
            ...state.contextChat.messages,
            {
              id: generateUUID(),
              timestamp: new Date(),
              ...message
            }
          ],
          lastUpdated: new Date()
        }
      })),

      clearChatMessages: () => set({
        contextChat: { messages: [], lastUpdated: null }
      }),
      
      // setOfferRating: (rating) => set({ offerRating: rating }), // Removed
      
      setUserSuccess: (statement) => set({ 
        userSuccess: { statement } 
      }),
      
      setTopResults: (topResults) => set({ topResults }),
      
      // Advantages
      addAdvantage: (text, description) => set((state) => ({
        advantages: [...state.advantages, { id: generateUUID(), text, description }]
      })),
      
      updateAdvantage: (id, advantage) => set((state) => ({
        advantages: state.advantages.map(adv => 
          adv.id === id ? { ...adv, ...advantage } : adv
        )
      })),
      
      removeAdvantage: (id) => set((state) => ({
        advantages: state.advantages.filter(adv => adv.id !== id)
      })),
      
      // Risks
      addRisk: (text) => set((state) => ({
        risks: [...state.risks, { id: generateUUID(), text }]
      })),
      
      updateRisk: (id, text) => set((state) => ({
        risks: state.risks.map(risk => 
          risk.id === id ? { ...risk, text } : risk
        )
      })),
      
      removeRisk: (id) => set((state) => ({
        risks: state.risks.filter(risk => risk.id !== id),
        assurances: state.assurances.filter(a => a.riskId !== id),
        riskReversals: state.riskReversals.filter(rr => rr.riskId !== id),
      })),
      
      // Assurances
      addAssurance: (riskId, text) => set((state) => ({
        assurances: [...state.assurances, { id: generateUUID(), riskId, text }]
      })),
      
      updateAssurance: (id, assurance) => set((state) => ({
        assurances: state.assurances.map(a => 
          a.id === id ? { ...a, ...assurance } : a
        )
      })),
      
      removeAssurance: (id) => set((state) => ({
        assurances: state.assurances.filter(a => a.id !== id)
      })),
      
      // Hero Section
      setHeroSection: (heroSection) => set((state) => ({
        heroSection: { ...state.heroSection, ...heroSection }
      })),
      
      // Features Section
      setFeaturesSection: (featuresSection) => set((state) => ({
        featuresSection: { ...state.featuresSection, ...featuresSection }
      })),
      
      // Problem Section
      setProblemSection: (problemSection) => set((state) => ({
        problemSection: { ...state.problemSection, ...problemSection }
      })),
      
      // Solution Section
      addSolutionStep: (title, description) => set((state) => ({
        solutionSection: {
          ...state.solutionSection,
          steps: [...state.solutionSection.steps, { id: generateUUID(), title, description }]
        }
      })),
      
      updateSolutionStep: (id, step) => set((state) => ({
        solutionSection: {
          ...state.solutionSection,
          steps: state.solutionSection.steps.map(s => 
            s.id === id ? { ...s, ...step } : s
          )
        }
      })),
      
      removeSolutionStep: (id) => set((state) => ({
        solutionSection: {
          ...state.solutionSection,
          steps: state.solutionSection.steps.filter(s => s.id !== id)
        }
      })),
      
      // Risk Reversals
      addRiskReversal: (riskId, text) => set((state) => ({
        riskReversals: [...state.riskReversals, { id: generateUUID(), riskId, text }]
      })),
      
      updateRiskReversal: (id, reversal) => set((state) => ({
        riskReversals: state.riskReversals.map(rr => 
          rr.id === id ? { ...rr, ...reversal } : rr
        )
      })),
      
      removeRiskReversal: (id) => set((state) => ({
        riskReversals: state.riskReversals.filter(rr => rr.id !== id)
      })),
      
      // Social Proof
      addSocialProof: (type, text) => set((state) => ({
        socialProof: {
          ...state.socialProof,
          [type]: [...state.socialProof[type], text]
        }
      })),
      
      removeSocialProof: (type, index) => set((state) => ({
        socialProof: {
          ...state.socialProof,
          [type]: state.socialProof[type].filter((_, i) => i !== index)
        }
      })),
      
      // CTA Section
      setCtaSection: (ctaSection) => set((state) => ({
        ctaSection: { ...state.ctaSection, ...ctaSection }
      })),
      
      // Headlines
      addHeadline: (type, headline) => set((state) => ({
        refinedHeadlines: {
          ...state.refinedHeadlines,
          [type]: [...state.refinedHeadlines[type], headline]
        }
      })),
      
      removeHeadline: (type, index) => set((state) => ({
        refinedHeadlines: {
          ...state.refinedHeadlines,
          [type]: state.refinedHeadlines[type].filter((_, i) => i !== index)
        }
      })),
      
      // Body Copy
      setBodyCopy: (type, text) => set((state) => ({
        refinedBodyCopy: {
          ...state.refinedBodyCopy,
          [type]: text
        }
      })),
      
      // Aesthetics
      setAestheticsChecklistCompleted: (completed) => set({ aestheticsChecklistCompleted: completed }),
      
      // Processing State
      setProcessing: (key, isProcessing) => set((state) => ({
        processingState: { ...state.processingState, [key]: isProcessing }
      })),
      
      // Analysis actions
      runFinalAnalysis: () => set((state) => {
        console.log("Simulating final offer analysis...");
        set({ isAnalyzingOffer: true, analysisError: null });
        
        const scorecard: ScorecardItem[] = [
          { item: 'Clarity of Value Proposition', rating: state.valueProposition.selected.length > 0 ? 'Good' : 'Fair', justification: 'Based on selected value prop.' },
          { item: 'Strength of Top Results', rating: state.topResults.tangible ? 'Good' : 'Poor', justification: 'Tangible results provided.' },
          { item: 'Uniqueness of Advantages', rating: state.advantages.length >= 2 ? 'Good' : 'Fair', justification: 'Multiple advantages listed.' },
          { item: 'Risk Mitigation (Assurances)', rating: state.assurances.length >= state.risks.length ? 'Excellent' : 'Good', justification: 'Assurances address risks.' },
          { item: 'Risk Reversal Strength', rating: state.riskReversals.length > 0 ? 'Good' : 'Fair', justification: 'Risk reversals included.' },
          { item: 'Social Proof Presence', rating: state.socialProof.testimonials.length > 0 || state.socialProof.caseStudies.length > 0 ? 'Excellent' : 'Fair', justification: 'Testimonials or case studies present.' },
          { item: 'Call to Action Clarity', rating: state.ctaSection.mainCtaText ? 'Good' : 'Poor', justification: 'Main CTA defined.' },
        ];
        
        let feedback = "Overall, the offer structure is taking shape.\n";
        if (scorecard.some(item => item.rating === 'Poor' || item.rating === 'Fair')) {
          feedback += "Areas for improvement include: ";
          feedback += scorecard.filter(item => item.rating === 'Poor' || item.rating === 'Fair').map(item => item.item.toLowerCase()).join(', ') + ".\n";
        } else {
          feedback += "All core components seem well-defined.\n";
        }
        feedback += "Consider refining the headlines and body copy for maximum impact.";

        const nextSteps = [
          "Refine headlines for Hero, Problem, and Solution sections.",
          "Write compelling body copy for each landing page section.",
          "Review the aesthetics checklist for visual appeal.",
          "Share the generated offer canvas for feedback."
        ];

        setTimeout(() => {
          set({ 
            offerScorecard: scorecard, 
            offerAnalysisFeedback: feedback, 
            suggestedNextSteps: nextSteps,
            isAnalyzingOffer: false 
          });
        }, 3000); 
        
        return { processingState: state.processingState }; 
      }),
      
      setOfferScorecard: (scorecard) => set({ offerScorecard: scorecard }),
      
      setOfferAnalysisFeedback: (feedback) => set({ offerAnalysisFeedback: feedback }),
      
      setSuggestedNextSteps: (steps) => set({ suggestedNextSteps: steps }),
      
      setIsAnalyzingOffer: (isAnalyzing) => set({ isAnalyzingOffer: isAnalyzing }),
      
      setAnalysisError: (error) => set({ analysisError: error }),
      
      addAISuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => set((state) => ({ aiSuggestions: [ ...state.aiSuggestions, { id: generateUUID(), ...suggestion, createdAt: new Date() } ] })),
      
      removeAISuggestion: (id: string) => set((state) => ({ aiSuggestions: state.aiSuggestions.filter(s => s.id !== id) })),
      
      addConversationalCheckpoint: (checkpoint: Omit<ConversationalCheckpoint, 'id' | 'createdAt'>) => set((state) => ({ conversationalCheckpoints: [ ...state.conversationalCheckpoints, { id: generateUUID(), ...checkpoint, createdAt: new Date() } ] })),
      
      setActiveCheckpoint: (id: string | null) => set({ activeCheckpoint: id }),

      // Added Setters
      setUnderlyingResult: (text) => set({ underlyingResult: text }),
      setUnderlyingReasonBetter: (text) => set({ underlyingReasonBetter: text }),
      setValueProposition: (valuePropState) => set({ valueProposition: valuePropState }),
      setOfferCanvasConfirmed: (confirmed) => set({ offerCanvasConfirmed: confirmed }),
      // --- Added Actions ---

      setExclusivity: (exclusivity) => set((state) => ({
        exclusivity: { ...state.exclusivity, ...exclusivity }
      })),

      addBonus: (bonus) => set((state) => ({
        bonuses: [...state.bonuses, { ...bonus, id: generateUUID() }]
      })),

      updateBonus: (id, bonusUpdate) => set((state) => ({
        bonuses: state.bonuses.map(b => b.id === id ? { ...b, ...bonusUpdate } : b)
      })),

      removeBonus: (id) => set((state) => ({
        bonuses: state.bonuses.filter(b => b.id !== id)
      })),

      addTopProof: (proof) => set((state) => ({
        topProof: [...state.topProof, { ...proof, id: generateUUID() }]
      })),

      updateTopProof: (id, proofUpdate) => set((state) => ({
        topProof: state.topProof.map(p => p.id === id ? { ...p, ...proofUpdate } : p)
      })),

      removeTopProof: (id) => set((state) => ({
        topProof: state.topProof.filter(p => p.id !== id)
      })),

      setLandingPageSummary: (summary) => set({ landingPageSummary: summary }),

      // --- End Added Actions ---

      
      // Reset
      resetState: () => set(initialState)
    }),
    { name: 'offer-store' }
  )
);