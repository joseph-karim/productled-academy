import React from 'react';
import { useOfferStore } from '../store/offerStore';
import { ArrowDown, CheckCircle2, AlertCircle, ShieldCheck, UserCircle2, Zap, Target } from 'lucide-react';

export function OfferCanvasDisplay({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    userSuccess, 
    topResults, 
    advantages, 
    risks, 
    assurances 
  } = useOfferStore();

  // Check if we have enough data to display each section
  const hasUserSuccess = userSuccess.statement.length > 0;
  const hasResults = topResults.tangible.length > 0 || topResults.intangible.length > 0 || topResults.improvement.length > 0;
  const hasAdvantages = advantages.length > 0;
  const hasRisks = risks.length > 0;
  const hasAssurances = assurances.length > 0;
  
  // Find risks without assurances
  const risksWithoutAssurances = risks.filter(risk => 
    !assurances.some(assurance => assurance.riskId === risk.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Offer Canvas</h2>
        <p className="text-gray-300">
          This canvas visualizes your complete offer, showing how all elements work together to create
          a compelling proposition for your users.
        </p>
      </div>

      {/* Canvas visualization */}
      <div className="bg-[#1A1A1A] p-6 rounded-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-[#2A2A2A] px-6 py-3 rounded-lg shadow-lg">
            <UserCircle2 className="w-6 h-6 text-[#FFD23F] mr-2" />
            <span className="text-white font-medium">Your Ideal User</span>
          </div>
        </div>
        
        <ArrowDown className="w-6 h-6 text-gray-400 mx-auto my-4" />
        
        {/* User Success - Top level goal */}
        <div className={`bg-[#222222] p-4 rounded-lg mb-6 border-l-4 ${hasUserSuccess ? 'border-green-500' : 'border-gray-600'}`}>
          <div className="flex items-start">
            <Target className="w-5 h-5 text-[#FFD23F] mt-1 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-1">Success Goal</h3>
              {hasUserSuccess ? (
                <p className="text-gray-300">{userSuccess.statement}</p>
              ) : (
                <p className="text-yellow-500 italic">Define user success in step 1</p>
              )}
            </div>
          </div>
        </div>
        
        <ArrowDown className="w-6 h-6 text-gray-400 mx-auto my-4" />
        
        {/* Results Section */}
        <div className={`bg-[#222222] p-4 rounded-lg mb-6 ${hasResults ? '' : 'border border-yellow-500 border-dashed'}`}>
          <h3 className="text-white font-medium mb-4 flex items-center">
            <Zap className="w-5 h-5 text-[#FFD23F] mr-2" />
            Results They'll Achieve
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`bg-[#1A1A1A] p-3 rounded-lg ${topResults.tangible ? '' : 'border border-gray-700 border-dashed'}`}>
              <h4 className="text-gray-300 text-sm font-medium mb-2">Tangible</h4>
              {topResults.tangible ? (
                <p className="text-white text-sm">{topResults.tangible}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Not defined yet</p>
              )}
            </div>
            
            <div className={`bg-[#1A1A1A] p-3 rounded-lg ${topResults.intangible ? '' : 'border border-gray-700 border-dashed'}`}>
              <h4 className="text-gray-300 text-sm font-medium mb-2">Intangible</h4>
              {topResults.intangible ? (
                <p className="text-white text-sm">{topResults.intangible}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Not defined yet</p>
              )}
            </div>
            
            <div className={`bg-[#1A1A1A] p-3 rounded-lg ${topResults.improvement ? '' : 'border border-gray-700 border-dashed'}`}>
              <h4 className="text-gray-300 text-sm font-medium mb-2">Improvement</h4>
              {topResults.improvement ? (
                <p className="text-white text-sm">{topResults.improvement}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Not defined yet</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Advantages Section */}
          <div className={`bg-[#222222] p-4 rounded-lg ${hasAdvantages ? '' : 'border border-yellow-500 border-dashed'}`}>
            <h3 className="text-white font-medium mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              Key Advantages
            </h3>
            
            {hasAdvantages ? (
              <ul className="space-y-2">
                {advantages.slice(0, 3).map((advantage) => (
                  <li key={advantage.id} className="text-gray-300 text-sm flex items-start">
                    <div className="w-1 h-1 rounded-full bg-[#FFD23F] mt-2 mr-2"></div>
                    <span>{advantage.text}</span>
                  </li>
                ))}
                {advantages.length > 3 && (
                  <li className="text-gray-400 text-sm italic">
                    + {advantages.length - 3} more advantages...
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-yellow-500 italic">Define advantages in step 3</p>
            )}
          </div>
          
          {/* Risks & Assurances Section */}
          <div className={`bg-[#222222] p-4 rounded-lg ${hasRisks ? '' : 'border border-yellow-500 border-dashed'}`}>
            <h3 className="text-white font-medium mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 text-blue-500 mr-2" />
              Risks & Assurances
            </h3>
            
            {hasRisks ? (
              <div className="space-y-3">
                {risks.slice(0, 2).map((risk) => {
                  const assurance = assurances.find(a => a.riskId === risk.id);
                  
                  return (
                    <div key={risk.id} className="bg-[#1A1A1A] p-3 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{risk.text}</p>
                      </div>
                      
                      {assurance ? (
                        <div className="flex items-start mt-2 ml-6 bg-[#262626] p-2 rounded">
                          <ShieldCheck className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                          <p className="text-gray-300 text-sm">{assurance.text}</p>
                        </div>
                      ) : (
                        <div className="flex items-start mt-2 ml-6">
                          <p className="text-yellow-500 text-xs italic">No assurance defined yet</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {risks.length > 2 && (
                  <p className="text-gray-400 text-sm italic">
                    + {risks.length - 2} more risks identified...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-yellow-500 italic">Define risks in steps 4-5</p>
            )}
          </div>
        </div>

        {/* Conversion Direction */}
        <div className="flex justify-center">
          <div className="w-32 h-10 bg-gradient-to-b from-transparent to-[#FFD23F] rounded-b-md opacity-50"></div>
        </div>
        <div className="text-center mt-2">
          <div className="bg-[#FFD23F] text-[#1C1C1C] px-4 py-2 rounded-lg inline-block font-medium">
            Conversion
          </div>
        </div>
      </div>

      {/* Status & Recommendations */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Canvas Status</h3>
        
        {/* Progress indicators */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">User Success Definition</span>
            {hasUserSuccess ? (
              <span className="text-green-500 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
              </span>
            ) : (
              <span className="text-yellow-500">Incomplete</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Results Definition</span>
            {hasResults ? (
              <span className="text-green-500 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
              </span>
            ) : (
              <span className="text-yellow-500">Incomplete</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Advantages</span>
            {hasAdvantages ? (
              <span className="text-green-500 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> {advantages.length} defined
              </span>
            ) : (
              <span className="text-yellow-500">None defined</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Risks & Objections</span>
            {hasRisks ? (
              <span className="text-green-500 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> {risks.length} identified
              </span>
            ) : (
              <span className="text-yellow-500">None identified</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Assurances</span>
            {hasAssurances ? (
              risksWithoutAssurances.length > 0 ? (
                <span className="text-yellow-500">
                  {assurances.length} defined ({risksWithoutAssurances.length} risks unaddressed)
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> All risks addressed
                </span>
              )
            ) : (
              <span className="text-yellow-500">None defined</span>
            )}
          </div>
        </div>

        {/* Next steps */}
        {!hasUserSuccess || !hasResults || !hasAdvantages || !hasRisks || risksWithoutAssurances.length > 0 ? (
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Recommended Next Steps</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              {!hasUserSuccess && (
                <li className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                  <span>Define your user success statement in step 1</span>
                </li>
              )}
              {!hasResults && (
                <li className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                  <span>Complete the results section in step 2</span>
                </li>
              )}
              {!hasAdvantages && (
                <li className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                  <span>Define your key advantages in step 3</span>
                </li>
              )}
              {!hasRisks && (
                <li className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                  <span>Identify potential risks and objections in step 4</span>
                </li>
              )}
              {hasRisks && risksWithoutAssurances.length > 0 && (
                <li className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                  <span>Create assurances for all identified risks in step 5</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="bg-[#273B33] p-4 rounded-lg border border-green-600">
            <h4 className="text-green-400 font-medium mb-2 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Canvas Complete
            </h4>
            <p className="text-gray-300 text-sm">
              Great job! You've completed all the fundamental components of your offer. 
              In the next sections, you'll build your landing page based on this foundation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 