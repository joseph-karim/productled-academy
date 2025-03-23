import React, { useState } from 'react';
import { useFormStore } from '../../store/formStore';
import { usePackageStore } from '../../store/packageStore';
import { PackageBuilder } from './PackageBuilder';
import { PricingStrategy } from './PricingStrategy';
import { HelpCircle, Download } from 'lucide-react';

interface FreeModelCanvasProps {
  readOnly?: boolean;
}

export function FreeModelCanvas({ readOnly = false }: FreeModelCanvasProps) {
  const store = useFormStore();
  const packageStore = usePackageStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // Filter beginner challenges and solutions
  const beginnerChallenges = store.challenges.filter(c => c.level === 'beginner');
  const beginnerSolutions = store.solutions.filter(s => 
    beginnerChallenges.some(c => c.id === s.challengeId)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Free Model Canvas</h2>
          <p className="text-gray-400 mt-1">
            Design your free and paid packages based on your {store.selectedModel} model.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title={showGuidance ? "Hide guidance" : "Show guidance"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.print()}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title="Print Canvas"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="description-framework">
          <div>
            <h3 className="framework-heading">Package Design Guidelines</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium">Free Package</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Include features that demonstrate core value</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Set clear usage or capability limits</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Create natural upgrade triggers</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium">Paid Package</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Focus on scalability and advanced needs</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Include team and collaboration features</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Provide enterprise-grade capabilities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beginner Challenges & Solutions Section */}
      <div className="bg-[#2A2A2A] p-6 rounded-lg space-y-6">
        <h3 className="text-lg font-medium text-white">Beginner User Solutions</h3>
        <div className="space-y-4">
          {beginnerChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-[#1C1C1C] p-4 rounded-lg">
              <h4 className="font-medium text-white">{challenge.title}</h4>
              {challenge.description && (
                <p className="text-gray-400 mt-1">{challenge.description}</p>
              )}
              <div className="mt-4 space-y-3">
                {beginnerSolutions
                  .filter(s => s.challengeId === challenge.id)
                  .map((solution) => (
                    <div key={solution.id} className="bg-[#2A2A2A] p-3 rounded-lg">
                      <p className="text-white mb-2">{solution.text}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          solution.type === 'product' ? 'bg-[#333333] text-[#FFD23F] border border-[#FFD23F]' : 
                          solution.type === 'resource' ? 'bg-[#333333] text-purple-400 border border-purple-400' : 
                          'bg-[#333333] text-green-400 border border-green-400'
                        }`}>
                          {solution.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          solution.cost === 'low' ? 'bg-[#333333] text-green-400 border border-green-400' :
                          solution.cost === 'medium' ? 'bg-[#333333] text-[#FFD23F] border border-[#FFD23F]' :
                          'bg-[#333333] text-red-400 border border-red-400'
                        }`}>
                          {solution.cost} cost
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          solution.impact === 'low' ? 'bg-[#333333] text-red-400 border border-red-400' :
                          solution.impact === 'medium' ? 'bg-[#333333] text-[#FFD23F] border border-[#FFD23F]' :
                          'bg-[#333333] text-green-400 border border-green-400'
                        }`}>
                          {solution.impact} impact
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Builder Section */}
      <PackageBuilder readOnly={readOnly} />

      {/* Pricing Strategy Section */}
      <PricingStrategy readOnly={readOnly} />
    </div>
  );
}