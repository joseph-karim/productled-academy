import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function CtaSectionBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    ctaSection, 
    setCtaSection,
    userSuccess,
    topResults,
    setProcessing
  } = useOfferStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form fields
  const [mainCtaText, setMainCtaText] = useState(ctaSection.mainCtaText || '');
  const [surroundingCopy, setSurroundingCopy] = useState(ctaSection.surroundingCopy || '');
  const [urgencyText, setUrgencyText] = useState('');
  const [buttonColor, setButtonColor] = useState('#FFD23F');
  const [ctaStyle, setCtaStyle] = useState('standard'); // Options: 'standard', 'boxed', 'full-width'
  
  // Save changes to store
  const handleSave = () => {
    setCtaSection({
      mainCtaText,
      surroundingCopy
    });
  };
  
  // Auto-save when fields change
  React.useEffect(() => {
    if (!readOnly) {
      handleSave();
    }
  }, [mainCtaText, surroundingCopy, readOnly]);
  
  const generateCtaContent = () => {
    setIsGenerating(true);
    setProcessing('ctaSection', true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate content based on previous data
      let generatedCtaText = '';
      let generatedSurroundingCopy = '';
      let generatedUrgency = '';
      
      // Use user success to create a compelling CTA
      if (userSuccess.statement.length > 0) {
        const statement = userSuccess.statement.toLowerCase();
        
        if (statement.includes('time') || statement.includes('quickly')) {
          generatedCtaText = "Start Saving Time Today";
          generatedSurroundingCopy = "Ready to eliminate the busywork and focus on what matters? Our solution is designed to help you maximize productivity from day one.";
          generatedUrgency = "Limited Time Offer: Get 14 days free when you sign up this week.";
        } else if (statement.includes('cost') || statement.includes('revenue')) {
          generatedCtaText = "Boost Your Bottom Line";
          generatedSurroundingCopy = "Join thousands of businesses that have increased their profitability with our proven solution.";
          generatedUrgency = "Special Pricing: Save 20% on annual plans this month only.";
        } else if (statement.includes('quality') || statement.includes('improve')) {
          generatedCtaText = "Elevate Your Results Now";
          generatedSurroundingCopy = "Take the first step toward better outcomes. Our platform is ready to help you achieve excellence.";
          generatedUrgency = "Limited Availability: We're accepting only 100 new customers this quarter.";
        } else {
          generatedCtaText = "Start Your Transformation";
          generatedSurroundingCopy = "Join the thousands of businesses who have already transformed their operations with our platform.";
          generatedUrgency = "Act Now: Special onboarding support available for new customers.";
        }
      } else if (topResults.tangible) {
        generatedCtaText = "Get Started Free";
        generatedSurroundingCopy = `Ready to ${topResults.tangible.toLowerCase()}? Our solution makes it possible.`;
        generatedUrgency = "No credit card required. Start your free trial today.";
      } else {
        generatedCtaText = "Get Started Now";
        generatedSurroundingCopy = "Join thousands of satisfied customers who are already achieving better results.";
        generatedUrgency = "Free 14-day trial, no credit card required.";
      }
      
      // Update state
      setMainCtaText(generatedCtaText);
      setSurroundingCopy(generatedSurroundingCopy);
      setUrgencyText(generatedUrgency);
      
      setIsGenerating(false);
      setProcessing('ctaSection', false);
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Call-to-Action Builder</h2>
        <p className="text-gray-300 mb-4">
          Your call-to-action section is one of the most critical elements of your landing page.
          It should clearly tell visitors what to do next and motivate them to take that action.
        </p>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="mb-6">
          <button
            onClick={generateCtaContent}
            disabled={isGenerating || readOnly}
            className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate CTA Content
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="mainCtaText" className="block text-sm font-medium text-gray-300 mb-1">
              CTA Button Text
            </label>
            <input
              id="mainCtaText"
              type="text"
              value={mainCtaText}
              onChange={(e) => setMainCtaText(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Start Your Free Trial"
              className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep it action-oriented and clear. 2-5 words is ideal.
            </p>
          </div>
          
          <div>
            <label htmlFor="surroundingCopy" className="block text-sm font-medium text-gray-300 mb-1">
              Supporting Copy
            </label>
            <textarea
              id="surroundingCopy"
              value={surroundingCopy}
              onChange={(e) => setSurroundingCopy(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Join thousands of businesses already transforming their operations."
              className="w-full h-20 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">
              Reinforce the value proposition or add social proof to motivate action.
            </p>
          </div>
          
          <div>
            <label htmlFor="urgencyText" className="block text-sm font-medium text-gray-300 mb-1">
              Urgency or Scarcity Element (Optional)
            </label>
            <input
              id="urgencyText"
              type="text"
              value={urgencyText}
              onChange={(e) => setUrgencyText(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Limited time offer: Get 30% off when you sign up today"
              className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">
              Adding a time-limited offer or limited availability can increase conversion rates.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              CTA Appearance
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${
                  ctaStyle === 'standard' 
                    ? 'border-[#FFD23F] bg-[#1F1F1F]' 
                    : 'border-[#333333] bg-[#1A1A1A]'
                }`}
                onClick={() => !readOnly && setCtaStyle('standard')}
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-white mb-2">Standard</p>
                  <div className="inline-block px-4 py-2 rounded-md bg-[#FFD23F] text-black text-sm font-medium">
                    Button
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${
                  ctaStyle === 'boxed' 
                    ? 'border-[#FFD23F] bg-[#1F1F1F]' 
                    : 'border-[#333333] bg-[#1A1A1A]'
                }`}
                onClick={() => !readOnly && setCtaStyle('boxed')}
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-white mb-2">Boxed</p>
                  <div className="p-3 border border-[#444444] rounded-md">
                    <div className="px-4 py-2 rounded-md bg-[#FFD23F] text-black text-sm font-medium">
                      Button
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${
                  ctaStyle === 'full-width' 
                    ? 'border-[#FFD23F] bg-[#1F1F1F]' 
                    : 'border-[#333333] bg-[#1A1A1A]'
                }`}
                onClick={() => !readOnly && setCtaStyle('full-width')}
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-white mb-2">Full Width</p>
                  <div className="w-full px-4 py-2 rounded-md bg-[#FFD23F] text-black text-sm font-medium">
                    Button
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Color
            </label>
            <div className="flex space-x-3">
              {['#FFD23F', '#3366FF', '#FF5C38', '#10B981', '#8B5CF6'].map(color => (
                <div 
                  key={color} 
                  className={`w-8 h-8 rounded-full cursor-pointer ${
                    buttonColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111111]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => !readOnly && setButtonColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">CTA Preview</h3>
        
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-8 rounded-lg">
          {ctaStyle === 'standard' && (
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                {surroundingCopy || "Ready to transform your business?"}
              </h3>
              
              {urgencyText && (
                <p className="text-[#FFD23F] mb-6">{urgencyText}</p>
              )}
              
              <button
                style={{ backgroundColor: buttonColor }}
                className="px-8 py-3 rounded-lg text-black font-medium text-lg inline-flex items-center"
              >
                {mainCtaText || "Get Started"} 
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          )}
          
          {ctaStyle === 'boxed' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#222222] border border-[#333333] rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {surroundingCopy || "Ready to transform your business?"}
                </h3>
                
                {urgencyText && (
                  <p className="text-[#FFD23F] mb-6">{urgencyText}</p>
                )}
                
                <button
                  style={{ backgroundColor: buttonColor }}
                  className="px-8 py-3 rounded-lg text-black font-medium text-lg inline-flex items-center"
                >
                  {mainCtaText || "Get Started"} 
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {ctaStyle === 'full-width' && (
            <div>
              <div className="max-w-3xl mx-auto text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {surroundingCopy || "Ready to transform your business?"}
                </h3>
                
                {urgencyText && (
                  <p className="text-[#FFD23F] mb-2">{urgencyText}</p>
                )}
              </div>
              
              <div className="bg-[#222222] p-6 rounded-lg">
                <button
                  style={{ backgroundColor: buttonColor }}
                  className="w-full py-4 rounded-lg text-black font-medium text-lg flex justify-center items-center"
                >
                  {mainCtaText || "Get Started"} 
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Effective CTAs</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Use Action-Oriented Verbs</h4>
            <p className="text-gray-300 text-sm">
              Start your CTA with a verb that tells the user exactly what to do: "Start," "Get," "Join," "Download," etc.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Create a Sense of Urgency</h4>
            <p className="text-gray-300 text-sm">
              Words like "now," "today," or "limited time" can increase conversion rates by creating FOMO (fear of missing out).
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Reduce Risk</h4>
            <p className="text-gray-300 text-sm">
              Including phrases like "free trial," "no credit card required," or "money-back guarantee" helps overcome objections.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Make it Stand Out</h4>
            <p className="text-gray-300 text-sm">
              Your CTA button should contrast with the rest of the page. It should be one of the most visually prominent elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 