import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Sparkles, Loader2, Check } from 'lucide-react';

type BodyCopyType = 'hero' | 'problem' | 'solution';

export function BodyCopyImprovement({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    refinedBodyCopy,
    setBodyCopy,
    heroSection,
    problemSection,
    solutionSection,
    setProcessing
  } = useOfferStore();
  
  const [activeSection, setActiveSection] = useState<BodyCopyType>('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  
  // Helper to get the current body copy for the active section
  const getActiveBodyCopy = () => {
    return refinedBodyCopy[activeSection] || '';
  };
  
  // Handle body copy updates
  const handleUpdateBodyCopy = (text: string) => {
    setBodyCopy(activeSection, text);
  };
  
  // Generate improved body copy based on existing content
  const generateImprovedBodyCopy = () => {
    setIsGenerating(true);
    setProcessing('bodyCopySection', true);
    
    // Simulate API call
    setTimeout(() => {
      let generatedCopy = '';
      
      if (activeSection === 'hero') {
        // Hero body copy improvement
        if (heroSection.subCopy) {
          // Start with the existing subCopy
          const existingCopy = heroSection.subCopy;
          
          // Improve the copy - in a real implementation, this would call an LLM
          generatedCopy = `${existingCopy}\n\nBut that's just the beginning. Our solution is designed with your specific needs in mind, ensuring you get exactly what you need to succeed in today's competitive environment.\n\nUnlike other options that offer a one-size-fits-all approach, we've carefully crafted our system based on years of research and customer feedback. The result? A seamless experience that delivers real, measurable results you can count on.`;
        } else {
          // Generic hero body copy
          generatedCopy = "Our platform is the culmination of years of research and development, designed specifically to address the challenges faced by modern businesses like yours.\n\nWe understand that you need more than just another tool – you need a complete solution that works seamlessly with your existing processes while providing the advanced capabilities necessary to stay ahead of the competition.\n\nThat's exactly what we deliver: powerful features wrapped in an intuitive interface, backed by world-class support that ensures you're never left wondering what to do next.";
        }
      } else if (activeSection === 'problem') {
        // Problem body copy improvement
        if (problemSection.underlyingProblem) {
          // Use the underlying problem as a basis
          const problem = problemSection.underlyingProblem;
          
          generatedCopy = `If you're like most of our clients, you've probably experienced the frustration of dealing with ${problem.toLowerCase()}.\n\nThis isn't just annoying – it's actively holding back your growth and costing you time and money every single day it goes unaddressed.\n\nThe traditional approaches to solving this problem often fall short because they treat the symptoms rather than addressing the root cause. Meanwhile, your competitors who have solved this challenge are moving ahead while you're still struggling with the basics.`;
        } else {
          // Generic problem body copy
          generatedCopy = "Today's market moves faster than ever before, and businesses that can't keep pace quickly find themselves left behind.\n\nThe problem isn't just about efficiency – it's about the compounding effect of small inefficiencies that create major roadblocks to your success.\n\nEvery day you continue with outdated systems and processes is another day your competition gains ground. The cost of inaction isn't just measured in dollars but in missed opportunities and market position that becomes increasingly difficult to reclaim.";
        }
      } else if (activeSection === 'solution') {
        // Solution body copy improvement
        if (solutionSection.steps.length > 0) {
          // Use solution steps to craft compelling copy
          const steps = solutionSection.steps.map(step => `**${step.title}**: ${step.description}`).join('\n\n');
          
          generatedCopy = `Our solution addresses every aspect of the problem through a carefully designed process:\n\n${steps}\n\nWhat makes our approach different is that we don't just focus on one piece of the puzzle – we provide a comprehensive solution that transforms how your entire operation functions.\n\nThe result? Not just incremental improvement, but a fundamental shift in what's possible for your business.`;
        } else {
          // Generic solution body copy
          generatedCopy = "Our solution stands apart because it was built from the ground up with a singular focus: solving your specific challenges in the most effective way possible.\n\nWe've eliminated the complexity that plagues most alternatives, creating an intuitive system that delivers immediate value while scaling with your needs.\n\nThrough our three-step implementation process, you'll experience a seamless transition that minimizes disruption while maximizing impact. And unlike other options, our ongoing support ensures you're never left trying to figure things out on your own.";
        }
      }
      
      // Update body copy in store
      setBodyCopy(activeSection, generatedCopy);
      
      setIsGenerating(false);
      setProcessing('bodyCopySection', false);
    }, 2000);
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getActiveBodyCopy());
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Body Copy Improvement</h2>
        <p className="text-gray-300 mb-4">
          Refine the body copy for each section of your offer. Compelling body copy expands on
          your headlines, addresses objections, and guides readers toward action.
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
            Hero Copy
          </button>
          <button
            onClick={() => setActiveSection('problem')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'problem' 
                ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                : 'bg-[#333333] text-white hover:bg-[#444444]'
            }`}
          >
            Problem Copy
          </button>
          <button
            onClick={() => setActiveSection('solution')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'solution' 
                ? 'bg-[#FFD23F] text-[#1C1C1C]' 
                : 'bg-[#333333] text-white hover:bg-[#444444]'
            }`}
          >
            Solution Copy
          </button>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {activeSection === 'hero' && 'Hero Section Body Copy'}
            {activeSection === 'problem' && 'Problem Section Body Copy'}
            {activeSection === 'solution' && 'Solution Section Body Copy'}
          </h3>
          
          <div className="flex space-x-3">
            {!readOnly && (
              <button
                onClick={generateImprovedBodyCopy}
                disabled={isGenerating}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Improved Copy
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={copyToClipboard}
              disabled={!getActiveBodyCopy()}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50 flex items-center"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                'Copy to Clipboard'
              )}
            </button>
          </div>
        </div>
        
        <div>
          <textarea
            value={getActiveBodyCopy()}
            onChange={(e) => !readOnly && handleUpdateBodyCopy(e.target.value)}
            disabled={readOnly}
            placeholder={
              activeSection === 'hero' 
                ? "Enter compelling body copy for your hero section..." 
                : activeSection === 'problem'
                ? "Describe the problem your solution addresses..."
                : "Explain how your solution works and its benefits..."
            }
            className="w-full h-60 p-4 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Body Copy Preview</h3>
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-6 rounded-lg">
          <div className="prose prose-invert max-w-none">
            {getActiveBodyCopy() ? (
              getActiveBodyCopy().split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-300 mb-4">
                  {paragraph.startsWith('**') && paragraph.includes('**:') ? (
                    <>
                      <strong className="text-white">
                        {paragraph.substring(2, paragraph.indexOf('**:'))}
                      </strong>
                      {paragraph.substring(paragraph.indexOf('**:') + 3)}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">No body copy content yet. Generate or write some copy to see a preview.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Body Copy Writing Tips</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Focus on Benefits, Not Features</h4>
            <p className="text-gray-300 text-sm">
              Describe how your offer improves your customer's life, not just what it does.
              Benefits answer the question "What's in it for me?" from the customer's perspective.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Use Clear, Conversational Language</h4>
            <p className="text-gray-300 text-sm">
              Write as if you're speaking directly to one person. Avoid jargon, complex sentences,
              and overly formal language that creates distance between you and the reader.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Add Proof Elements</h4>
            <p className="text-gray-300 text-sm">
              Support your claims with specific evidence: statistics, case studies, testimonials,
              or concrete examples that show your offer delivers on its promises.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Format for Scannability</h4>
            <p className="text-gray-300 text-sm">
              Break up long paragraphs, use bullet points for key information, and include subheadings.
              People scan online content before deciding whether to read it in depth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 