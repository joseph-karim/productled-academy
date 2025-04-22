import React, { useState, useRef, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Send, Loader2, Bot } from 'lucide-react';
import { generateChatResponse, WebsiteFindings } from '../services/ai/contextChat';
import { generateSuggestions } from '../services/ai/contextSuggestions';
import { InitialContext } from '../services/ai/types';

interface Suggestion {
  text: string;
  reasoning?: string;
  field: string;
}

interface PersistentOfferChatProps {
  currentStep: number;
}

export function PersistentOfferChat({ currentStep }: PersistentOfferChatProps) {
  const {
    contextChat,
    addChatMessage,
    clearChatMessages,
    setCoreOfferNucleus,
    coreOfferNucleus,
    websiteScraping,
    initialContext,
    onboardingSteps,
    exclusivity,
    bonuses,
    heroSection,
    problemSection,
    solutionSection,
    riskReversals,
    ctaSection,
    transcriptData
  } = useOfferStore();

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  // Get the initial load state from the store
  const isInitialLoad = useOfferStore((state) => state.contextChatInitialLoad);
  // Create a function to update the initial load state
  const setIsInitialLoad = (value: boolean) => {
    useOfferStore.getState().setContextChatInitialLoad(value);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to create website findings object with proper null/undefined handling
  const createWebsiteFindings = (scrapingData: typeof websiteScraping): WebsiteFindings | null => {
    if (scrapingData.status !== 'completed') {
      console.log('Scraping data status is not completed:', scrapingData.status);
      return null;
    }

    // Log the scraping data to debug
    console.log('Creating website findings from scraping data:', scrapingData);

    // Create a base findings object with default values
    let baseFindings: WebsiteFindings = {
      coreOffer: '',
      targetAudience: '',
      problemSolved: '',
      keyBenefits: [],
      valueProposition: '',
      desiredResult: '',
      keyAdvantage: '',
      biggestBarrier: '',
      assurance: '',
      cta: null,
      tone: null,
      missingInfo: null,
      // Initialize suggestion arrays
      targetAudienceSuggestions: [],
      desiredResultSuggestions: [],
      keyAdvantageSuggestions: [],
      biggestBarrierSuggestions: [],
      assuranceSuggestions: []
    };

    // Check if we have analysis results
    if (scrapingData.analysisResult?.findings) {
      const findings = scrapingData.analysisResult.findings;
      console.log('Found analysis results:', findings);

      // Update the base findings with values from the analysis
      baseFindings = {
        ...baseFindings,
        coreOffer: findings.coreOffer || '',
        targetAudience: findings.targetAudience || '',
        problemSolved: findings.problemSolved || findings.biggestBarrier || '',
        keyBenefits: Array.isArray(findings.keyBenefits)
          ? findings.keyBenefits.map(benefit =>
              typeof benefit === 'string' ? benefit : (benefit?.benefit || '')
            ).filter(Boolean)
          : [],
        valueProposition: findings.valueProposition || '',
        desiredResult: findings.desiredResult || '',
        keyAdvantage: findings.keyAdvantage || '',
        biggestBarrier: findings.biggestBarrier || '',
        assurance: findings.assurance || ''
      };

      // Add suggestion arrays if they exist
      if (findings.targetAudienceSuggestions || findings.desiredResultSuggestions ||
          findings.keyAdvantageSuggestions || findings.biggestBarrierSuggestions ||
          findings.assuranceSuggestions) {
        console.log('Using pre-formatted suggestions');
        return {
          ...baseFindings,
          targetAudienceSuggestions: findings.targetAudienceSuggestions || [],
          desiredResultSuggestions: findings.desiredResultSuggestions || [],
          keyAdvantageSuggestions: findings.keyAdvantageSuggestions || [],
          biggestBarrierSuggestions: findings.biggestBarrierSuggestions || [],
          assuranceSuggestions: findings.assuranceSuggestions || []
        };
      }

      // If we don't have pre-formatted suggestions, try to create them from arrays
      if (Array.isArray(findings.targetAudience) || Array.isArray(findings.desiredResult) ||
          Array.isArray(findings.keyAdvantage) || Array.isArray(findings.biggestBarrier) ||
          Array.isArray(findings.assurance)) {
        console.log('Creating suggestions from arrays');
        return {
          ...baseFindings,
          // Use the first item from arrays as the main value
          targetAudience: Array.isArray(findings.targetAudience) ? findings.targetAudience[0] || '' : findings.targetAudience || '',
          desiredResult: Array.isArray(findings.desiredResult) ? findings.desiredResult[0] || '' : findings.desiredResult || '',
          keyAdvantage: Array.isArray(findings.keyAdvantage) ? findings.keyAdvantage[0] || '' : findings.keyAdvantage || '',
          biggestBarrier: Array.isArray(findings.biggestBarrier) ? findings.biggestBarrier[0] || '' : findings.biggestBarrier || '',
          assurance: Array.isArray(findings.assurance) ? findings.assurance[0] || '' : findings.assurance || '',
          // Store all suggestions for later use
          targetAudienceSuggestions: Array.isArray(findings.targetAudience) ? findings.targetAudience : [findings.targetAudience].filter(Boolean),
          desiredResultSuggestions: Array.isArray(findings.desiredResult) ? findings.desiredResult : [findings.desiredResult].filter(Boolean),
          keyAdvantageSuggestions: Array.isArray(findings.keyAdvantage) ? findings.keyAdvantage : [findings.keyAdvantage].filter(Boolean),
          biggestBarrierSuggestions: Array.isArray(findings.biggestBarrier) ? findings.biggestBarrier : [findings.biggestBarrier].filter(Boolean),
          assuranceSuggestions: Array.isArray(findings.assurance) ? findings.assurance : [findings.assurance].filter(Boolean),
        };
      }

      // If we don't have arrays, just return the base findings
      console.log('Using basic findings format');
      return baseFindings;
    }

    // If we don't have analysis results, check if we have any meaningful data in the scraping data itself
    const hasData = !!scrapingData.coreOffer || !!scrapingData.targetAudience ||
                   !!scrapingData.keyProblem || !!scrapingData.valueProposition ||
                   (Array.isArray(scrapingData.keyFeatures) && scrapingData.keyFeatures.length > 0);

    // If we have data in the scraping data itself, create a findings object from it
    console.log('Creating findings from scraping data directly');
    return {
      coreOffer: scrapingData.coreOffer || '',
      targetAudience: scrapingData.targetAudience || '',
      problemSolved: scrapingData.keyProblem || '',
      keyBenefits: Array.isArray(scrapingData.keyFeatures) ? scrapingData.keyFeatures : [],
      valueProposition: scrapingData.valueProposition || '',
      desiredResult: '',
      keyAdvantage: '',
      biggestBarrier: '',
      assurance: '',
      cta: null,
      tone: null,
      missingInfo: null
    };


  };

  // Use the helper function to create the initial websiteFindings
  const getWebsiteFindings = (): WebsiteFindings | null => {
    // Always get the latest data from the store to ensure we have the most up-to-date information
    const latestScrapingData = useOfferStore.getState().websiteScraping;
    console.log('Getting latest website findings from store:', latestScrapingData);
    return createWebsiteFindings(latestScrapingData);
  };

  // Field display names for better UX
  const fieldDisplayNames: Record<string, string> = {
    targetAudience: 'Target Audience',
    desiredResult: 'Desired Result',
    keyAdvantage: 'Key Advantage',
    biggestBarrier: 'Biggest Barrier',
    assurance: 'Assurance',
    onboardingStep: 'Signature Approach Step',
    setupStep: 'Setup/Migration Step',
    advantageStep: 'Key Advantage Step',
    uniqueStep: 'Unique Capability Step',
    fasterStep: 'Time-Saving Step',
    analyticsStep: 'Analytics/Results Step',
    exclusivity: 'Exclusivity',
    bonus: 'Bonus',
    heroSection: 'Hero Section',
    problemSection: 'Problem Section',
    solutionSection: 'Solution Section',
    riskReversal: 'Risk Reversal',
    ctaSection: 'CTA Section'
  };

  // Auto-scroll to bottom only when user sends a message or when AI is responding
  useEffect(() => {
    // Only auto-scroll if the last message is from the user or AI
    const lastMessage = contextChat.messages[contextChat.messages.length - 1];
    if (messagesEndRef.current && lastMessage && (lastMessage.sender === 'user' || isProcessing)) {
      // Use a more controlled scroll that doesn't affect the whole page
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [contextChat.messages, isProcessing]);

  // Listen for scraping completion event
  useEffect(() => {
    const handleScrapingCompleted = (event: Event) => {
      console.log('PersistentOfferChat: Received scraping-completed event');

      // Give the store time to update with the scraping results
      setTimeout(() => {
        // Force refresh the websiteFindings object using our helper function
        const updatedWebsiteFindings = getWebsiteFindings();
        console.log('PersistentOfferChat: Updated websiteFindings after delay:', updatedWebsiteFindings);

        if (updatedWebsiteFindings) {
          // Reset initial load to trigger welcome message with website data
          setIsInitialLoad(true);

          // Generate welcome message
          generateInitialWelcomeMessage();
        } else {
          console.log('PersistentOfferChat: No website findings available after scraping completed');
          // Try one more time with a longer delay
          setTimeout(() => {
            const finalAttemptFindings = getWebsiteFindings();
            console.log('PersistentOfferChat: Final attempt websiteFindings:', finalAttemptFindings);

            if (finalAttemptFindings) {
              setIsInitialLoad(true);
              generateInitialWelcomeMessage();
            } else {
              // Add a fallback message if we still can't get the findings
              addChatMessage({
                sender: 'ai',
                content: "I've analyzed your website, but I'm having trouble processing the results. Let me know if you'd like to try again or if you'd prefer to tell me about your offer directly."
              });
            }
          }, 2000);
        }
      }, 1000); // Delay to ensure store is updated
    };

    // Listen for the launch-ai-chat event
    const handleLaunchAiChat = (event: CustomEvent) => {
      console.log('PersistentOfferChat: Received launch-ai-chat event', event.detail);

      // Check if we have findings
      if (event.detail?.hasFindings) {
        console.log('PersistentOfferChat: Event indicates findings are available');

        // Give the store time to update with the scraping results
        setTimeout(() => {
          // Force refresh the websiteFindings object using our helper function
          const updatedWebsiteFindings = getWebsiteFindings();
          console.log('PersistentOfferChat: Website findings after launch-ai-chat:', updatedWebsiteFindings);

          if (updatedWebsiteFindings) {
            // Reset initial load to trigger welcome message with website data
            setIsInitialLoad(true);

            // Generate welcome message
            generateInitialWelcomeMessage();

            // After welcome message, generate suggestions for target audience
            setTimeout(() => {
              generateContextAwareSuggestions('targetAudience');
            }, 1500);
          }
        }, 500);
      } else {
        // If no findings, just reset the chat
        clearChatMessages();
        addChatMessage({
          sender: 'ai',
          content: "Hi! I'm your AI Offer Assistant. I'll help you define your core offer using the R-A-R-A framework. Let's start with your Target Audience. Who specifically needs your solution?"
        });
      }
    };

    window.addEventListener('scraping-completed', handleScrapingCompleted);
    window.addEventListener('launch-ai-chat', handleLaunchAiChat as EventListener);

    return () => {
      window.removeEventListener('scraping-completed', handleScrapingCompleted);
      window.removeEventListener('launch-ai-chat', handleLaunchAiChat as EventListener);
    };
  }, []);

  // Generate initial welcome message based on the current step
  useEffect(() => {
    if (isInitialLoad) {
      generateInitialWelcomeMessage();
      setIsInitialLoad(false);

      // If we're in the Core Offer step and have website data or transcript data,
      // automatically start the RARA process by generating suggestions for the first field
      if (currentStep === 0) {
        const hasWebsiteData = websiteScraping.status === 'completed' && getWebsiteFindings() !== null;
        const hasTranscriptData = transcriptData !== null;
        const hasCompletedCoreOffer = coreOfferNucleus.targetAudience &&
                                     coreOfferNucleus.desiredResult &&
                                     coreOfferNucleus.keyAdvantage &&
                                     coreOfferNucleus.biggestBarrier &&
                                     coreOfferNucleus.assurance;

        if ((hasWebsiteData || hasTranscriptData) && !hasCompletedCoreOffer) {
          // Always start with target audience suggestions after welcome message
          // Wait a bit for the welcome message to be displayed
          setTimeout(() => {
            // Always start with target audience regardless of what's already filled
            // This ensures we follow the sequential approach
            generateContextAwareSuggestions('targetAudience');
          }, 1500);
        }
      }
    }
  }, [currentStep, isInitialLoad]);

  // Function to generate the initial welcome message
  const generateInitialWelcomeMessage = () => {
    // Clear previous messages if switching steps
    if (contextChat.messages.length > 0) {
      clearChatMessages();
    }

    // Add initial welcome message based on the current step
    let welcomeMessage = '';

    // Get the latest state directly from the store
    const currentState = useOfferStore.getState();

    // Get a fresh websiteFindings object using our helper function
    const currentWebsiteFindings = getWebsiteFindings();
    console.log('generateInitialWelcomeMessage - currentWebsiteFindings:', currentWebsiteFindings);

    // Check if we have website data or transcript data
    // First check if the scraping status is completed
    const isScrapingCompleted = currentState.websiteScraping.status === 'completed';
    console.log('Scraping status:', currentState.websiteScraping.status);

    // Then check if we have actual findings data
    const hasWebsiteData = isScrapingCompleted && currentWebsiteFindings !== null;
    console.log('Has website data:', hasWebsiteData, 'Scraping completed:', isScrapingCompleted, 'Has findings:', currentWebsiteFindings !== null);
    const hasTranscriptData = currentState.transcriptData !== null;
    const hasCompletedCoreOffer = currentState.coreOfferNucleus.targetAudience &&
                                 currentState.coreOfferNucleus.desiredResult &&
                                 currentState.coreOfferNucleus.keyAdvantage &&
                                 currentState.coreOfferNucleus.biggestBarrier &&
                                 currentState.coreOfferNucleus.assurance;

    // Check if we have the improved analysis with RARA framework fields
    const hasImprovedAnalysis = currentWebsiteFindings &&
                              (currentWebsiteFindings.desiredResult ||
                               currentWebsiteFindings.keyAdvantage ||
                               currentWebsiteFindings.biggestBarrier ||
                               currentWebsiteFindings.assurance);

    // Step 0: Define Core Offer Nucleus
    if (currentStep === 0) {
      if (!hasWebsiteData && !hasTranscriptData) {
        welcomeMessage = "Welcome to the ProductLed Offer Assistant! I'm here to help you craft an irresistible offer using the R-A-R-A framework (Result-Advantage-Risk-Assurance).\n\nTo get started, I recommend either entering your website URL or uploading a customer call transcript using the tabs on the right. This will help me provide more relevant suggestions.\n\nAlternatively, you can simply tell me about your product or service in 1-3 sentences, and I'll guide you through defining your core offer nucleus step-by-step.";
      } else if (hasWebsiteData && !hasTranscriptData && !hasCompletedCoreOffer) {
        if (hasImprovedAnalysis) {
          // Use the improved analysis results in the welcome message
          // Check if we have the new array format for suggestions
          const hasArraySuggestions = currentWebsiteFindings.targetAudienceSuggestions ||
                                    currentWebsiteFindings.desiredResultSuggestions ||
                                    currentWebsiteFindings.keyAdvantageSuggestions ||
                                    currentWebsiteFindings.biggestBarrierSuggestions ||
                                    currentWebsiteFindings.assuranceSuggestions;

          if (hasArraySuggestions) {
            // Create a more personalized message that includes the core offer
            let coreOfferMessage = '';
            if (currentWebsiteFindings.coreOffer) {
              coreOfferMessage = `\n\nBased on my analysis, your core offer appears to be: "${currentWebsiteFindings.coreOffer}".`;
            }

            welcomeMessage = `Thanks for providing your website information! I've analyzed your site and extracted key insights to help you define your core offer nucleus using the R-A-R-A framework.${coreOfferMessage}\n\nHere's what I found:\n\n- Target Audience: I've identified ${currentWebsiteFindings.targetAudienceSuggestions?.length || 0} potential target audiences\n- Desired Result: I've identified ${currentWebsiteFindings.desiredResultSuggestions?.length || 0} potential desired results\n- Key Advantage: I've identified ${currentWebsiteFindings.keyAdvantageSuggestions?.length || 0} potential key advantages\n- Biggest Barrier: I've identified ${currentWebsiteFindings.biggestBarrierSuggestions?.length || 0} potential barriers/risks\n- Assurance: I've identified ${currentWebsiteFindings.assuranceSuggestions?.length || 0} potential assurances\n\nLet's refine these insights together. I'll help you define each component of your core offer nucleus in order.\n\nLet's start with your Target Audience. I'll present the suggestions I found based on the analysis.`;
          } else {
            // Create a more personalized message that includes the core offer
            let coreOfferMessage = '';
            if (currentWebsiteFindings.coreOffer) {
              coreOfferMessage = `\n\nBased on my analysis, your core offer appears to be: "${currentWebsiteFindings.coreOffer}".`;
            }

            welcomeMessage = `Thanks for providing your website information! I've analyzed your site and extracted key insights to help you define your core offer nucleus using the R-A-R-A framework.${coreOfferMessage}\n\nHere's what I found:\n\n- Target Audience: ${currentWebsiteFindings.targetAudience || 'Not clearly identified'}\n- Desired Result: ${currentWebsiteFindings.desiredResult || currentWebsiteFindings.valueProposition || 'Not clearly identified'}\n- Key Advantage: ${currentWebsiteFindings.keyAdvantage || (currentWebsiteFindings.keyBenefits && currentWebsiteFindings.keyBenefits.length > 0 ? currentWebsiteFindings.keyBenefits[0] : 'Not clearly identified')}\n- Biggest Barrier: ${currentWebsiteFindings.biggestBarrier || currentWebsiteFindings.problemSolved || 'Not clearly identified'}\n- Assurance: ${currentWebsiteFindings.assurance || 'Not clearly identified'}\n\nLet's refine these insights together. I'll help you define each component of your core offer nucleus in order.\n\nLet's start with your Target Audience. I'll generate some suggestions based on the analysis.`;
          }
        } else {
          welcomeMessage = "Thanks for providing your website information! I've analyzed your site and can help you define your core offer nucleus using the R-A-R-A framework.\n\nLet's work through this step-by-step:\n\n1. First, we'll identify your ideal Target Audience - who benefits most from your solution?\n2. Then we'll clarify the primary Result they achieve\n3. Next, we'll define your unique Advantage over alternatives\n4. Finally, we'll address the biggest Risk and your Assurance to overcome it\n\nLet's start with your Target Audience. I'll generate some suggestions based on the analysis.";
        }
      } else if (!hasWebsiteData && hasTranscriptData && !hasCompletedCoreOffer) {
        welcomeMessage = "Thanks for uploading your customer call transcript! I've analyzed it and extracted key insights to help you define your core offer nucleus using the R-A-R-A framework.\n\nLet's work through this step-by-step:\n\n1. First, we'll identify your ideal Target Audience - who benefits most from your solution?\n2. Then we'll clarify the primary Result they achieve\n3. Next, we'll define your unique Advantage over alternatives\n4. Finally, we'll address the biggest Risk and your Assurance to overcome it\n\nLet's start with your Target Audience. I'll generate some suggestions based on the transcript analysis.";
      } else if (hasWebsiteData && hasTranscriptData && !hasCompletedCoreOffer) {
        if (hasImprovedAnalysis) {
          // Use the improved analysis results in the welcome message
          // Check if we have the new array format for suggestions
          const hasArraySuggestions = currentWebsiteFindings.targetAudienceSuggestions ||
                                    currentWebsiteFindings.desiredResultSuggestions ||
                                    currentWebsiteFindings.keyAdvantageSuggestions ||
                                    currentWebsiteFindings.biggestBarrierSuggestions ||
                                    currentWebsiteFindings.assuranceSuggestions;

          if (hasArraySuggestions) {
            welcomeMessage = `Great! I have both your website analysis and customer call transcript. This gives me a comprehensive understanding of your offer.\n\nBased on my analysis, here's what I found:\n\n- Target Audience: I've identified ${currentWebsiteFindings.targetAudienceSuggestions?.length || 0} potential target audiences\n- Desired Result: I've identified ${currentWebsiteFindings.desiredResultSuggestions?.length || 0} potential desired results\n- Key Advantage: I've identified ${currentWebsiteFindings.keyAdvantageSuggestions?.length || 0} potential key advantages\n- Biggest Barrier: I've identified ${currentWebsiteFindings.biggestBarrierSuggestions?.length || 0} potential barriers/risks\n- Assurance: I've identified ${currentWebsiteFindings.assuranceSuggestions?.length || 0} potential assurances\n\nLet's refine these insights together. I'll help you define each component of your core offer nucleus in order.\n\nLet's start with your Target Audience. I'll present the suggestions I found based on the combined analysis.`;
          } else {
            welcomeMessage = `Great! I have both your website analysis and customer call transcript. This gives me a comprehensive understanding of your offer.\n\nBased on my analysis, here's what I found:\n\n- Target Audience: ${currentWebsiteFindings.targetAudience || 'Not clearly identified'}\n- Desired Result: ${currentWebsiteFindings.desiredResult || currentWebsiteFindings.valueProposition || 'Not clearly identified'}\n- Key Advantage: ${currentWebsiteFindings.keyAdvantage || (currentWebsiteFindings.keyBenefits && currentWebsiteFindings.keyBenefits.length > 0 ? currentWebsiteFindings.keyBenefits[0] : 'Not clearly identified')}\n- Biggest Barrier: ${currentWebsiteFindings.biggestBarrier || currentWebsiteFindings.problemSolved || 'Not clearly identified'}\n- Assurance: ${currentWebsiteFindings.assurance || 'Not clearly identified'}\n\nLet's refine these insights together. I'll help you define each component of your core offer nucleus in order.\n\nLet's start with your Target Audience. I'll generate some suggestions based on the combined analysis.`;
          }
        } else {
          welcomeMessage = "Great! I have both your website analysis and customer call transcript. This gives me a comprehensive understanding of your offer.\n\nLet's define your core offer nucleus using the R-A-R-A framework:\n\n1. First, we'll identify your ideal Target Audience - who benefits most from your solution?\n2. Then we'll clarify the primary Result they achieve\n3. Next, we'll define your unique Advantage over alternatives\n4. Finally, we'll address the biggest Risk and your Assurance to overcome it\n\nLet's start with your Target Audience. I'll generate some suggestions based on the combined analysis.";
        }
      } else {
        welcomeMessage = "I see you've already defined your core offer nucleus. Is there anything specific you'd like help with or would you like me to review what you've entered so far using the R-A-R-A framework?";
      }
    }
    // Step 1: Setup Onboarding Steps / Signature Approach
    else if (currentStep === 1) {
      // Get the core offer nucleus data
      const nucleus = useOfferStore.getState().coreOfferNucleus;

      welcomeMessage = `Now let's define your 5-step Signature Approach based on your core offer. This is how you'll deliver value to ${nucleus.targetAudience || 'your audience'} in a way that showcases your unique process.\n\nBased on your core offer:\n\n- Target Audience: ${nucleus.targetAudience || 'Not defined yet'}\n- Desired Result: ${nucleus.desiredResult || 'Not defined yet'}\n- Key Advantage: ${nucleus.keyAdvantage || 'Not defined yet'}\n- Risk: ${nucleus.biggestBarrier || 'Not defined yet'}\n- Assurance: ${nucleus.assurance || 'Not defined yet'}\n\nI can help you create a compelling 5-step process that shows how you deliver value. Would you like suggestions for each of these steps?\n\n1. Setup/Migration: How users get started quickly\n2. One thing you're better at: Your key advantage in action\n3. One thing impossible before: A unique capability you unlock\n4. One thing that's 10X faster: Major time/effort savings\n5. Analytics/Performance: How users see results`;
    }
    // Step 2: Add Enhancers
    else if (currentStep === 2) {
      welcomeMessage = "Let's enhance your offer with bonuses and exclusivity. I can help you brainstorm compelling bonuses or craft exclusivity elements that create urgency. What would you like to focus on first?";
    }
    // Step 3: Generate & Refine Landing Page Content
    else if (currentStep === 3) {
      welcomeMessage = "Now let's create compelling landing page content. I can help you craft persuasive copy for your hero section, problem statement, solution description, risk reversal, and call to action. Where would you like to start?";
    }
    // Step 4: Create Landing Page Wireframes
    else if (currentStep === 4) {
      welcomeMessage = "Let's create wireframes for your landing page. I can help you visualize how your content will look and provide suggestions for layout and design elements. What aspect of the wireframes would you like help with?";
    }
    // Step 5: Final Review & Output
    else if (currentStep === 5) {
      welcomeMessage = "Let's review your complete offer. I can help you identify any areas that need improvement or suggest final touches to make your offer more compelling. What would you like me to review first?";
    }

    // Add the welcome message
    addChatMessage({
      sender: 'ai',
      content: welcomeMessage
    });
  };

  // Function to generate context-aware suggestions based on user request
  const generateContextAwareSuggestions = async (field: string) => {
    setIsProcessing(true);

    try {
      setCurrentField(field);

      // Get current RARA stage if we're in the Core Offer Nucleus step
      const raraStage = currentStep === 0 ? determineRARAStage() : undefined;

      // Get a fresh websiteFindings object using our helper function
      const currentWebsiteFindings = getWebsiteFindings();
      console.log('generateContextAwareSuggestions - currentWebsiteFindings:', currentWebsiteFindings);

      // Core Offer Nucleus fields (Step 0)
      if (field === 'targetAudience' ||
          field === 'desiredResult' ||
          field === 'keyAdvantage' ||
          field === 'biggestBarrier' ||
          field === 'assurance') {

        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Check if we have pre-extracted suggestions from the website analysis
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        if (field === 'targetAudience' && currentWebsiteFindings?.targetAudienceSuggestions?.length > 0) {
          console.log('Using pre-extracted target audience suggestions:', currentWebsiteFindings.targetAudienceSuggestions);
          formattedSuggestions = currentWebsiteFindings.targetAudienceSuggestions.map(suggestion => ({
            text: suggestion,
            reasoning: 'Extracted from website analysis',
            field
          }));
        }
        else if (field === 'desiredResult' && currentWebsiteFindings?.desiredResultSuggestions?.length > 0) {
          console.log('Using pre-extracted desired result suggestions:', currentWebsiteFindings.desiredResultSuggestions);
          formattedSuggestions = currentWebsiteFindings.desiredResultSuggestions.map(suggestion => ({
            text: suggestion,
            reasoning: 'Extracted from website analysis',
            field
          }));
        }
        else if (field === 'keyAdvantage' && currentWebsiteFindings?.keyAdvantageSuggestions?.length > 0) {
          console.log('Using pre-extracted key advantage suggestions:', currentWebsiteFindings.keyAdvantageSuggestions);
          formattedSuggestions = currentWebsiteFindings.keyAdvantageSuggestions.map(suggestion => ({
            text: suggestion,
            reasoning: 'Extracted from website analysis',
            field
          }));
        }
        else if (field === 'biggestBarrier' && currentWebsiteFindings?.biggestBarrierSuggestions?.length > 0) {
          console.log('Using pre-extracted biggest barrier suggestions:', currentWebsiteFindings.biggestBarrierSuggestions);
          formattedSuggestions = currentWebsiteFindings.biggestBarrierSuggestions.map(suggestion => ({
            text: suggestion,
            reasoning: 'Extracted from website analysis',
            field
          }));
        }
        else if (field === 'assurance' && currentWebsiteFindings?.assuranceSuggestions?.length > 0) {
          console.log('Using pre-extracted assurance suggestions:', currentWebsiteFindings.assuranceSuggestions);
          formattedSuggestions = currentWebsiteFindings.assuranceSuggestions.map(suggestion => ({
            text: suggestion,
            reasoning: 'Extracted from website analysis',
            field
          }));
        }
        else {
          // If no pre-extracted suggestions, generate them using the AI
          console.log('No pre-extracted suggestions found, generating with AI');
          const suggestionsWithReasoning = await generateSuggestions(
            field as any,
            initialContext,
            currentWebsiteFindings,
            transcriptData,
            raraStage
          );

          // Format suggestions for the UI, keeping the reasoning
          formattedSuggestions = suggestionsWithReasoning.map(suggestion => ({
            text: suggestion.text,
            reasoning: suggestion.reasoning,
            field
          }));
        }

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message based on the field and RARA stage
        let message = '';

        // Determine data source context
        let dataSourceContext = '';
        if (hasWebsiteData && hasTranscriptData) {
          dataSourceContext = 'Based on your website and customer transcript analysis';
        } else if (hasWebsiteData) {
          dataSourceContext = 'Based on your website analysis';
        } else if (hasTranscriptData) {
          dataSourceContext = 'Based on your customer transcript analysis';
        } else {
          dataSourceContext = 'Based on the information you provided';
        }

        // Create field-specific messages with better context
        if (field === 'targetAudience') {
          message = `${dataSourceContext}, let's clarify who your offer is truly for.\n\nYour ideal target audience should be specific and focused on who would gain the most significant value from your solution.\n\nHere are some suggestions for your Target Audience:`;
        }
        else if (field === 'desiredResult') {
          message = `Great! Now that we've identified your target audience, let's define the primary Result they achieve.\n\n${dataSourceContext}, what is the single most desirable outcome your audience gets? Focus on the transformation or ultimate benefit.\n\nHere are some suggestions for your Desired Result:`;
        }
        else if (field === 'keyAdvantage') {
          message = `Now let's identify your key Advantage - what makes your solution 5-10x better than alternatives?\n\n${dataSourceContext}, what unique mechanism or approach sets you apart? This could be speed, ease, cost savings, unique methodology, or better support.\n\nHere are some suggestions for your Key Advantage:`;
        }
        else if (field === 'biggestBarrier') {
          message = `Let's address potential concerns. What's the #1 perceived Risk that might stop someone from signing up?\n\n${dataSourceContext}, what would make your ideal customer hesitate? This could be setup complexity, cost concerns, or doubts about achieving the promised result.\n\nHere are some suggestions for the Biggest Barrier:`;
        }
        else if (field === 'assurance') {
          message = `Finally, let's provide an Assurance to overcome the identified risk.\n\n${dataSourceContext}, how can you reverse the risk and build trust? Consider guarantees, easy onboarding promises, or clear proof points.\n\nHere are some suggestions for your Assurance:`;
        }
        else if (field === 'onboardingStep' || field === 'setupStep' || field === 'advantageStep' ||
                 field === 'uniqueStep' || field === 'fasterStep' || field === 'analyticsStep') {

          // Get step number and description based on the field
          let stepNumber = '1';
          let stepDescription = 'how users get started quickly and easily';

          if (field === 'setupStep' || field === 'onboardingStep') {
            stepNumber = '1';
            stepDescription = 'how users get started quickly and easily';
          } else if (field === 'advantageStep') {
            stepNumber = '2';
            stepDescription = 'your key advantage in action';
          } else if (field === 'uniqueStep') {
            stepNumber = '3';
            stepDescription = 'a unique capability you unlock';
          } else if (field === 'fasterStep') {
            stepNumber = '4';
            stepDescription = 'a major time or effort saving';
          } else if (field === 'analyticsStep') {
            stepNumber = '5';
            stepDescription = 'how users see results and performance';
          }

          message = `Let's define Step ${stepNumber} of your Signature Approach: ${stepDescription}.\n\n${dataSourceContext}, what specific action or process happens in this step? Include a realistic time estimate.\n\nHere are some suggestions for Step ${stepNumber}:`;
        }
        else {
          message = `${dataSourceContext}, here are some suggestions for ${fieldDisplayNames[field]}:`;
        }

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (!currentWebsiteFindings && !transcriptData) {
        // Fallback suggestions if no data sources
        addChatMessage({
          sender: 'ai',
          content: `To provide more specific suggestions for your ${fieldDisplayNames[field]}, it would help to have your website URL, a customer call transcript, or more information about your business. In the meantime, could you tell me more about your target audience and what problem your product solves?`
        });
      }
      // Signature Approach / Onboarding Steps (Step 1)
      else if (field === 'onboardingStep') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Check if we have pre-extracted onboarding steps from the website analysis
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        if (currentWebsiteFindings?.onboardingSteps?.length > 0) {
          console.log('Using pre-extracted onboarding steps:', currentWebsiteFindings.onboardingSteps);
          formattedSuggestions = currentWebsiteFindings.onboardingSteps.map(step => ({
            text: `${step.description} (${step.timeEstimate})`,
            reasoning: 'Extracted from website analysis',
            field: 'onboardingStep'
          }));
        } else {
          // If no pre-extracted steps, generate them using the AI
          console.log('No pre-extracted onboarding steps found, generating with AI');

          // Use the core offer nucleus to generate relevant onboarding steps
          const suggestionsWithReasoning = await generateSuggestions(
            'onboardingStep',
            initialContext,
            currentWebsiteFindings,
            transcriptData
          );

          // Format suggestions for the UI, keeping the reasoning
          formattedSuggestions = suggestionsWithReasoning.map(suggestion => ({
            text: suggestion.text,
            reasoning: suggestion.reasoning,
            field: 'onboardingStep'
          }));

          // If AI generation fails, use fallback suggestions
          if (formattedSuggestions.length === 0) {
            const stepSuggestions = [
              "Complete a quick 2-minute setup wizard",
              "Watch the 5-minute getting started video",
              "Import your existing data (10 minutes)",
              "Set up your first automation (15 minutes)",
              "Connect with your team members (5 minutes)"
            ];

            formattedSuggestions = stepSuggestions.map(text => ({
              text,
              field: 'onboardingStep'
            }));
          }
        }

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = '';
        if (hasWebsiteData && hasTranscriptData) {
          message = 'Based on your website and customer transcript analysis, here are some suggested onboarding steps for your signature approach:';
        } else if (hasWebsiteData) {
          message = 'Based on your website analysis, here are some suggested onboarding steps for your signature approach:';
        } else if (hasTranscriptData) {
          message = 'Based on your customer transcript analysis, here are some suggested onboarding steps for your signature approach:';
        } else {
          message = 'Here are some suggested onboarding steps for your signature approach. These steps should guide users to get the full value from your offer:';
        }

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'bonus') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate bonus suggestions based on the core offer nucleus
        console.log('Generating bonus suggestions based on core offer nucleus');

        // Use the AI to generate contextually relevant bonus suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        try {
          // Generate bonus suggestions using the core offer nucleus
          const suggestionsWithReasoning = await generateSuggestions(
            'onboardingStep', // Reuse the onboardingStep type for now
            initialContext,
            currentWebsiteFindings,
            transcriptData
          );

          // Format suggestions for the UI, keeping the reasoning
          formattedSuggestions = suggestionsWithReasoning.map(suggestion => ({
            text: suggestion.text,
            reasoning: suggestion.reasoning,
            field: 'bonus'
          }));
        } catch (error) {
          console.error('Error generating bonus suggestions:', error);
        }

        // If AI generation fails, use fallback suggestions
        if (formattedSuggestions.length === 0) {
          const bonusSuggestions = [
            "Free 30-minute strategy call",
            "Exclusive PDF guide with advanced tips",
            "Access to private community",
            "Monthly live Q&A sessions",
            "Template library worth $197"
          ];

          formattedSuggestions = bonusSuggestions.map(text => ({
            text,
            field: 'bonus'
          }));
        }

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = '';
        if (hasWebsiteData && hasTranscriptData) {
          message = 'Based on your core offer and analysis, here are some suggested bonuses that would enhance your offer:';
        } else if (hasWebsiteData) {
          message = 'Based on your website analysis and core offer, here are some suggested bonuses that would enhance your offer:';
        } else if (hasTranscriptData) {
          message = 'Based on your customer transcript analysis and core offer, here are some suggested bonuses that would enhance your offer:';
        } else {
          message = 'Here are some suggested bonuses that would enhance your offer. These bonuses should increase the perceived value and make your offer more compelling:';
        }

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'scarcity') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate scarcity suggestions based on the core offer nucleus
        console.log('Generating scarcity suggestions based on core offer nucleus');

        // Use the AI to generate contextually relevant scarcity suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        // Generate scarcity suggestions
        const scarcitySuggestions = [
          `Limited to 50 spots because we provide personalized onboarding to each customer`,
          `Early bird pricing ends in 7 days to ensure we can process all orders before launch`,
          `Only accepting 20 clients this month to maintain our high quality of service`,
          `Founding member pricing available only for the first 100 customers`,
          `Limited availability due to our hands-on approach with each client`
        ];

        formattedSuggestions = scarcitySuggestions.map(text => ({
          text,
          reasoning: 'Effective scarcity creates urgency while maintaining authenticity',
          field: 'scarcity'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = 'Here are some suggested scarcity elements for your offer. Remember that scarcity should always be authentic - only use these if they genuinely apply to your situation:';

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'problemSection') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate problem section suggestions based on the core offer nucleus
        console.log('Generating problem section suggestions based on core offer nucleus');

        // Use the AI to generate contextually relevant problem section suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        // Generate problem section suggestions
        const problemSuggestions = [
          `Most ${coreOfferNucleus.targetAudience} struggle with ${coreOfferNucleus.biggestBarrier}, wasting time and resources on solutions that don't work.`,
          `Traditional approaches to ${coreOfferNucleus.desiredResult} are ineffective because they ignore ${coreOfferNucleus.biggestBarrier}.`,
          `${coreOfferNucleus.targetAudience} often face three major challenges: [1] ${coreOfferNucleus.biggestBarrier}, [2] lack of clear guidance, and [3] inconsistent results.`
        ];

        formattedSuggestions = problemSuggestions.map(text => ({
          text,
          reasoning: 'Effective problem statements create resonance with your audience by articulating their pain points',
          field: 'problemSection'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = 'Here are some suggested problem statements for your landing page. These statements articulate the pain points your target audience experiences:';

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'solutionSection') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate solution section suggestions based on the core offer nucleus and onboarding steps
        console.log('Generating solution section suggestions based on core offer nucleus and onboarding steps');

        // Use the AI to generate contextually relevant solution section suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        // Get onboarding steps to incorporate into the solution
        const steps = onboardingSteps.map(step => step.description).slice(0, 3);
        const stepsText = steps.length > 0 ?
          `Our proven approach: ${steps.join(' → ')}` :
          `Our ${coreOfferNucleus.keyAdvantage} approach`;

        // Generate solution section suggestions
        const solutionSuggestions = [
          `Introducing our ${coreOfferNucleus.keyAdvantage} solution designed specifically for ${coreOfferNucleus.targetAudience}. ${stepsText}`,
          `Our unique approach combines ${coreOfferNucleus.keyAdvantage} with proven strategies to help you achieve ${coreOfferNucleus.desiredResult} without ${coreOfferNucleus.biggestBarrier}.`,
          `We've developed a streamlined system that leverages ${coreOfferNucleus.keyAdvantage} to deliver ${coreOfferNucleus.desiredResult} for ${coreOfferNucleus.targetAudience}.`
        ];

        formattedSuggestions = solutionSuggestions.map(text => ({
          text,
          reasoning: 'Effective solution statements highlight your unique approach and connect it to the desired outcome',
          field: 'solutionSection'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = 'Here are some suggested solution statements for your landing page. These statements highlight your unique approach and how it delivers results:';

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'riskReversal') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate risk reversal suggestions based on the core offer nucleus
        console.log('Generating risk reversal suggestions based on core offer nucleus');

        // Use the AI to generate contextually relevant risk reversal suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        // Generate risk reversal suggestions
        const riskReversalSuggestions = [
          `${coreOfferNucleus.assurance} - We're so confident in our approach that we offer a 30-day money-back guarantee if you don't see results.`,
          `Worried about ${coreOfferNucleus.biggestBarrier}? Our ${coreOfferNucleus.assurance} ensures you can try our solution risk-free.`,
          `No more ${coreOfferNucleus.biggestBarrier} - With our ${coreOfferNucleus.assurance}, you can be confident in your decision.`
        ];

        formattedSuggestions = riskReversalSuggestions.map(text => ({
          text,
          reasoning: 'Effective risk reversals address the main objection and provide reassurance',
          field: 'riskReversal'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = 'Here are some suggested risk reversal statements for your landing page. These statements address objections and provide reassurance:';

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'ctaSection') {
        // Get data sources for context
        const hasWebsiteData = currentWebsiteFindings !== null;
        const hasTranscriptData = transcriptData !== null;

        // Generate CTA suggestions based on the core offer nucleus
        console.log('Generating CTA suggestions based on core offer nucleus');

        // Use the AI to generate contextually relevant CTA suggestions
        let formattedSuggestions: Array<{text: string, reasoning?: string, field: string}> = [];

        // Generate CTA suggestions
        const ctaSuggestions = [
          `Get Started Now and Achieve ${coreOfferNucleus.desiredResult}`,
          `Claim Your ${coreOfferNucleus.keyAdvantage} Solution Today`,
          `Start Your Journey to ${coreOfferNucleus.desiredResult}`,
          `Join ${coreOfferNucleus.targetAudience} Who Are Already Succeeding`,
          `Overcome ${coreOfferNucleus.biggestBarrier} Today`
        ];

        formattedSuggestions = ctaSuggestions.map(text => ({
          text,
          reasoning: 'Effective CTAs create urgency and connect to the desired outcome',
          field: 'ctaSection'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        // Create a context-aware message
        let message = 'Here are some suggested call-to-action statements for your landing page. These CTAs create urgency and connect to the desired outcome:';

        addChatMessage({
          sender: 'ai',
          content: message
        });
      } else if (field === 'heroSection' && hasCompleteCoreOffer()) {
        // Generate hero section suggestions based on the core offer nucleus
        console.log('Generating hero section suggestions based on core offer nucleus');

        // Create variations of hero headlines based on the RARA framework
        const heroSuggestions = [
          `Get ${coreOfferNucleus.desiredResult} Without ${coreOfferNucleus.biggestBarrier}`,
          `The Only ${coreOfferNucleus.keyAdvantage} Solution for ${coreOfferNucleus.targetAudience}`,
          `Transform Your Results: ${coreOfferNucleus.desiredResult} in Just Days`,
          `${coreOfferNucleus.targetAudience}: Achieve ${coreOfferNucleus.desiredResult} With Our Proven System`,
          `Stop Struggling With ${coreOfferNucleus.biggestBarrier} - Start Enjoying ${coreOfferNucleus.desiredResult}`
        ];

        const formattedSuggestions = heroSuggestions.map(text => ({
          text,
          reasoning: 'Based on your core offer nucleus using the RARA framework',
          field: 'heroSection'
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);

        addChatMessage({
          sender: 'ai',
          content: `Here are some headline suggestions for your hero section based on your core offer. You can select one or type your own.`
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      addChatMessage({
        sender: 'ai',
        content: `I encountered an error generating suggestions. Could you try again or provide more information about what you're looking for?`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to check if core offer is complete
  const hasCompleteCoreOffer = () => {
    return Boolean(
      coreOfferNucleus.targetAudience &&
      coreOfferNucleus.desiredResult &&
      coreOfferNucleus.keyAdvantage &&
      coreOfferNucleus.biggestBarrier &&
      coreOfferNucleus.assurance
    );
  };

  // Function to determine which stage of the R-A-R-A framework we're in
  const determineRARAStage = (): number => {
    // Stage 1: Target Audience & Result
    if (!coreOfferNucleus.targetAudience || !coreOfferNucleus.desiredResult) {
      return 1;
    }
    // Stage 2: Advantage
    else if (!coreOfferNucleus.keyAdvantage) {
      return 2;
    }
    // Stage 3: Risk & Assurance
    else if (!coreOfferNucleus.biggestBarrier || !coreOfferNucleus.assurance) {
      return 3;
    }
    // All stages complete
    else {
      return 4;
    }
  };

  // Function to handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    // Add the selection to the chat
    addChatMessage({
      sender: 'user',
      content: `I'll use this for ${fieldDisplayNames[suggestion.field]}: "${suggestion.text}"`
    });

    // Hide suggestions
    setShowSuggestions(false);

    // Update the store based on the field
    if (suggestion.field === 'targetAudience' ||
        suggestion.field === 'desiredResult' ||
        suggestion.field === 'keyAdvantage' ||
        suggestion.field === 'biggestBarrier' ||
        suggestion.field === 'assurance') {

      setCoreOfferNucleus({
        ...coreOfferNucleus,
        [suggestion.field]: suggestion.text
      });

      // Provide feedback and move to the next field in the RARA framework
      const raraStage = determineRARAStage();
      let nextField: string | null = null;

      // Determine the next field based on the current field
      if (suggestion.field === 'targetAudience') {
        nextField = 'desiredResult';
        addChatMessage({
          sender: 'ai',
          content: `Great choice! I've updated your ${fieldDisplayNames[suggestion.field]}. Now let's define the primary Result your target audience achieves.`
        });
      } else if (suggestion.field === 'desiredResult') {
        nextField = 'keyAdvantage';
        addChatMessage({
          sender: 'ai',
          content: `Excellent! I've updated your ${fieldDisplayNames[suggestion.field]}. Now let's identify your key Advantage - what makes your solution better than alternatives?`
        });
      } else if (suggestion.field === 'keyAdvantage') {
        nextField = 'biggestBarrier';
        addChatMessage({
          sender: 'ai',
          content: `Perfect! I've updated your ${fieldDisplayNames[suggestion.field]}. Now let's address the biggest Risk or objection that might stop someone from signing up.`
        });
      } else if (suggestion.field === 'biggestBarrier') {
        nextField = 'assurance';
        addChatMessage({
          sender: 'ai',
          content: `Good insight! I've updated your ${fieldDisplayNames[suggestion.field]}. Finally, let's provide an Assurance to overcome that risk and build trust.`
        });
      } else if (suggestion.field === 'assurance') {
        addChatMessage({
          sender: 'ai',
          content: `Excellent! I've updated your ${fieldDisplayNames[suggestion.field]}. You've now completed your core offer nucleus using the R-A-R-A framework. Would you like me to review it or help you with anything else?`
        });
      }

      // Generate suggestions for the next field after a short delay
      if (nextField) {
        setTimeout(() => {
          generateContextAwareSuggestions(nextField);
        }, 1000);
      }
    }
    // Handle other field types as needed
    else if (suggestion.field === 'onboardingStep') {
      // Logic to add an onboarding step
      addChatMessage({
        sender: 'ai',
        content: `Great choice! You can add this as an onboarding step in the form.`
      });
    }
    else if (suggestion.field === 'bonus') {
      // Logic to add a bonus
      addChatMessage({
        sender: 'ai',
        content: `Excellent bonus! You can add this in the enhancers section of the form.`
      });
    }
    else if (suggestion.field === 'heroSection') {
      // Logic for hero section
      addChatMessage({
        sender: 'ai',
        content: `Great headline! You can use this in your hero section.`
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userInput = currentInput;
    setCurrentInput('');
    setShowSuggestions(false);

    addChatMessage({
      sender: 'user',
      content: userInput
    });

    setIsProcessing(true);

    try {
      // Get a fresh websiteFindings object using our helper function
      const currentFindings = getWebsiteFindings();
      console.log('handleSendMessage - currentFindings:', currentFindings);

      // Check for specific field requests in the user input
      const lowerInput = userInput.toLowerCase();
      const fieldKeywords = {
        targetAudience: ['target audience', 'audience', 'who is it for', 'customer', 'user', 'buyer'],
        desiredResult: ['desired result', 'result', 'outcome', 'benefit', 'achieve'],
        keyAdvantage: ['advantage', 'unique', 'different', 'better', 'competitive'],
        biggestBarrier: ['barrier', 'objection', 'risk', 'concern', 'worry', 'obstacle'],
        assurance: ['assurance', 'guarantee', 'promise', 'risk reversal'],
        onboardingStep: ['onboarding', 'step', 'setup', 'getting started'],
        bonus: ['bonus', 'extra', 'additional', 'free'],
        heroSection: ['hero', 'headline', 'tagline', 'above fold']
      };

      // Check if the user is asking for suggestions for a specific field
      let requestedField: string | null = null;
      for (const [field, keywords] of Object.entries(fieldKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
          requestedField = field;
          break;
        }
      }

      // If we're in the Core Offer Nucleus step and not all fields are complete
      if (currentStep === 0 && !hasCompleteCoreOffer()) {
        const raraStage = determineRARAStage();

        // Check if the user is providing a direct answer for a field in the RARA framework
        // This could be in response to our previous question
        let updatedField = false;

        // Determine which field we're currently working on based on RARA stage
        let currentRARAField: string;
        if (raraStage === 1) {
          currentRARAField = !coreOfferNucleus.targetAudience ? 'targetAudience' : 'desiredResult';
        } else if (raraStage === 2) {
          currentRARAField = 'keyAdvantage';
        } else {
          currentRARAField = !coreOfferNucleus.biggestBarrier ? 'biggestBarrier' : 'assurance';
        }

        // Check if we're in a state where we're expecting a direct answer
        // This should only happen after we've explicitly asked for input for a specific field
        // and the last AI message was about this specific field
        const lastAiMessage = contextChat.messages
          .filter(msg => msg.sender === 'ai')
          .pop();

        const isExpectingDirectAnswer = lastAiMessage && (
          (currentRARAField === 'targetAudience' && lastAiMessage.content.includes('Target Audience')) ||
          (currentRARAField === 'desiredResult' && lastAiMessage.content.includes('Desired Result')) ||
          (currentRARAField === 'keyAdvantage' && lastAiMessage.content.includes('Key Advantage')) ||
          (currentRARAField === 'biggestBarrier' && lastAiMessage.content.includes('Biggest Barrier')) ||
          (currentRARAField === 'assurance' && lastAiMessage.content.includes('Assurance'))
        );

        // Only treat as direct answer if we're explicitly expecting one
        // and it's not a question or command
        if (isExpectingDirectAnswer &&
            !lowerInput.includes('?') &&
            !lowerInput.includes('suggest') &&
            !lowerInput.includes('help') &&
            !lowerInput.includes('show') &&
            !lowerInput.includes('what') &&
            !lowerInput.includes('find') &&
            userInput.length > 5) {

          // Update the current field with the user's input
          setCoreOfferNucleus({
            ...coreOfferNucleus,
            [currentRARAField]: userInput
          });

          // Provide feedback and move to the next field
          let nextField: string | null = null;

          if (currentRARAField === 'targetAudience') {
            nextField = 'desiredResult';
            addChatMessage({
              sender: 'ai',
              content: `Thanks! I've updated your ${fieldDisplayNames[currentRARAField]}. Now let's define the primary Result your target audience achieves.`
            });
          } else if (currentRARAField === 'desiredResult') {
            nextField = 'keyAdvantage';
            addChatMessage({
              sender: 'ai',
              content: `Great! I've updated your ${fieldDisplayNames[currentRARAField]}. Now let's identify your key Advantage - what makes your solution better than alternatives?`
            });
          } else if (currentRARAField === 'keyAdvantage') {
            nextField = 'biggestBarrier';
            addChatMessage({
              sender: 'ai',
              content: `Perfect! I've updated your ${fieldDisplayNames[currentRARAField]}. Now let's address the biggest Risk or objection that might stop someone from signing up.`
            });
          } else if (currentRARAField === 'biggestBarrier') {
            nextField = 'assurance';
            addChatMessage({
              sender: 'ai',
              content: `Good insight! I've updated your ${fieldDisplayNames[currentRARAField]}. Finally, let's provide an Assurance to overcome that risk and build trust.`
            });
          } else if (currentRARAField === 'assurance') {
            addChatMessage({
              sender: 'ai',
              content: `Excellent! I've updated your ${fieldDisplayNames[currentRARAField]}. You've now completed your core offer nucleus using the R-A-R-A framework. Would you like me to review it or help you with anything else?`
            });
          }

          // Generate suggestions for the next field after a short delay
          if (nextField) {
            setTimeout(() => {
              generateContextAwareSuggestions(nextField);
            }, 1000);
          }

          updatedField = true;
        }

        // If we didn't update a field based on the user's input, handle other cases
        if (!updatedField) {
          // If user is explicitly asking for suggestions for a specific field
          if (requestedField && (
              lowerInput.includes('suggest') ||
              lowerInput.includes('recommendation') ||
              lowerInput.includes('help with') ||
              lowerInput.includes('ideas for')
            )) {
            // Generate suggestions for the requested field
            await generateContextAwareSuggestions(requestedField);
          }
          // If user is asking about starting or continuing with the RARA framework
          else if (lowerInput.includes('start') || lowerInput.includes('ready') || lowerInput.includes('next') ||
                   lowerInput.includes('continue') || lowerInput.includes('yes')) {
            // Determine which field to suggest based on RARA stage
            let fieldToSuggest: string;

            if (raraStage === 1) {
              // Stage 1: Target Audience & Result
              fieldToSuggest = !coreOfferNucleus.targetAudience ? 'targetAudience' : 'desiredResult';
            } else if (raraStage === 2) {
              // Stage 2: Advantage
              fieldToSuggest = 'keyAdvantage';
            } else {
              // Stage 3: Risk & Assurance
              fieldToSuggest = !coreOfferNucleus.biggestBarrier ? 'biggestBarrier' : 'assurance';
            }

            await generateContextAwareSuggestions(fieldToSuggest);
          } else {
            // Generate a general response
            const response = await generateChatResponse(
              useOfferStore.getState().contextChat.messages,
              useOfferStore.getState().initialContext,
              currentFindings,
              useOfferStore.getState().transcriptData
            );

            addChatMessage({
              sender: 'ai',
              content: response
            });
          }
        }
      } else {
        // For other steps or when core offer is complete, generate a general response
        const response = await generateChatResponse(
          useOfferStore.getState().contextChat.messages,
          useOfferStore.getState().initialContext,
          currentFindings,
          useOfferStore.getState().transcriptData
        );

        addChatMessage({
          sender: 'ai',
          content: response
        });

        // Check if we should offer suggestions after the response
        if (currentStep === 0 && !hasCompleteCoreOffer()) {
          // For core offer nucleus step, check which fields are empty
          const fields = ['targetAudience', 'desiredResult', 'keyAdvantage', 'biggestBarrier', 'assurance'];
          const emptyFields = fields.filter(field => !coreOfferNucleus[field as keyof typeof coreOfferNucleus]);

          if (emptyFields.length > 0) {
            // Ask if the user wants suggestions for the next empty field
            setTimeout(() => {
              addChatMessage({
                sender: 'ai',
                content: `Would you like suggestions for your ${fieldDisplayNames[emptyFields[0]]}? Just ask me for suggestions.`
              });
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      addChatMessage({
        sender: 'ai',
        content: `Sorry, I encountered an error. Could you rephrase that?`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1C1C] rounded-lg border border-[#333333]">
      {/* Header - Keep compact */}
      <div className="py-3 px-4 bg-[#2A2A2A] border-b border-[#333333] flex items-center">
        <Bot className="w-5 h-5 text-[#FFD23F] mr-2" />
        <h3 className="text-white font-medium">AI Offer Assistant</h3>
      </div>

      {/* Chat content - Use flex with min-height to ensure proper distribution */}
      <div className="flex flex-col h-full">
        {/* Messages area - Set to flex-1 instead of flex-grow for better balance */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)]" style={{ scrollbarWidth: 'thin' }}>
          {contextChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.sender === 'user'
                    ? 'bg-[#FFD23F] text-[#1C1C1C]'
                    : message.sender === 'ai'
                      ? 'bg-[#3A3A3A] text-white'
                      : 'bg-transparent text-gray-400 italic'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sender !== 'system' && (
                  <div className="text-xs opacity-60 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Show suggestions if available */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg border border-[#333333]">
              <h4 className="text-sm font-medium text-white mb-3">Suggestions for {currentField && fieldDisplayNames[currentField]}:</h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full justify-start text-left text-sm py-3 px-4 bg-[#333333] hover:bg-[#444444] text-white rounded-md flex flex-col items-start group h-auto"
                  >
                    <div className="flex-1 w-full">
                      <div className="whitespace-normal break-words font-medium">{suggestion.text}</div>
                      {suggestion.reasoning && (
                        <div className="mt-2 text-xs text-gray-400 whitespace-normal break-words border-t border-[#444444] pt-2">
                          <span className="text-[#FFD23F]">Why this works:</span> {suggestion.reasoning}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-center">
              <div className="bg-[#2A2A2A] px-4 py-2 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin text-[#FFD23F]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area - Fixed at bottom with auto-height */}
        <div className="p-3 border-t border-[#333333] mt-auto">
          <div className="flex space-x-2">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for help with your offer..."
              className="flex-1 p-2 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FFD23F] focus:border-transparent resize-none text-sm"
              rows={1}
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isProcessing}
              className={`p-2 rounded-lg self-end ${
                !currentInput.trim() || isProcessing
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
              aria-label="Send"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
