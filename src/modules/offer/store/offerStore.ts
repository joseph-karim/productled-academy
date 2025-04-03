import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateUUID } from '../utils/uuid';

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
}

interface OfferState {
  title: string;
  offerRating: number | null;
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
  
  // Actions
  setTitle: (title: string) => void;
  setOfferRating: (rating: number) => void;
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
  
  // Reset
  resetState: () => void;
}

// Initial state
const initialState = {
  title: 'Untitled Offer',
  offerRating: null,
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
  }
};

export const useOfferStore = create<OfferState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Title
      setTitle: (title) => set({ title }),
      
      // Offer Rating
      setOfferRating: (offerRating) => set({ offerRating }),
      
      // User Success
      setUserSuccess: (statement) => set({ 
        userSuccess: { statement } 
      }),
      
      // Top Results
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
        // Also remove associated assurances and risk reversals
        assurances: state.assurances.filter(assurance => assurance.riskId !== id),
        riskReversals: state.riskReversals.filter(reversal => reversal.riskId !== id)
      })),
      
      // Assurances
      addAssurance: (riskId, text) => set((state) => ({
        assurances: [...state.assurances, { id: generateUUID(), riskId, text }]
      })),
      
      updateAssurance: (id, assurance) => set((state) => ({
        assurances: state.assurances.map(ass => 
          ass.id === id ? { ...ass, ...assurance } : ass
        )
      })),
      
      removeAssurance: (id) => set((state) => ({
        assurances: state.assurances.filter(ass => ass.id !== id)
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
          steps: [...state.solutionSection.steps, { id: generateUUID(), title, description }]
        }
      })),
      
      updateSolutionStep: (id, step) => set((state) => ({
        solutionSection: {
          steps: state.solutionSection.steps.map(s => 
            s.id === id ? { ...s, ...step } : s
          )
        }
      })),
      
      removeSolutionStep: (id) => set((state) => ({
        solutionSection: {
          steps: state.solutionSection.steps.filter(s => s.id !== id)
        }
      })),
      
      // Risk Reversals
      addRiskReversal: (riskId, text) => set((state) => ({
        riskReversals: [...state.riskReversals, { id: generateUUID(), riskId, text }]
      })),
      
      updateRiskReversal: (id, reversal) => set((state) => ({
        riskReversals: state.riskReversals.map(rev => 
          rev.id === id ? { ...rev, ...reversal } : rev
        )
      })),
      
      removeRiskReversal: (id) => set((state) => ({
        riskReversals: state.riskReversals.filter(rev => rev.id !== id)
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
      setAestheticsChecklistCompleted: (completed) => set({
        aestheticsChecklistCompleted: completed
      }),
      
      // Processing State
      setProcessing: (key, isProcessing) => set((state) => ({
        processingState: {
          ...state.processingState,
          [key]: isProcessing
        }
      })),
      
      // Reset
      resetState: () => set(initialState)
    }),
    { name: 'offer-store' }
  )
); 