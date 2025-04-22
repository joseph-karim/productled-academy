import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, CheckCircle } from 'lucide-react';
// ContextChatInline import removed as we're using persistent chat only

interface SetupStepsProps {
  modelData?: any;
  readOnly?: boolean;
}

interface OnboardingStep {
  id: string;
  description: string;
  timeEstimate: string;
}

export function SetupSteps({ readOnly = false }: SetupStepsProps) {
  const {
    onboardingSteps = [],
    addOnboardingStep,
    removeOnboardingStep,
    updateOnboardingStep,
    setOnboardingStepsConfirmed,
    onboardingStepsConfirmed,
    initialContext,
    websiteScraping,
    contextChat,
    addChatMessage
  } = useOfferStore();

  const [currentStepDescription, setCurrentStepDescription] = useState('');
  const [currentStepTimeEstimate, setCurrentStepTimeEstimate] = useState('');

  // Effect to trigger onboarding step suggestions when component mounts
  useEffect(() => {
    if (!readOnly && !onboardingStepsConfirmed && onboardingSteps.length === 0) {
      // Add a slight delay to allow the chat to initialize
      setTimeout(() => {
        // Send a message to the chat to trigger suggestions
        addChatMessage({
          sender: 'user',
          content: 'I need help creating my signature approach steps'
        });
      }, 1000);
    }
  }, [readOnly, onboardingStepsConfirmed]);

  const handleAddStep = () => {
    if (readOnly || !currentStepDescription.trim()) return;

    addOnboardingStep({
      id: crypto.randomUUID(),
      description: currentStepDescription.trim(),
      timeEstimate: currentStepTimeEstimate.trim() || 'N/A'
    });

    setCurrentStepDescription('');
    setCurrentStepTimeEstimate('');
  };

  const handleUpdateStep = (index: number, field: 'description' | 'timeEstimate', value: string) => {
    if (readOnly) return;
    const updatedSteps = [...onboardingSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    updateOnboardingStep(updatedSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (readOnly) return;
    removeOnboardingStep(index);
  };

  const handleConfirm = () => {
    if (!readOnly) {
      setOnboardingStepsConfirmed(true);
    }
  };

  // Get website findings from the store
  const websiteUrl = useOfferStore((state) => state.websiteUrl);
  const scrapingStatus = useOfferStore((state) => state.websiteScraping.status);

  // Helper function to create website findings object with proper null/undefined handling
  const createWebsiteFindings = (scrapingData: any) => {
    if (scrapingData.status !== 'completed') {
      return {
        coreOffer: '',
        targetAudience: '',
        problemSolved: '',
        valueProposition: '',
        keyBenefits: [],
        keyPhrases: [],
        onboardingSteps: [],
        missingInfo: ['No website analysis available']
      };
    }

    return {
      coreOffer: scrapingData.coreOffer || '',
      targetAudience: scrapingData.targetAudience || '',
      problemSolved: scrapingData.keyProblem || '',
      valueProposition: scrapingData.valueProposition || '',
      keyBenefits: Array.isArray(scrapingData.keyFeatures) ? scrapingData.keyFeatures : [],
      keyPhrases: Array.isArray(scrapingData.keyPhrases) ? scrapingData.keyPhrases : [],
      onboardingSteps: Array.isArray(scrapingData.onboardingSteps) ? scrapingData.onboardingSteps : [],
      missingInfo: []
    };
  };

  // Use the helper function to get the current website findings
  const getWebsiteFindings = () => {
    return createWebsiteFindings(useOfferStore.getState().websiteScraping);
  };

  // Get the initial website findings
  const websiteFindings = createWebsiteFindings(websiteScraping);

  // Use onboarding steps from website scraping if available and no steps have been added yet
  useEffect(() => {
    if (
      websiteFindings &&
      websiteFindings.onboardingSteps &&
      websiteFindings.onboardingSteps.length > 0 &&
      onboardingSteps.length === 0 &&
      !onboardingStepsConfirmed &&
      !readOnly
    ) {
      // Convert the scraped onboarding steps to the format expected by the store
      const formattedSteps = websiteFindings.onboardingSteps.map(step => ({
        id: crypto.randomUUID(),
        description: step.description,
        timeEstimate: step.timeEstimate || 'N/A'
      }));

      // Update the store with the scraped onboarding steps
      updateOnboardingStep(formattedSteps);

      // Show a notification or message that steps were imported from the website
      console.log('Imported onboarding steps from website analysis');
    }
  }, [websiteFindings, onboardingSteps.length, onboardingStepsConfirmed, readOnly, updateOnboardingStep]);

  return (
    <div className="space-y-8">
      {/* Inline chat removed - using persistent chat only */}

      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <CardTitle>Our Signature Approach</CardTitle>
          <CardDescription className="text-gray-400">The 3-5 steps to get the full value of your offer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Onboarding Steps Section */}
          <div className="space-y-4 p-4 border border-[#444444] rounded-md bg-[#1C1C1C]">
            <p className="text-gray-400 text-sm">What are the key steps your users need to take to get value from your offer? These will become your onboarding process.</p>

            {onboardingSteps.map((step, index) => (
              <div key={step.id || index} className="flex items-start space-x-2 p-3 bg-[#2A2A2A] rounded border border-[#444444]">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center">
                    <div className="bg-[#FFD23F] text-black font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {index + 1}
                    </div>
                    <Input
                      value={step.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateStep(index, 'description', e.target.value)}
                      placeholder="Step description"
                      disabled={readOnly || onboardingStepsConfirmed}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex items-center ml-8">
                    <Label className="text-gray-400 text-xs mr-2 w-24">Time estimate:</Label>
                    <Input
                      value={step.timeEstimate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateStep(index, 'timeEstimate', e.target.value)}
                      placeholder="e.g., 5 minutes"
                      disabled={readOnly || onboardingStepsConfirmed}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500 w-32"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStep(index)}
                  disabled={readOnly || onboardingStepsConfirmed}
                  className="text-red-500 hover:text-red-400 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {!onboardingStepsConfirmed && onboardingSteps.length < 5 && (
              <div className="flex items-start space-x-2 pt-4 border-t border-gray-600">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center">
                    <div className="bg-[#333] text-gray-300 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {onboardingSteps.length + 1}
                    </div>
                    <Input
                      value={currentStepDescription}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentStepDescription(e.target.value)}
                      placeholder="New step description"
                      disabled={readOnly}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex items-center ml-8">
                    <Label className="text-gray-400 text-xs mr-2 w-24">Time estimate:</Label>
                    <Input
                      value={currentStepTimeEstimate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentStepTimeEstimate(e.target.value)}
                      placeholder="e.g., 5 minutes"
                      disabled={readOnly}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500 w-32"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddStep}
                  disabled={readOnly || !currentStepDescription.trim()}
                  className="mt-1 text-gray-300 border-[#444444] hover:bg-[#333333]"
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!onboardingStepsConfirmed && (
            <Button
              onClick={handleConfirm}
              disabled={readOnly || onboardingSteps.length === 0}
              className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
            >
              Confirm Setup Steps
            </Button>
          )}
          {onboardingStepsConfirmed && (
            <p className="text-green-400 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Setup Steps Confirmed. You can proceed to the next step.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
