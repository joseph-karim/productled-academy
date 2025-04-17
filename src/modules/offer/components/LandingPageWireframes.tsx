import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, RefreshCw, CheckCircle, Star, Sparkles } from 'lucide-react';
import { generateLandingPageVariations, refineLandingPageCopy, createVisualStyleGuide, createDetailedLandingPageStructure, scoreLandingPage } from '../services/ai/landingPageWireframeGenerator';
import { extractBrandingDetails, getFallbackBrandingDetails } from '../services/ai/brandingExtractor';
import { LandingPageScorecard } from './LandingPageScorecard';
import { ConfettiEffect } from './ConfettiEffect';
import { LandingPageVisualPreview } from './LandingPageVisualPreview';

interface LandingPageWireframesProps {
  modelData?: any;
  readOnly?: boolean;
}

interface LandingPageVariation {
  id: string;
  name: string;
  description: string;
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    visualDescription: string;
  };
  problem: {
    headline: string;
    description: string;
  };
  solution: {
    headline: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  riskReversal: {
    objection: string;
    assurance: string;
  };
  cta: {
    headline: string;
    description: string;
    buttonText: string;
  };
  visualStyleGuide: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headings: string;
      body: string;
    };
    spacing: string;
    imagery: string;
  };
  detailedStructure: string;
  score: {
    total: number;
    criteria: {
      [key: string]: number;
    };
    feedback: string;
  };
}

export function LandingPageWireframes({ readOnly = false }: LandingPageWireframesProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeVariation, setActiveVariation] = useState<string>('original');
  const [variations, setVariations] = useState<LandingPageVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const {
    heroSection,
    problemSection,
    solutionSection,
    riskReversals,
    ctaSection,
    finalReviewCompleted,
    setFinalReviewCompleted,
    setProcessing,
    websiteScraping
  } = useOfferStore();

  // Show confetti when component mounts
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize with original landing page and extract branding details
  useEffect(() => {
    if (heroSection && problemSection && solutionSection && riskReversals.length > 0 && ctaSection) {
      const initializeOriginalVariation = async () => {
        // Try to extract branding details from the website
        let brandingDetails = getFallbackBrandingDetails();

        if (websiteScraping.scrapingId) {
          setProcessing('brandingExtraction', true);
          try {
            const extractedBranding = await extractBrandingDetails(websiteScraping.scrapingId);
            if (extractedBranding) {
              console.log('Successfully extracted branding details:', extractedBranding);
              brandingDetails = extractedBranding;
            }
          } catch (error) {
            console.error('Error extracting branding details:', error);
          } finally {
            setProcessing('brandingExtraction', false);
          }
        }

        const originalVariation: LandingPageVariation = {
          id: 'original',
          name: 'Original Version',
          description: 'The baseline landing page generated from your offer inputs.',
          hero: {
            headline: heroSection.tagline,
            subheadline: heroSection.subCopy,
            cta: heroSection.ctaText,
            visualDescription: heroSection.visualDesc
          },
          problem: {
            headline: 'The Problem',
            description: problemSection.alternativesProblems + '\\n\\n' + problemSection.underlyingProblem
          },
          solution: {
            headline: solutionSection.headline,
            steps: solutionSection.steps
          },
          riskReversal: {
            objection: riskReversals[0]?.objection || '',
            assurance: riskReversals[0]?.assurance || ''
          },
          cta: {
            headline: 'Ready to get started?',
            description: ctaSection.surroundingCopy,
            buttonText: ctaSection.mainCtaText
          },
          visualStyleGuide: {
            colorPalette: brandingDetails.colorPalette,
            typography: brandingDetails.typography,
            spacing: brandingDetails.spacing,
            imagery: brandingDetails.imagery
          },
          detailedStructure: 'Default landing page structure',
          score: {
            total: 0,
            criteria: {},
            feedback: ''
          }
        };

        setVariations([originalVariation]);

        // Score the original variation
        handleScoreVariation(originalVariation);
      };

      initializeOriginalVariation();
    }
  }, [heroSection, problemSection, solutionSection, riskReversals, ctaSection, websiteScraping.scrapingId, setProcessing]);

  const handleGenerateVariations = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProcessing('landingPageVariations', true);

    try {
      // Generate variations based on the original landing page
      const originalVariation = variations.find(v => v.id === 'original');
      if (!originalVariation) throw new Error('Original variation not found');

      const newVariations = await generateLandingPageVariations(originalVariation);

      // Add the new variations to the existing ones
      setVariations(prev => {
        const existingVariations = prev.filter(v => v.id === 'original');
        return [...existingVariations, ...newVariations];
      });

      // Score each new variation
      for (const variation of newVariations) {
        await handleScoreVariation(variation);
      }
    } catch (error) {
      console.error('Error generating landing page variations:', error);
    } finally {
      setIsGenerating(false);
      setProcessing('landingPageVariations', false);
    }
  };

  const handleRefineCopy = async (variationId: string) => {
    if (isRefining) return;

    setIsRefining(true);
    setProcessing('refineCopy', true);

    try {
      const variationToRefine = variations.find(v => v.id === variationId);
      if (!variationToRefine) throw new Error('Variation not found');

      const refinedVariation = await refineLandingPageCopy(variationToRefine);

      // Update the variation with refined copy
      setVariations(prev =>
        prev.map(v => v.id === variationId ? refinedVariation : v)
      );

      // Score the refined variation
      await handleScoreVariation(refinedVariation);
    } catch (error) {
      console.error('Error refining landing page copy:', error);
    } finally {
      setIsRefining(false);
      setProcessing('refineCopy', false);
    }
  };

  const handleScoreVariation = async (variation: LandingPageVariation) => {
    if (isScoring) return;

    setIsScoring(true);

    try {
      // Create a copy of the variation to update
      const updatedVariation = { ...variation };

      // Score the landing page based on the criteria
      const scoreResult = await scoreLandingPage(variation);

      updatedVariation.score = scoreResult;

      // Update the variation with the score
      setVariations(prev =>
        prev.map(v => v.id === variation.id ? updatedVariation : v)
      );
    } catch (error) {
      console.error('Error scoring landing page:', error);
    } finally {
      setIsScoring(false);
    }
  };

  const handleCopyPrompt = (variationId: string) => {
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    // Create the prompt to copy
    const prompt = `PROMPT: Using the following landing page structure and visual style guide, please create a complete landing page mockup:

[LANDING PAGE STRUCTURE]
Hero Section:
Headline: ${variation.hero.headline}
Subheadline: ${variation.hero.subheadline}
CTA: ${variation.hero.cta}
Visual: ${variation.hero.visualDescription}

Problem Section:
Headline: ${variation.problem.headline}
Description: ${variation.problem.description}

Solution Section:
Headline: ${variation.solution.headline}
Steps:
${variation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${variation.riskReversal.objection}
Assurance: ${variation.riskReversal.assurance}

CTA Section:
Headline: ${variation.cta.headline}
Description: ${variation.cta.description}
Button Text: ${variation.cta.buttonText}

[VISUAL STYLE GUIDE]
Color Palette:
- Primary: ${variation.visualStyleGuide.colorPalette.primary}
- Secondary: ${variation.visualStyleGuide.colorPalette.secondary}
- Accent: ${variation.visualStyleGuide.colorPalette.accent}
- Background: ${variation.visualStyleGuide.colorPalette.background}
- Text: ${variation.visualStyleGuide.colorPalette.text}

Typography:
- Headings: ${variation.visualStyleGuide.typography.headings}
- Body: ${variation.visualStyleGuide.typography.body}

Spacing: ${variation.visualStyleGuide.spacing}
Imagery: ${variation.visualStyleGuide.imagery}

Please create a full, detailed mockup of the landing page that follows these guidelines exactly. For each section, include:
- The visual layout description
- All text content properly formatted
- Descriptions of images, icons, or other visual elements
- Button styles and placement
- Spacing and hierarchy notes

The mockup should be comprehensive enough that a designer could implement it exactly as described.`;

    // Copy to clipboard
    navigator.clipboard.writeText(prompt)
      .then(() => {
        setCopySuccess(variationId);
        setTimeout(() => setCopySuccess(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy prompt:', err);
      });
  };

  const handleExportPDF = (variationId: string) => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just show an alert
    alert(`Exporting ${variationId} as PDF...`);
  };

  const handleFinalize = () => {
    if (!readOnly) {
      setFinalReviewCompleted(true);
    }
  };

  return (
    <div className="space-y-8">
      {showConfetti && <ConfettiEffect />}

      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-[#FFD23F] mr-2" />
            <CardTitle>Create Landing Page Wireframes</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Generate and refine multiple landing page variations based on your offer details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-300">
              Your landing page has been generated! Now you can create variations, refine the copy, and export the wireframes for implementation.
            </p>
          </div>

          <div className="mb-8">
            <Button
              onClick={handleGenerateVariations}
              disabled={isGenerating || readOnly}
              className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
            >
              {isGenerating ? 'Generating Variations...' : 'Generate Variations'}
            </Button>
          </div>

          <Tabs value={activeVariation} onValueChange={setActiveVariation}>
            <TabsList className="bg-[#333333] mb-6">
              {variations.map(variation => (
                <TabsTrigger
                  key={variation.id}
                  value={variation.id}
                  className="data-[state=active]:bg-[#FFD23F] data-[state=active]:text-[#1C1C1C]"
                >
                  {variation.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {variations.map(variation => (
              <TabsContent key={variation.id} value={variation.id} className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{variation.name}</h3>
                      <p className="text-gray-400">{variation.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleRefineCopy(variation.id)}
                        disabled={isRefining || readOnly}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refine Copy
                      </Button>
                      <Button
                        onClick={() => handleCopyPrompt(variation.id)}
                        variant="outline"
                        size="sm"
                      >
                        {copySuccess === variation.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleExportPDF(variation.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="bg-[#222222] p-4 rounded-lg border border-[#444444] overflow-hidden">
                    <h4 className="text-lg font-medium text-[#FFD23F] mb-4">Visual Preview</h4>
                    <div className="bg-white rounded-lg overflow-hidden" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <LandingPageVisualPreview variation={variation} />
                    </div>
                  </div>

                  <Tabs defaultValue="content">
                    <TabsList className="bg-[#333333] mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="style">Style Guide</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                            <h4 className="text-lg font-medium text-[#FFD23F] mb-2">Hero Section</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-400">Headline</p>
                                <p className="text-white">{variation.hero.headline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Subheadline</p>
                                <p className="text-white">{variation.hero.subheadline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">CTA</p>
                                <p className="text-white">{variation.hero.cta}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Visual</p>
                                <p className="text-white">{variation.hero.visualDescription}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                            <h4 className="text-lg font-medium text-[#FFD23F] mb-2">Problem Section</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-400">Headline</p>
                                <p className="text-white">{variation.problem.headline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Description</p>
                                <p className="text-white whitespace-pre-line">{variation.problem.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                            <h4 className="text-lg font-medium text-[#FFD23F] mb-2">Solution Section</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-400">Headline</p>
                                <p className="text-white">{variation.solution.headline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Steps</p>
                                <div className="space-y-2">
                                  {variation.solution.steps.map((step, index) => (
                                    <div key={index} className="bg-[#1C1C1C] p-2 rounded">
                                      <p className="text-white font-medium">{step.title}</p>
                                      <p className="text-gray-300 text-sm">{step.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                            <h4 className="text-lg font-medium text-[#FFD23F] mb-2">Risk Reversal</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-400">Objection</p>
                                <p className="text-white">{variation.riskReversal.objection}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Assurance</p>
                                <p className="text-white">{variation.riskReversal.assurance}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                            <h4 className="text-lg font-medium text-[#FFD23F] mb-2">CTA Section</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-400">Headline</p>
                                <p className="text-white">{variation.cta.headline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Description</p>
                                <p className="text-white">{variation.cta.description}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-400">Button Text</p>
                                <p className="text-white">{variation.cta.buttonText}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="style" className="mt-0">
                      <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
                        <h4 className="text-lg font-medium text-[#FFD23F] mb-2">Visual Style Guide</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-white font-medium mb-2">Color Palette</h5>
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(variation.visualStyleGuide.colorPalette).map(([name, color]) => (
                                <div key={name} className="flex items-center bg-[#1C1C1C] p-3 rounded">
                                  <div
                                    className="w-8 h-8 rounded-md mr-3"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                  <div>
                                    <p className="text-white capitalize">{name}</p>
                                    <p className="text-gray-400 text-sm">{color}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h5 className="text-white font-medium mb-2">Typography</h5>
                              <div className="bg-[#1C1C1C] p-3 rounded mb-4">
                                <p className="text-sm font-medium text-gray-400">Headings</p>
                                <p className="text-white">{variation.visualStyleGuide.typography.headings}</p>
                              </div>
                              <div className="bg-[#1C1C1C] p-3 rounded">
                                <p className="text-sm font-medium text-gray-400">Body</p>
                                <p className="text-white">{variation.visualStyleGuide.typography.body}</p>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-white font-medium mb-2">Layout</h5>
                              <div className="bg-[#1C1C1C] p-3 rounded mb-4">
                                <p className="text-sm font-medium text-gray-400">Spacing</p>
                                <p className="text-white">{variation.visualStyleGuide.spacing}</p>
                              </div>
                              <div className="bg-[#1C1C1C] p-3 rounded">
                                <p className="text-sm font-medium text-gray-400">Imagery</p>
                                <p className="text-white">{variation.visualStyleGuide.imagery}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-0">
                      <LandingPageScorecard score={variation.score} />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {!finalReviewCompleted && (
            <div className="mt-8">
              <Button
                onClick={handleFinalize}
                disabled={readOnly}
                className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
              >
                Finalize Landing Page Wireframes
              </Button>
            </div>
          )}

          {finalReviewCompleted && (
            <p className="mt-8 text-green-400 text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Module Complete!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
