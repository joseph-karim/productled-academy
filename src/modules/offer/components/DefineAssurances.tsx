import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, Edit, Loader2, ShieldCheck } from 'lucide-react';

interface AssuranceFormProps {
  onSubmit: (riskId: string, text: string) => void;
  onCancel: () => void;
  risks: Array<{ id: string; text: string }>;
  initialRiskId?: string;
  initialText?: string;
  isEdit?: boolean;
}

function AssuranceForm({ 
  onSubmit, 
  onCancel, 
  risks, 
  initialRiskId = '', 
  initialText = '', 
  isEdit = false 
}: AssuranceFormProps) {
  const [riskId, setRiskId] = useState(initialRiskId || (risks.length > 0 ? risks[0].id : ''));
  const [text, setText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && riskId) {
      onSubmit(riskId, text);
      setText('');
      // Don't reset riskId to make adding multiple assurances easier
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1A1A] p-4 rounded-lg">
      <div>
        <label htmlFor="risk-select" className="block text-sm font-medium text-gray-300 mb-1">
          Risk to Address
        </label>
        <select
          id="risk-select"
          value={riskId}
          onChange={(e) => setRiskId(e.target.value)}
          className="w-full p-2 bg-[#121212] text-white border border-[#333333] rounded-lg focus:border-[#FFD23F] focus:outline-none"
          required
          disabled={isEdit || risks.length === 0}
        >
          {risks.length === 0 ? (
            <option value="" disabled>No risks available - add risks first</option>
          ) : (
            risks.map(risk => (
              <option key={risk.id} value={risk.id}>
                {risk.text.length > 50 ? risk.text.substring(0, 50) + '...' : risk.text}
              </option>
            ))
          )}
        </select>
      </div>
      
      <div>
        <label htmlFor="assurance-text" className="block text-sm font-medium text-gray-300 mb-1">
          Assurance
        </label>
        <textarea
          id="assurance-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Our intuitive interface requires no training, with most users productive within 15 minutes"
          className="w-full h-24 p-2 bg-[#121212] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
          disabled={risks.length === 0}
        >
          {isEdit ? 'Update' : 'Add'} Assurance
        </button>
      </div>
    </form>
  );
}

interface AssuranceItemProps {
  id: string;
  riskText: string;
  text: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

function AssuranceItem({ id, riskText, text, onEdit, onDelete, readOnly = false }: AssuranceItemProps) {
  return (
    <div className="bg-[#1A1A1A] p-4 rounded-lg">
      <div className="mb-2 text-sm text-gray-400 border-b border-[#333333] pb-2">
        Addressing: {riskText}
      </div>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
          <p className="text-gray-300">{text}</p>
        </div>
        
        {!readOnly && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onEdit(id)}
              className="text-gray-400 hover:text-white"
              aria-label="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="text-gray-400 hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DefineAssurances({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    risks, 
    assurances, 
    addAssurance, 
    updateAssurance, 
    removeAssurance 
  } = useOfferStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleAddAssurance = (riskId: string, text: string) => {
    addAssurance(riskId, text);
    setShowForm(false);
  };

  const handleUpdateAssurance = (riskId: string, text: string) => {
    if (editingId) {
      updateAssurance(editingId, { text });
      setEditingId(null);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const generateAssurances = () => {
    setIsGenerating(true);
    
    // Simulate API call - in a real implementation, this would be an AI-powered suggestion
    setTimeout(() => {
      // For each risk without an assurance, generate one
      risks.forEach(risk => {
        // Check if this risk already has an assurance
        const hasAssurance = assurances.some(a => a.riskId === risk.id);
        
        if (!hasAssurance) {
          let assuranceText = '';
          
          // Generate an appropriate assurance based on the risk text
          const riskText = risk.text.toLowerCase();
          
          if (riskText.includes('complicated') || riskText.includes('difficult') || riskText.includes('learning')) {
            assuranceText = "Our intuitive interface is designed for ease of use, with guided onboarding that gets users productive within minutes, not days.";
          }
          else if (riskText.includes('expensive') || riskText.includes('cost') || riskText.includes('price')) {
            assuranceText = "We offer a 30-day free trial with no credit card required, so you can experience the full value before making any financial commitment.";
          }
          else if (riskText.includes('security') || riskText.includes('privacy') || riskText.includes('data')) {
            assuranceText = "Your data is protected with enterprise-grade security and encryption. We're fully GDPR compliant and never share your information with third parties.";
          }
          else if (riskText.includes('doubt') || riskText.includes('skeptical') || riskText.includes('proof')) {
            assuranceText = "Don't just take our word for it - read testimonials from companies like yours who have achieved measurable success with our solution.";
          }
          else if (riskText.includes('change') || riskText.includes('workflow') || riskText.includes('hesitant')) {
            assuranceText = "Our solution integrates seamlessly with your existing tools and workflows, minimizing disruption while maximizing productivity gains.";
          }
          else {
            assuranceText = "We offer an unconditional 30-day money-back guarantee. If you're not completely satisfied, we'll provide a full refund with no questions asked.";
          }
          
          addAssurance(risk.id, assuranceText);
        }
      });
      
      setIsGenerating(false);
    }, 2000);
  };

  // Get the assurance being edited
  const assuranceBeingEdited = editingId 
    ? assurances.find(assurance => assurance.id === editingId) 
    : null;

  // Function to get risk text from risk ID
  const getRiskText = (riskId: string) => {
    const risk = risks.find(r => r.id === riskId);
    return risk ? risk.text : "Risk not found";
  };

  // Calculate risks without assurances
  const risksWithoutAssurances = risks.filter(risk => 
    !assurances.some(assurance => assurance.riskId === risk.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Define Assurances</h2>
        <p className="text-gray-300 mb-4">
          For each risk you identified, create an assurance that addresses the concern.
          Effective assurances build confidence and remove barriers to conversion.
        </p>
        <p className="text-gray-300">
          Focus on specifics, not generalities. "We're user-friendly" is weak; "Most users master our interface in under 15 minutes" is strong.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Your Assurances</h3>
          {!readOnly && !showForm && !editingId && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
                disabled={risks.length === 0}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Assurance
              </button>
              <button
                onClick={generateAssurances}
                disabled={isGenerating || risks.length === 0 || risksWithoutAssurances.length === 0}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Assurances'
                )}
              </button>
            </div>
          )}
        </div>

        {risks.length === 0 && (
          <div className="bg-[#1A1A1A] p-4 rounded-lg mb-6 text-center text-yellow-400">
            <p>You need to identify risks before adding assurances. Go back to the previous step to add risks.</p>
          </div>
        )}

        {/* Form for adding assurances */}
        {showForm && !readOnly && (
          <div className="mb-6">
            <AssuranceForm 
              onSubmit={handleAddAssurance}
              onCancel={() => setShowForm(false)}
              risks={risksWithoutAssurances.length > 0 ? risksWithoutAssurances : risks}
            />
          </div>
        )}

        {/* Form for editing an existing assurance */}
        {editingId && assuranceBeingEdited && !readOnly && (
          <div className="mb-6">
            <AssuranceForm 
              onSubmit={handleUpdateAssurance}
              onCancel={handleCancelEdit}
              risks={risks}
              initialRiskId={assuranceBeingEdited.riskId}
              initialText={assuranceBeingEdited.text}
              isEdit
            />
          </div>
        )}

        {/* List of assurances */}
        <div className="space-y-4">
          {assurances.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {readOnly 
                ? "No assurances have been defined yet." 
                : risks.length > 0 
                  ? "Add assurances to address the risks you identified." 
                  : "You'll need to add risks before creating assurances."}
            </div>
          ) : (
            assurances.map(assurance => (
              <AssuranceItem 
                key={assurance.id}
                id={assurance.id}
                riskText={getRiskText(assurance.riskId)}
                text={assurance.text}
                onEdit={handleEdit}
                onDelete={removeAssurance}
                readOnly={readOnly}
              />
            ))
          )}
        </div>

        {!readOnly && assurances.length > 0 && risksWithoutAssurances.length > 0 && (
          <div className="mt-6 text-sm text-yellow-400">
            <p>
              {risksWithoutAssurances.length === 1 
                ? "1 risk still needs an assurance." 
                : `${risksWithoutAssurances.length} risks still need assurances.`}
            </p>
          </div>
        )}

        {!readOnly && risksWithoutAssurances.length === 0 && risks.length > 0 && (
          <div className="mt-6 text-sm text-green-400">
            <p>Great job! You've created assurances for all identified risks.</p>
          </div>
        )}
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Effective Assurance Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Guarantees</h4>
            <p className="text-gray-300 text-sm">
              "30-day money-back guarantee, no questions asked"
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Social Proof</h4>
            <p className="text-gray-300 text-sm">
              "Used by 10,000+ companies, including [notable names]"
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Specificity</h4>
            <p className="text-gray-300 text-sm">
              "99.9% uptime guaranteed by our SLA"
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Free Trial/Demo</h4>
            <p className="text-gray-300 text-sm">
              "Try the full product free for 14 days, no credit card required"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 