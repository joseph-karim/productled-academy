import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import { generateLandingPage } from '../services/ai/landingPageGenerator';

interface GenerateLandingPageButtonProps {
  readOnly?: boolean;
}

export function GenerateLandingPageButton({ readOnly = false }: GenerateLandingPageButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const store = useOfferStore();
  
  const {
    coreOfferNucleus,
    exclusivity,
    bonuses,
    onboardingSteps,
    setHeroSection,
    setProblemSection,
    setSolutionSection,
    setRiskReversals,
    setCtaSection,
    setProcessing
  } = store;

  const handleGenerateLandingPage = async () => {
    if (readOnly || isGenerating) return;
    
    setIsGenerating(true);
    setProcessing('landingPage', true);
    
    try {
      const landingPage = await generateLandingPage(
        coreOfferNucleus,
        exclusivity,
        bonuses,
        onboardingSteps
      );
      
      // Update all sections with generated content
      setHeroSection({
        tagline: landingPage.hero.headline,
        subCopy: landingPage.hero.body,
        ctaText: landingPage.hero.cta || 'Get Started Now',
        visualDesc: landingPage.hero.visualDescription || 'Product screenshot or illustration'
      });
      
      setProblemSection({
        alternativesProblems: landingPage.problem.alternativesProblems,
        underlyingProblem: landingPage.problem.underlyingProblem
      });
      
      setSolutionSection({
        headline: landingPage.solution.headline,
        steps: landingPage.solution.steps.map((step, index) => ({
          id: `step-${index + 1}`,
          title: step.title,
          description: step.description
        }))
      });
      
      setRiskReversals([{
        id: 'risk-1',
        objection: landingPage.riskReversal.objection,
        assurance: landingPage.riskReversal.assurance
      }]);
      
      setCtaSection({
        mainCtaText: landingPage.cta.buttonText,
        surroundingCopy: landingPage.cta.surroundingCopy
      });
      
    } catch (error) {
      console.error('Error generating landing page:', error);
    } finally {
      setIsGenerating(false);
      setProcessing('landingPage', false);
    }
  };
  
  return (
    <Button
      onClick={handleGenerateLandingPage}
      disabled={isGenerating || readOnly}
      className="w-full bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90 disabled:opacity-50"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating Landing Page...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Complete Landing Page
        </>
      )}
    </Button>
  );
}
