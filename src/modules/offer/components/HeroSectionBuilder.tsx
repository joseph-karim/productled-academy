import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Loader2, ZoomIn, Image } from 'lucide-react';

export function HeroSectionBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    heroSection, 
    setHeroSection,
    userSuccess,
    topResults,
    advantages,
    setProcessing
  } = useOfferStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form fields
  const [tagline, setTagline] = useState(heroSection.tagline);
  const [subCopy, setSubCopy] = useState(heroSection.subCopy);
  const [ctaText, setCtaText] = useState(heroSection.ctaText);
  const [visualDesc, setVisualDesc] = useState(heroSection.visualDesc || '');
  const [socialProofExample, setSocialProofExample] = useState(heroSection.socialProofExample || '');
  
  // Save changes to store
  const handleSave = () => {
    setHeroSection({
      tagline,
      subCopy,
      ctaText,
      visualDesc,
      socialProofExample
    });
  };
  
  // Auto-save when fields change
  React.useEffect(() => {
    if (!readOnly) {
      handleSave();
    }
  }, [tagline, subCopy, ctaText, visualDesc, socialProofExample, readOnly]);
  
  const generateHeroContent = () => {
    setIsGenerating(true);
    setProcessing('heroSection', true);
    
    // Simulate API call
    setTimeout(() => {
      // Use data from previous steps to generate relevant hero content
      let generatedTagline = '';
      let generatedSubCopy = '';
      let generatedCta = '';
      let generatedVisualDesc = '';
      
      // If we have user success defined, use it to create the tagline
      if (userSuccess.statement.length > 0) {
        // Extract key phrases from user success
        const statement = userSuccess.statement.toLowerCase();
        
        if (statement.includes('reduce') || statement.includes('decrease')) {
          generatedTagline = "Cut Costs & Boost Efficiency With Our Solution";
        } else if (statement.includes('increase') || statement.includes('improve')) {
          generatedTagline = "Boost Your Results With Proven Technology";
        } else if (statement.includes('automate') || statement.includes('workflow')) {
          generatedTagline = "Automate Your Workflow, Focus On What Matters";
        } else {
          generatedTagline = "The Smarter Way To Achieve Your Goals";
        }
      } else {
        generatedTagline = "Transform Your Business With Our Solution";
      }
      
      // Use advantages for the subheading if available
      if (advantages.length > 0) {
        const keyAdvantages = advantages.slice(0, 2).map(adv => adv.text);
        generatedSubCopy = `Our platform ${keyAdvantages.join(' and ')} so you can focus on growing your business.`;
      } else if (topResults.tangible) {
        generatedSubCopy = `Our solution helps you ${topResults.tangible.toLowerCase()}`;
      } else {
        generatedSubCopy = "Our all-in-one platform gives you everything you need to succeed.";
      }
      
      // Set a compelling CTA
      generatedCta = "Get Started For Free";
      
      // Suggest a visual
      generatedVisualDesc = "A clean dashboard showing key metrics with upward trending graphs, demonstrating the positive impact of the solution.";
      
      // Update component state
      setTagline(generatedTagline);
      setSubCopy(generatedSubCopy);
      setCtaText(generatedCta);
      setVisualDesc(generatedVisualDesc);
      
      setIsGenerating(false);
      setProcessing('heroSection', false);
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Hero Section Builder</h2>
        <p className="text-gray-300 mb-4">
          The hero section is the first thing visitors see on your landing page. It needs to immediately
          communicate your value proposition and prompt action.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
        >
          <ZoomIn className="w-4 h-4 mr-1" />
          {previewMode ? "Edit Mode" : "Preview"}
        </button>
      </div>
      
      {previewMode ? (
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-8 rounded-lg">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{tagline || "Your Compelling Headline"}</h1>
                <p className="text-xl text-gray-300 mb-6">{subCopy || "Your supporting subheading that explains your value proposition"}</p>
                
                <button className="px-6 py-3 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium text-lg">
                  {ctaText || "Call to Action"}
                </button>
                
                {socialProofExample && (
                  <div className="mt-8">
                    <p className="text-gray-400 text-sm">Trusted by leading companies</p>
                    <p className="text-gray-300 mt-2">{socialProofExample}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-[#222222] rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center p-4">
                  <Image className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  {visualDesc ? (
                    <p className="text-gray-400 text-sm">{visualDesc}</p>
                  ) : (
                    <p className="text-gray-400 text-sm">Hero image or video will appear here</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#222222] p-6 rounded-lg">
          <div className="mb-6">
            <button
              onClick={generateHeroContent}
              disabled={isGenerating || readOnly}
              className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate from Previous Steps'
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-300 mb-1">
                Main Headline
              </label>
              <input
                id="tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={readOnly}
                placeholder="e.g., Transform Your Workflow with AI-Powered Automation"
                className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep it under 10 words. Focus on the main benefit for the user.
              </p>
            </div>
            
            <div>
              <label htmlFor="subCopy" className="block text-sm font-medium text-gray-300 mb-1">
                Supporting Subheadline
              </label>
              <textarea
                id="subCopy"
                value={subCopy}
                onChange={(e) => setSubCopy(e.target.value)}
                disabled={readOnly}
                placeholder="e.g., Our platform helps teams reduce busywork by 40% so they can focus on what matters most"
                className="w-full h-20 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expand on your headline with specific benefits or outcomes.
              </p>
            </div>
            
            <div>
              <label htmlFor="ctaText" className="block text-sm font-medium text-gray-300 mb-1">
                Call-to-Action Button Text
              </label>
              <input
                id="ctaText"
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                disabled={readOnly}
                placeholder="e.g., Start Free Trial"
                className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">
                Action-oriented and clear. 2-4 words is ideal.
              </p>
            </div>
            
            <div>
              <label htmlFor="visualDesc" className="block text-sm font-medium text-gray-300 mb-1">
                Hero Visual Description (Optional)
              </label>
              <textarea
                id="visualDesc"
                value={visualDesc}
                onChange={(e) => setVisualDesc(e.target.value)}
                disabled={readOnly}
                placeholder="e.g., A product dashboard showing productivity metrics with upward trends"
                className="w-full h-20 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe what visual would best support your headline and value proposition.
              </p>
            </div>
            
            <div>
              <label htmlFor="socialProofExample" className="block text-sm font-medium text-gray-300 mb-1">
                Social Proof (Optional)
              </label>
              <input
                id="socialProofExample"
                type="text"
                value={socialProofExample}
                onChange={(e) => setSocialProofExample(e.target.value)}
                disabled={readOnly}
                placeholder="e.g., Used by teams at Google, Microsoft, and 10,000+ growing companies"
                className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add trust indicators like customer logos, user counts, or quick testimonials.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Hero Section Tips</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Focus on Benefits, Not Features</h4>
            <p className="text-gray-300 text-sm">
              Your headline should focus on the transformation or end result your users want, not your product's features.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Keep it Clear and Direct</h4>
            <p className="text-gray-300 text-sm">
              Avoid jargon and complex language. A visitor should understand your value proposition within 5 seconds.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Use Action-Oriented CTA</h4>
            <p className="text-gray-300 text-sm">
              Your call-to-action should start with a verb and clearly indicate what happens next. "Get Started" is better than "Learn More".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 