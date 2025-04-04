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
}

interface OfferState {
  title: string;
  websiteUrl: string;
  initialContext: InitialContext;
  websiteScraping: WebsiteScrapingData;
  contextChat: ContextChat;
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
  
  aiSuggestions: AISuggestion[];
  conversationalCheckpoints: ConversationalCheckpoint[];
  activeCheckpoint: string | null;
  
  // Analysis data
  offerScorecard: ScorecardItem[] | null;
  offerAnalysisFeedback: string | null;
  suggestedNextSteps: string[] | null;
  isAnalyzingOffer: boolean;
  analysisError: string | null;
  
  // Actions
  setTitle: (title: string) => void;
  setWebsiteUrl: (url: string) => void;
  setInitialContext: (field: keyof InitialContext, value: string) => void;
  startWebsiteScraping: (url: string) => Promise<void>;
  checkScrapingStatus: (scrapingId: string) => Promise<void>;
  
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  
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
  
  // Reset
  resetState: () => void;
}

// Initial state
const initialState: Partial<OfferState> = {
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
  },
  
  aiSuggestions: [],
  conversationalCheckpoints: [],
  activeCheckpoint: null
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
        if (!url) return;
        
        set((state) => ({
          websiteScraping: {
            ...state.websiteScraping,
            status: 'processing',
            error: null
          }
        }));
        
        try {
          const { scrapingId } = await scrapeWebsite(url);
          
          set((state) => ({
            websiteScraping: {
              ...state.websiteScraping,
              scrapingId,
              status: 'processing'
            }
          }));
          
          setTimeout(() => {
            const get = useOfferStore.getState;
            get().checkScrapingStatus(scrapingId);
          }, 100);
        } catch (error) {
          set((state) => ({
            websiteScraping: {
              ...state.websiteScraping,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Failed to start website scraping'
            }
          }));
        }
      },
      
      checkScrapingStatus: async (scrapingId) => {
        if (!scrapingId) return;
        
        try {
          const result = await getScrapingResult(scrapingId);
          
          if (result) {
            if (result.status === 'completed' && result.analysisResult?.findings) {
              set({
                websiteScraping: {
                  scrapingId,
                  status: 'completed',
                  coreOffer: result.analysisResult.findings.coreOffer || '',
                  targetAudience: result.analysisResult.findings.targetAudience || '',
                  keyProblem: result.analysisResult.findings.problemSolved || '',
                  valueProposition: result.analysisResult.findings.valueProposition || '',
                  keyFeatures: result.analysisResult.findings.keyBenefits || [],
                  error: null
                }
              });
            } else if (result.status === 'failed') {
              set((state) => ({
                websiteScraping: {
                  ...state.websiteScraping,
                  status: 'failed',
                  error: result.error || 'Website scraping failed'
                }
              }));
            } else if (result.status === 'processing') {
              setTimeout(() => {
                import('../services/webscraping').then(({ getScrapingResult }) => {
                  getScrapingResult(scrapingId).then(updatedResult => {
                    if (updatedResult) {
                      const get = useOfferStore.getState;
                      get().checkScrapingStatus(scrapingId);
                    }
                  });
                });
              }, 5000); // Poll every 5 seconds
            }
          }
        } catch (error) {
          console.error('Error checking scraping status:', error);
        }
      },
      
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
      
      addChatMessage: (message) => set((state) => ({
        contextChat: {
          messages: [
            ...state.contextChat.messages,
            {
              id: crypto.randomUUID(),
              ...message,
              timestamp: new Date()
            }
          ],
          lastUpdated: new Date()
        }
      })),
      
      clearChatMessages: () => set({
        contextChat: {
          messages: [],
          lastUpdated: null
        }
      }),
      
      // Processing State
      setProcessing: (key, isProcessing) => set((state) => ({
        processingState: {
          ...state.processingState,
          [key]: isProcessing
        }
      })),
      
      // Analysis actions
      runFinalAnalysis: () => set((state) => {
        // Set analyzing state to true
        set({ isAnalyzingOffer: true, analysisError: null });
        
        // In production, this would call the AI service:
        /*
        import { analyzeOffer } from '../services/ai';
        
        // Get current state data
        const analysisData = {
          title: state.title,
          userSuccess: state.userSuccess,
          topResults: state.topResults,
          advantages: state.advantages,
          risks: state.risks,
          assurances: state.assurances,
          heroSection: state.heroSection,
          featuresSection: state.featuresSection,
          problemSection: state.problemSection, 
          solutionSection: state.solutionSection,
          socialProof: state.socialProof,
          ctaSection: state.ctaSection
        };
        
        // Call API
        analyzeOffer(analysisData)
          .then(response => {
            set({ 
              offerScorecard: response.scorecard,
              offerAnalysisFeedback: response.feedback,
              suggestedNextSteps: response.nextSteps,
              isAnalyzingOffer: false
            });
          })
          .catch(error => {
            set({ 
              isAnalyzingOffer: false, 
              analysisError: error instanceof Error ? error.message : 'An error occurred during analysis' 
            });
          });
        */
        
        // For demo: Simulate API call with setTimeout
        setTimeout(() => {
          try {
            // Mock scorecard data (in production, this would come from API)
            const scorecard: ScorecardItem[] = [
              {
                item: 'Result Clarity',
                rating: 'Good',
                justification: 'Main result is clearly articulated but could be more specific with metrics.'
              },
              {
                item: 'Advantage Clarity',
                rating: 'Fair',
                justification: 'Advantages are listed but unique differentiation could be stronger.'
              },
              {
                item: 'Risk Reduction',
                rating: 'Excellent',
                justification: 'All major objections addressed with compelling assurances.'
              },
              {
                item: 'Hero Communication',
                rating: 'Good',
                justification: 'Tagline communicates value but could be more attention-grabbing.'
              },
              {
                item: 'Problem Resonance',
                rating: 'Good',
                justification: 'Underlying problem will resonate with target audience.'
              },
              {
                item: 'Solution Completeness',
                rating: 'Fair',
                justification: 'Solution steps need more detail on implementation specifics.'
              },
              {
                item: 'Trust Elements',
                rating: 'Poor',
                justification: 'More specific social proof needed with quantifiable results.'
              },
              {
                item: 'Call to Action',
                rating: 'Good',
                justification: 'CTA is clear but could create more urgency.'
              },
              {
                item: 'Visual Design',
                rating: 'Excellent',
                justification: 'Aesthetics checklist completed with attention to all key design principles.'
              }
            ];
            
            // Mock feedback
            const feedback = `
### Key Strengths:
1. **Strong Risk Mitigation** - Your offer addresses potential objections thoroughly with well-crafted assurances.
2. **Clear Visual Design** - The attention to aesthetics principles will help the offer appear professional and trustworthy.
3. **Good Problem Framing** - Your problem statement effectively frames the pain points that will resonate with your audience.

### Areas for Improvement:
1. **Social Proof Enhancement** - Adding more specific, results-oriented testimonials would significantly strengthen credibility.
2. **Solution Specificity** - Your solution steps would benefit from more concrete implementation details.
3. **Advantage Differentiation** - Make your unique advantages more distinct from competitors' offerings.
            `;
            
            // Mock next steps
            const nextSteps = [
              "Test your headline with 5-10 target customers to gauge initial reaction and comprehension",
              "Create two versions of your solution section (one feature-focused, one outcome-focused) to A/B test",
              "Gather 3-5 specific customer testimonials that include quantifiable results",
              "Refine your CTA with urgency elements and test response rates",
              "Conduct a competitive analysis to better articulate your unique advantages"
            ];
            
            // Update state with analysis results
            set({ 
              offerScorecard: scorecard,
              offerAnalysisFeedback: feedback,
              suggestedNextSteps: nextSteps,
              isAnalyzingOffer: false
            });
          } catch (error) {
            // Handle errors
            set({ 
              isAnalyzingOffer: false, 
              analysisError: error instanceof Error ? error.message : 'An error occurred during analysis' 
            });
          }
        }, 3000); // 3 second simulated API delay
        
        return { processingState: state.processingState };
      }),
      
      setOfferScorecard: (scorecard) => set({ offerScorecard: scorecard }),
      
      setOfferAnalysisFeedback: (feedback) => set({ offerAnalysisFeedback: feedback }),
      
      setSuggestedNextSteps: (steps) => set({ suggestedNextSteps: steps }),
      
      setIsAnalyzingOffer: (isAnalyzing) => set({ isAnalyzingOffer: isAnalyzing }),
      
      setAnalysisError: (error) => set({ analysisError: error }),
      
      addAISuggestion: (suggestion) => set((state) => ({
        aiSuggestions: [
          ...state.aiSuggestions,
          {
            id: crypto.randomUUID(),
            ...suggestion,
            createdAt: new Date()
          }
        ]
      })),
      
      removeAISuggestion: (id) => set((state) => ({
        aiSuggestions: state.aiSuggestions.filter(suggestion => suggestion.id !== id)
      })),
      
      addConversationalCheckpoint: (checkpoint) => set((state) => ({
        conversationalCheckpoints: [
          ...state.conversationalCheckpoints,
          {
            id: crypto.randomUUID(),
            ...checkpoint,
            createdAt: new Date()
          }
        ]
      })),
      
      setActiveCheckpoint: (id) => set({
        activeCheckpoint: id
      }),
      
      // Reset
      resetState: () => set(initialState)
    }),
    { name: 'offer-store' }
  )
);                    