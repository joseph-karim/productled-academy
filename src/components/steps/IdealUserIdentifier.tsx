import React, { useState } from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Loader2, MessageSquarePlus, CheckCircle } from 'lucide-react';
import { identifyIdealUser } from '../../services/ai';
import { ErrorMessage } from '../shared/ErrorMessage';
import { IdealUserWizard } from '../wizard/IdealUserWizard';
import type { IdealUser } from '../../types';

export function IdealUserIdentifier() {
  const { 
    productDescription, 
    idealUser, 
    setIdealUser 
  } = useFormStore();
  
  const [showGuidance, setShowGuidance] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState<IdealUser>({
    title: '',
    description: '',
    motivation: 'Medium',
    ability: 'Medium',
    traits: ['', '', ''],
    impact: ''
  });

  const handleGetSuggestion = async () => {
    if (!productDescription) {
      setError("Please provide a product description first");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await identifyIdealUser(productDescription);
      setFormData({
        title: result.idealUser.title,
        description: result.idealUser.description,
        motivation: result.idealUser.motivation,
        ability: result.idealUser.ability,
        traits: result.traits,
        impact: result.impact
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      setError("Please fill in at least the title and description");
      return;
    }
    
    setIdealUser(formData);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Ideal User</h2>
          <p className="text-gray-400 mt-1">
            Identify who would benefit most from your product and be most likely to become a paying customer.
          </p>
        </div>
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-[#FFD23F] hover:text-[#FFD23F]/80"
          title={showGuidance ? "Hide guidance" : "Show guidance"}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {showGuidance && (
        <div className="description-framework">
          <div>
            <h3 className="framework-heading">Why Identify Your Ideal User?</h3>
            <p className="text-sm text-gray-300 mt-1">
              Only 3% of companies feel they know their ideal user better than anyone else in their market. Identifying your ideal user helps with:
            </p>
            <ul className="mt-2 space-y-2">
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Enhanced product-market fit</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>More efficient resource allocation</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>More effective marketing and messaging</span>
              </li>
              <li className="framework-list-item">
                <span className="framework-bullet" />
                <span>Stronger user loyalty and advocacy</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#2A2A2A] p-3 rounded-lg">
              <h4 className="text-white font-medium">Motivation</h4>
              <p className="text-sm text-gray-300">How motivated are they to solve the problem?</p>
            </div>
            <div className="bg-[#2A2A2A] p-3 rounded-lg">
              <h4 className="text-white font-medium">Ability</h4>
              <p className="text-sm text-gray-300">How easy is it for them to use your product?</p>
            </div>
          </div>
        </div>
      )}

      {!idealUser && (
        <div className="flex space-x-4">
          <button
            onClick={() => setShowWizard(true)}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
          >
            <MessageSquarePlus className="w-5 h-5 mr-2" />
            Use Chat Assistant
          </button>
          <button
            onClick={handleGetSuggestion}
            disabled={isAnalyzing || !productDescription}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg ${
              isAnalyzing || !productDescription
                ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                : 'bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] hover:bg-[#FFD23F] hover:text-[#1C1C1C]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Get AI Suggestion
              </>
            )}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {idealUser ? (
          <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{idealUser.title}</h3>
                  <p className="text-gray-300 mt-1">{idealUser.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Motivation & Ability</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Motivation:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          idealUser.motivation === 'High' 
                            ? 'bg-green-900/20 text-green-400'
                            : idealUser.motivation === 'Medium'
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {idealUser.motivation}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ability:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          idealUser.ability === 'High' 
                            ? 'bg-green-900/20 text-green-400'
                            : idealUser.ability === 'Medium'
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {idealUser.ability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Key Traits</h4>
                    <ul className="space-y-1">
                      {idealUser.traits.map((trait, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD23F]" />
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Business Impact</h4>
                  <p className="text-gray-300">{idealUser.impact}</p>
                </div>
              </div>

              <button
                onClick={() => setIdealUser(undefined)}
                className="text-sm text-[#FFD23F] hover:text-[#FFD23F]/80"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Marketing Manager"
                    className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your ideal user..."
                    rows={3}
                    className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Motivation Level
                  </label>
                  <select
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Ability Level
                  </label>
                  <select
                    value={formData.ability}
                    onChange={(e) => setFormData({ ...formData, ability: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Key Traits (up to 5)
              </label>
              <div className="space-y-2">
                {formData.traits.map((trait, index) => (
                  <input
                    key={index}
                    type="text"
                    value={trait}
                    onChange={(e) => {
                      const newTraits = [...formData.traits];
                      newTraits[index] = e.target.value;
                      setFormData({ ...formData, traits: newTraits });
                    }}
                    placeholder={`Trait ${index + 1}`}
                    className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  />
                ))}
                {formData.traits.length < 5 && (
                  <button
                    onClick={() => setFormData({ ...formData, traits: [...formData.traits, ''] })}
                    className="text-sm text-[#FFD23F] hover:text-[#FFD23F]/80"
                  >
                    + Add another trait
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Business Impact
              </label>
              <textarea
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                placeholder="Describe the business impact..."
                rows={2}
                className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.description}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  !formData.title || !formData.description
                    ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Ideal User
              </button>
            </div>
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleGetSuggestion}
          />
        )}
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <IdealUserWizard onClose={() => setShowWizard(false)} />
        </div>
      )}
    </div>
  );
}