import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, X, Edit, Save, Trash2, Lightbulb, Loader2 } from 'lucide-react';

interface AdvantageFormProps {
  onSubmit: (text: string, description?: string) => void;
  onCancel: () => void;
  initialText?: string;
  initialDescription?: string;
  isEdit?: boolean;
}

function AdvantageForm({ 
  onSubmit, 
  onCancel, 
  initialText = '', 
  initialDescription = '',
  isEdit = false
}: AdvantageFormProps) {
  const [text, setText] = useState(initialText);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, description);
      setText('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1A1A] p-4 rounded-lg">
      <div>
        <label htmlFor="advantage-text" className="block text-sm font-medium text-gray-300 mb-1">
          Advantage
        </label>
        <input
          id="advantage-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., AI-powered insights"
          className="w-full p-2 bg-[#121212] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="advantage-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          id="advantage-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain how this advantage benefits the user"
          className="w-full h-20 p-2 bg-[#121212] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
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
          {isEdit ? 'Update' : 'Add'} Advantage
        </button>
      </div>
    </form>
  );
}

interface AdvantageItemProps {
  id: string;
  text: string;
  description?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

function AdvantageItem({ id, text, description, onEdit, onDelete, readOnly = false }: AdvantageItemProps) {
  return (
    <div className="bg-[#1A1A1A] p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <h4 className="text-white font-medium">{text}</h4>
        {!readOnly && (
          <div className="flex space-x-2">
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
      {description && <p className="text-gray-300 text-sm mt-2">{description}</p>}
    </div>
  );
}

export function DefineAdvantages({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { advantages, addAdvantage, updateAdvantage, removeAdvantage, setProcessing } = useOfferStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleAddAdvantage = (text: string, description?: string) => {
    addAdvantage(text, description);
    setShowForm(false);
  };

  const handleUpdateAdvantage = (text: string, description?: string) => {
    if (editingId) {
      updateAdvantage(editingId, { text, description });
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

  const generateAdvantages = () => {
    setIsGenerating(true);
    setProcessing('advantages', true);
    
    // Simulate API call
    setTimeout(() => {
      // Here we'd normally use AI to generate advantages based on the user's model data
      // For now, generate some sample advantages
      const sampleAdvantages = [
        {
          text: "Time-saving automation",
          description: "Reduce manual work by 75% with our intelligent workflow automation"
        },
        {
          text: "Intuitive user interface",
          description: "Designed for ease of use with a learning curve of minutes, not days"
        },
        {
          text: "Data-driven insights",
          description: "Make better decisions with real-time analytics and customizable dashboards"
        }
      ];
      
      // Add the sample advantages to the store
      sampleAdvantages.forEach(adv => {
        addAdvantage(adv.text, adv.description);
      });
      
      setIsGenerating(false);
      setProcessing('advantages', false);
    }, 1500);
  };

  // Find the advantage being edited
  const advantageBeingEdited = editingId 
    ? advantages.find(adv => adv.id === editingId) 
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Define Your Advantages</h2>
        <p className="text-gray-300 mb-4">
          What unique advantages does your product offer that make it stand out from alternatives?
          These advantages will form the core of your value proposition.
        </p>
        <p className="text-gray-300">
          Add at least 3-5 compelling advantages that speak directly to your users' needs and challenges.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Your Advantages</h3>
          {!readOnly && !showForm && !editingId && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Advantage
              </button>
              <button
                onClick={generateAdvantages}
                disabled={isGenerating}
                className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Form for adding/editing advantages */}
        {showForm && !readOnly && (
          <div className="mb-6">
            <AdvantageForm 
              onSubmit={handleAddAdvantage}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Form for editing an existing advantage */}
        {editingId && advantageBeingEdited && !readOnly && (
          <div className="mb-6">
            <AdvantageForm 
              onSubmit={handleUpdateAdvantage}
              onCancel={handleCancelEdit}
              initialText={advantageBeingEdited.text}
              initialDescription={advantageBeingEdited.description}
              isEdit
            />
          </div>
        )}

        {/* List of advantages */}
        <div className="space-y-4">
          {advantages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {readOnly 
                ? "No advantages have been defined yet." 
                : "Add your first advantage to start building your offer."}
            </div>
          ) : (
            advantages.map(advantage => (
              <AdvantageItem 
                key={advantage.id}
                id={advantage.id}
                text={advantage.text}
                description={advantage.description}
                onEdit={handleEdit}
                onDelete={removeAdvantage}
                readOnly={readOnly}
              />
            ))
          )}
        </div>

        {!readOnly && advantages.length > 0 && (
          <div className="mt-6 text-sm text-gray-400">
            <p>
              {advantages.length < 3 
                ? "Consider adding more advantages to strengthen your offer."
                : "Good job! You've identified multiple advantages."}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Strong Advantages</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-3">
          <li>Focus on benefits to the user, not just features of your product</li>
          <li>Be specific and quantify when possible (e.g., "Saves 5 hours per week")</li>
          <li>Consider both functional advantages (what it does) and emotional advantages (how it makes users feel)</li>
          <li>Highlight what makes your product different from competitors</li>
          <li>Keep language clear and jargon-free</li>
        </ul>
      </div>
    </div>
  );
} 