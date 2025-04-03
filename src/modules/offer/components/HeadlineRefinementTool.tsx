import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, Sparkles, Loader2, Copy, Check } from 'lucide-react';

type HeadlineType = 'hero' | 'problem' | 'solution';

export function HeadlineRefinementTool({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    refinedHeadlines,
    addHeadline,
    removeHeadline,
    heroSection,
    problemSection,
    solutionSection,
    setProcessing
  } = useOfferStore();
  
  const [activeSection, setActiveSection] = useState<HeadlineType>('hero');
  const [newHeadline, setNewHeadline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Helper to get the current headlines for the active section
  const getActiveHeadlines = () => {
    return refinedHeadlines[activeSection];
  };
  
  // Handle adding a new headline
  const handleAddHeadline = () => {
    if (newHeadline.trim()) {
      addHeadline(activeSection, newHeadline);
      setNewHeadline('');
    }
  };
  
  // Generate variations based on existing content
  const generateHeadlineVariations = () => {
    setIsGenerating(true);
    setProcessing('headlinesSection', true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate headlines based on the active section
      let generatedHeadlines: string[] = [];
      
      if (activeSection === 'hero') {
        // Hero headline variations
        if (heroSection.tagline) {
          // Base variations on existing tagline
          const originalTagline = heroSection.tagline;
          
          generatedHeadlines = [
            `${originalTagline}: The Ultimate Guide`,
            `How to ${originalTagline.toLowerCase()} in Just 5 Steps`,
            `${originalTagline} That Actually Works`,
            `The Secret to ${originalTagline.toLowerCase()}`,
            `${originalTagline}: Simplified for Everyone`
          ];
        } else {
          // Generic variations
          generatedHeadlines = [
            'Transform Your Business with Our Proven System',
            'Unlock Your Full Potential Now',
            'The Smarter Way to Achieve Your Goals',
            'Stop Struggling, Start Succeeding',
            'Your Path to Guaranteed Results'
          ];
        }
      } else if (activeSection === 'problem') {
        // Problem headline variations
        if (problemSection.underlyingProblem) {
          // Extract key phrases for variations
          const problem = problemSection.underlyingProblem.toLowerCase();
          
          generatedHeadlines = [
            `Struggling with ${problem}? You're Not Alone`,
            `The Hidden Cost of ${problem}`,
            `Why Most People Fail to Solve ${problem}`,
            `3 Reasons Why ${problem} is Holding You Back`,
            `Are You Making These Common ${problem} Mistakes?`
          ];
        } else {
          // Generic problem variations
          generatedHeadlines = [
            'The Problem with Traditional Approaches',
            "Why Most Solutions Fail (And How We're Different)",
            "The Hidden Costs You're Currently Paying",
            "3 Critical Challenges You're Facing Right Now",
            'Stop Wasting Time with Ineffective Methods'
          ];
        }
      } else if (activeSection === 'solution') {
        // Solution headline variations
        if (solutionSection.steps.length > 0) {
          // Use first solution step for variations
          const solutionTitle = solutionSection.steps[0].title;
          
          generatedHeadlines = [
            `Introducing: ${solutionTitle}`,
            `How Our ${solutionTitle} Works`,
            `The ${solutionTitle} Advantage`,
            `Why Our ${solutionTitle} Outperforms the Competition`,
            `${solutionTitle}: A Better Approach for Today's Challenges`
          ];
        } else {
          // Generic solution variations
          generatedHeadlines = [
            'Introducing Our Revolutionary Solution',
            'How Our System Works (In 3 Simple Steps)',
            'The Advantages of Our Unique Approach',
            'Why Our Solution Outperforms Everything Else',
            "A Better Approach for Today's Challenges"
          ];
        }
      }
      
      // Add generated headlines
      generatedHeadlines.forEach(headline => {
        addHeadline(activeSection, headline);
      });
      
      setIsGenerating(false);
      setProcessing('headlinesSection', false);
    }, 1500);
  };
  
  // Copy headline to clipboard
  const copyToClipboard = (headline: string, index: number) => {
    navigator.clipboard.writeText(headline);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Headline Refinement Tool</h2>
        <p className="text-gray-300 mb-4">
          Craft compelling headlines for different sections of your offer. Great headlines grab attention,
          communicate value, and motivate readers to continue.
        </p>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveSection('hero')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'hero' 
                ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                : 'bg-[#333333] text-white hover:bg-[#444444]'
            }`}
          >
            Hero Headlines
          </button>
          <button
            onClick={() => setActiveSection('problem')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'problem' 
                ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                : 'bg-[#333333] text-white hover:bg-[#444444]'
            }`}
          >
            Problem Headlines
          </button>
          <button
            onClick={() => setActiveSection('solution')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'solution' 
                ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                : 'bg-[#333333] text-white hover:bg-[#444444]'
            }`}
          >
            Solution Headlines
          </button>
        </div>
        
        {!readOnly && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {activeSection === 'hero' && 'Add Hero Headline'}
              {activeSection === 'problem' && 'Add Problem Headline'}
              {activeSection === 'solution' && 'Add Solution Headline'}
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                placeholder="Enter a new headline..."
                className="flex-1 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
              />
              <button
                onClick={handleAddHeadline}
                disabled={!newHeadline.trim()}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
              <button
                onClick={generateHeadlineVariations}
                disabled={isGenerating}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            {activeSection === 'hero' && 'Hero Headlines'}
            {activeSection === 'problem' && 'Problem Headlines'}
            {activeSection === 'solution' && 'Solution Headlines'}
          </h3>
          
          {getActiveHeadlines().length === 0 ? (
            <div className="bg-[#1A1A1A] p-6 rounded-lg text-center text-gray-400">
              <p>No headlines added yet for this section.</p>
              {!readOnly && (
                <p className="mt-2">Add your own or use the generator to create some options.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {getActiveHeadlines().map((headline, index) => (
                <div 
                  key={index}
                  className="bg-[#1A1A1A] p-4 rounded-lg flex justify-between items-start"
                >
                  <p className="text-white flex-1 mr-4">{headline}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(headline, index)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    {!readOnly && (
                      <button
                        onClick={() => removeHeadline(activeSection, index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Headline Writing Tips</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Be Specific and Clear</h4>
            <p className="text-gray-300 text-sm">
              Vague headlines don't convert. Great headlines are specific about the value or benefit.
              Compare "Improve Your Business" with "Increase Conversion Rates by 37% in 30 Days."
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Create a Sense of Urgency</h4>
            <p className="text-gray-300 text-sm">
              Words like "now," "today," or phrases that indicate limited availability
              can increase conversion rates by creating urgency and FOMO.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Use Numbers and Data</h4>
            <p className="text-gray-300 text-sm">
              Headlines with numbers tend to perform better. They provide specificity and set clear expectations.
              Example: "5 Ways to Boost Your Productivity in Under 10 Minutes"
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Test Different Approaches</h4>
            <p className="text-gray-300 text-sm">
              Generate multiple headline options and test them with your audience. What works
              well in one industry or with one audience may not work for another.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 