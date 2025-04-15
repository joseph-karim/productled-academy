import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { ContextChatInline } from './ContextChatInline';

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
    websiteScraping
  } = useOfferStore();

  const [currentStepDescription, setCurrentStepDescription] = useState('');
  const [currentStepTimeEstimate, setCurrentStepTimeEstimate] = useState('');
  const [showChat, setShowChat] = useState(false);

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
  const websiteFindings = useOfferStore((state) => {
    if (state.websiteScraping.status === 'completed') {
      return {
        coreOffer: state.websiteScraping.coreOffer || '',
        targetAudience: state.websiteScraping.targetAudience || '',
        problemSolved: state.websiteScraping.keyProblem || '',
        valueProposition: state.websiteScraping.valueProposition || '',
        keyBenefits: Array.isArray(state.websiteScraping.keyFeatures) ? state.websiteScraping.keyFeatures : [],
        keyPhrases: Array.isArray(state.websiteScraping.keyPhrases) ? state.websiteScraping.keyPhrases : [],
        missingInfo: []
      };
    }
    return {
      coreOffer: '',
      targetAudience: '',
      problemSolved: '',
      valueProposition: '',
      keyBenefits: [],
      keyPhrases: [],
      missingInfo: ['No website analysis available']
    };
  });

  return (
    <div className="space-y-8">
      {/* Chat Button - Always visible when chat is not shown */}
      {!showChat && !readOnly && (
        <div className="mb-6">
          <Button
            onClick={() => setShowChat(true)}
            className="w-full py-3 bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90 flex items-center justify-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span className="text-lg">Get AI Help with Your Setup Steps</span>
          </Button>
        </div>
      )}
      
      {/* AI Chat Assistant */}
      {showChat && !readOnly && (
        <div className="mb-6 bg-[#222222] p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-white">AI Setup Assistant</h3>
            <Button 
              onClick={() => setShowChat(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
          <ContextChatInline
            websiteUrl={websiteUrl}
            initialContext={initialContext}
            websiteScrapingStatus={scrapingStatus}
            websiteFindings={websiteFindings}
          />
        </div>
      )}

      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <CardTitle>Setup: Onboarding Steps</CardTitle>
          <CardDescription className="text-gray-400">Define the top 3-5 steps users need to take to get value from your offer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Onboarding Steps Section */}
          <div className="space-y-4 p-4 border border-[#444444] rounded-md bg-[#1C1C1C]">
            <h3 className="font-semibold text-gray-200">Value Path</h3>
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
