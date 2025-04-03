import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, Edit, Loader2, AlertCircle } from 'lucide-react';

interface RiskFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialText?: string;
  isEdit?: boolean;
}

function RiskForm({ onSubmit, onCancel, initialText = '', isEdit = false }: RiskFormProps) {
  const [text, setText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1A1A] p-4 rounded-lg">
      <div>
        <label htmlFor="risk-text" className="block text-sm font-medium text-gray-300 mb-1">
          Risk or Objection
        </label>
        <textarea
          id="risk-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Users worry about the learning curve"
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
        >
          {isEdit ? 'Update' : 'Add'} Risk
        </button>
      </div>
    </form>
  );
}

interface RiskItemProps {
  id: string;
  text: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

function RiskItem({ id, text, onEdit, onDelete, readOnly = false }: RiskItemProps) {
  return (
    <div className="bg-[#1A1A1A] p-4 rounded-lg flex justify-between items-start">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
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
  );
}

export function IdentifyRisks({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { risks, addRisk, updateRisk, removeRisk, advantages } = useOfferStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleAddRisk = (text: string) => {
    addRisk(text);
    setShowForm(false);
  };

  const handleUpdateRisk = (text: string) => {
    if (editingId) {
      updateRisk(editingId, text);
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

  const generateRisks = () => {
    setIsGenerating(true);
    
    // Simulate API call - in a real implementation, this would be an AI-powered suggestion
    setTimeout(() => {
      const commonRisks = [
        "Users worry our product is too complicated to learn",
        "Potential customers think our solution is too expensive",
        "Users are concerned about data security and privacy",
        "Decision-makers might doubt our claims without proof",
        "Users are hesitant to change their current workflow"
      ];
      
      // Use the advantages to generate more relevant risks
      if (advantages.length > 0) {
        // Add a couple relevant risks based on advantages
        const advantage = advantages[0].text.toLowerCase();
        
        if (advantage.includes('time') || advantage.includes('fast')) {
          addRisk("Users are skeptical about our speed claims");
        }
        
        if (advantage.includes('save') || advantage.includes('cost')) {
          addRisk("Prospects worry about hidden costs beyond initial pricing");
        }
        
        if (advantage.includes('easy') || advantage.includes('simple')) {
          addRisk("Users doubt that our solution is truly easy to use");
        }
      }
      
      // Add a couple of common risks
      addRisk(commonRisks[0]);
      addRisk(commonRisks[1]);
      
      setIsGenerating(false);
    }, 1500);
  };

  // Get the risk being edited
  const riskBeingEdited = editingId 
    ? risks.find(risk => risk.id === editingId) 
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Identify Risks & Objections</h2>
        <p className="text-gray-300 mb-4">
          What concerns or objections might prevent users from adopting your product?
          Identifying these risks is crucial for building trust and addressing hesitations.
        </p>
        <p className="text-gray-300">
          In the next step, you'll create assurances that directly address these concerns.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">User Concerns</h3>
          {!readOnly && !showForm && !editingId && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Risk
              </button>
              <button
                onClick={generateRisks}
                disabled={isGenerating}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Suggest Common Risks'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Form for adding risks */}
        {showForm && !readOnly && (
          <div className="mb-6">
            <RiskForm 
              onSubmit={handleAddRisk}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Form for editing an existing risk */}
        {editingId && riskBeingEdited && !readOnly && (
          <div className="mb-6">
            <RiskForm 
              onSubmit={handleUpdateRisk}
              onCancel={handleCancelEdit}
              initialText={riskBeingEdited.text}
              isEdit
            />
          </div>
        )}

        {/* List of risks */}
        <div className="space-y-4">
          {risks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {readOnly 
                ? "No risks have been identified yet." 
                : "Add your first risk to get started."}
            </div>
          ) : (
            risks.map(risk => (
              <RiskItem 
                key={risk.id}
                id={risk.id}
                text={risk.text}
                onEdit={handleEdit}
                onDelete={removeRisk}
                readOnly={readOnly}
              />
            ))
          )}
        </div>

        {!readOnly && risks.length > 0 && (
          <div className="mt-6 text-sm text-gray-400">
            <p>
              {risks.length < 3 
                ? "Consider adding more risks to fully address potential objections."
                : "Good job! You've identified multiple risks to address."}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Why Address Risks?</h3>
        <div className="bg-[#1A1A1A] p-4 rounded-lg mb-4">
          <h4 className="text-white font-medium mb-2">Build Trust</h4>
          <p className="text-gray-300 text-sm">
            When you directly address potential concerns, you show prospects that you understand them
            and have nothing to hide. This transparency builds trust.
          </p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg mb-4">
          <h4 className="text-white font-medium mb-2">Overcome Hesitation</h4>
          <p className="text-gray-300 text-sm">
            Many users won't voice their objections—they'll simply leave. By proactively addressing concerns,
            you remove barriers to conversion.
          </p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Create Better Assurances</h4>
          <p className="text-gray-300 text-sm">
            Identifying specific risks enables you to create targeted assurances in the next step,
            making your offer more compelling and irresistible.
          </p>
        </div>
      </div>
    </div>
  );
} 