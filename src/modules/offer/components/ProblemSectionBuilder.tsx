import React, { useState, useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Loader2, Sparkles } from 'lucide-react';

export function ProblemSectionBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    problemSection, 
    setProblemSection,
    userSuccess,
    setProcessing
  } = useOfferStore();
  
  const [alternativesProblems, setAlternativesProblems] = useState(
    problemSection.alternativesProblems || ""
  );
  const [underlyingProblem, setUnderlyingProblem] = useState(
    problemSection.underlyingProblem || ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Auto-save when fields change
  useEffect(() => {
    if (!readOnly) {
      handleSave();
    }
  }, [alternativesProblems, underlyingProblem, readOnly]);
  
  // Save changes to store
  const handleSave = () => {
    setProblemSection({
      alternativesProblems,
      underlyingProblem,
    });
  };
  
  const generateProblemContent = () => {
    setIsGenerating(true);
    setProcessing('problemSection', true);
    
    // Simulate API call
    setTimeout(() => {
      // Use data from previous steps to generate relevant problems
      let generatedAlternativesProblems = '';
      let generatedUnderlyingProblem = '';
      
      // Generate based on user success if available
      if (userSuccess.statement) {
        const successStatement = userSuccess.statement.toLowerCase();
        
        if (successStatement.includes('save time') || successStatement.includes('faster')) {
          generatedAlternativesProblems = 
            "Current solutions in the market are too time-consuming and often require manual intervention. Most teams waste 5-10 hours per week on repetitive tasks that could be automated, leading to frustration and missed deadlines.";
          
          generatedUnderlyingProblem = 
            "The fundamental problem is that businesses are forced to choose between speed and quality. When pressed for time, teams cut corners, leading to errors and rework that create even more delays.";
        } 
        else if (successStatement.includes('cost') || successStatement.includes('budget')) {
          generatedAlternativesProblems = 
            "Existing options are unnecessarily expensive, with complicated pricing models that hide fees and force you to pay for features you don't use. Companies typically overspend by 30-40% on solutions that don't deliver adequate value.";
          
          generatedUnderlyingProblem = 
            "The deeper issue is that cost overruns have become accepted as normal in the industry. This creates a culture of low expectations where mediocre results are considered satisfactory despite the high prices being paid.";
        }
        else if (successStatement.includes('scale') || successStatement.includes('grow')) {
          generatedAlternativesProblems = 
            "Traditional solutions break down at scale, requiring expensive upgrades or complete migrations. Teams hit roadblocks just as they're gaining momentum, forcing them to choose between limiting growth or undertaking risky platform changes.";
          
          generatedUnderlyingProblem = 
            "The core problem is that most tools are designed for either small teams OR enterprise companies, with nothing that effectively serves businesses through their growth journey. This creates unnecessary transition points that disrupt operations.";
        }
        else {
          generatedAlternativesProblems = 
            "Current market solutions are fragmented and difficult to use, often requiring technical expertise that most teams don't have. Users report spending more time managing their tools than using them productively.";
          
          generatedUnderlyingProblem = 
            "The root issue is that existing products were designed to solve technical problems rather than human ones. They fail to account for real-world workflows and team dynamics, creating friction instead of removing it.";
        }
      } else {
        // Generic fallback
        generatedAlternativesProblems = 
          "Existing solutions are complex, expensive, and inefficient. They require significant time investment to set up and maintain, with poor user interfaces that frustrate team members. Many companies end up creating manual workarounds rather than using the tools as intended.";
        
        generatedUnderlyingProblem = 
          "The fundamental problem is a disconnect between what vendors promise and what they deliver. Products are built to check feature boxes rather than solve real customer problems, leaving users with bloated software that doesn't address their core needs.";
      }
      
      // Update state
      setAlternativesProblems(generatedAlternativesProblems);
      setUnderlyingProblem(generatedUnderlyingProblem);
      
      setIsGenerating(false);
      setProcessing('problemSection', false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Problem Section Builder</h2>
        <p className="text-gray-300 mb-4">
          A compelling problem statement creates urgency and helps prospects recognize why they need your solution.
          Focus on the pain points that your target audience experiences.
        </p>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="mb-6">
          <button
            onClick={generateProblemContent}
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
                Generate Problem Content
              </>
            )}
          </button>
        </div>
      
        <div className="space-y-6">
          <div>
            <label htmlFor="alternativesProblems" className="block text-sm font-medium text-gray-300 mb-1">
              Problems with Alternatives
            </label>
            <textarea
              id="alternativesProblems"
              value={alternativesProblems}
              onChange={(e) => setAlternativesProblems(e.target.value)}
              disabled={readOnly}
              placeholder="Describe what's wrong with current alternatives or the status quo"
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">
              What frustrations or limitations do people experience with existing solutions?
            </p>
          </div>
          
          <div>
            <label htmlFor="underlyingProblem" className="block text-sm font-medium text-gray-300 mb-1">
              Underlying Problem
            </label>
            <textarea
              id="underlyingProblem"
              value={underlyingProblem}
              onChange={(e) => setUnderlyingProblem(e.target.value)}
              disabled={readOnly}
              placeholder="Describe the deeper underlying problem your product addresses"
              className="w-full h-32 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">
              What is the fundamental issue that makes this problem worth solving?
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Problem Section Preview</h3>
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-8 rounded-lg">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">The Challenge</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-3">Industry Limitations</h3>
                <p className="text-gray-300">
                  {alternativesProblems || "Describe what's wrong with current alternatives or the status quo."}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">The Core Issue</h3>
                <p className="text-gray-300">
                  {underlyingProblem || "Describe the deeper underlying problem your product addresses."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Effective Problem Statements</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Be Specific and Relatable</h4>
            <p className="text-gray-300 text-sm">
              Use concrete examples and specific pain points that your target audience will immediately recognize.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Focus on Emotional Impact</h4>
            <p className="text-gray-300 text-sm">
              Address how the problem makes people feel - frustrated, overwhelmed, embarrassed, etc. Emotional connections create stronger desire for solutions.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Quantify the Cost</h4>
            <p className="text-gray-300 text-sm">
              When possible, include numbers that demonstrate the cost of the problem - wasted time, lost revenue, missed opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 