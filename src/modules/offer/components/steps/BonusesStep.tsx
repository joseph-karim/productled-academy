import React, { useState } from 'react';
import { useOfferStore, Bonus } from '../../store/offerStore';
import { Plus, Trash2 } from 'lucide-react';
import { generateUUID } from '../../utils/uuid';

// Define local state type for editing a bonus
interface EditingBonus {
  id: string;
  name: string;
  description: string;
  value?: number | string; // Allow string for input editing
}

export function BonusesStep({ readOnly = false }: { readOnly?: boolean }) {
  const { bonuses, addBonus, updateBonus, removeBonus } = useOfferStore();
  const [editingBonus, setEditingBonus] = useState<Partial<EditingBonus> | null>(null);

  const handleAddNew = () => {
    if (readOnly) return;
    setEditingBonus({ name: '', description: '', value: '' }); // Start editing a new bonus
  };

  const handleEdit = (bonus: Bonus) => {
    if (readOnly) return;
    setEditingBonus({ ...bonus, value: bonus.value?.toString() ?? '' }); // Convert value to string for input
  };

  const handleSave = () => {
    if (readOnly || !editingBonus) return;

    const bonusData = {
      name: editingBonus.name?.trim() ?? '',
      description: editingBonus.description?.trim() ?? '',
      value: editingBonus.value ? parseFloat(editingBonus.value.toString()) : undefined,
    };

    if (!bonusData.name || !bonusData.description) {
      // Basic validation: require name and description
      alert("Bonus Name and Description are required."); // Replace with better validation UI
      return;
    }

    if (editingBonus.id) {
      // Update existing bonus
      updateBonus(editingBonus.id, bonusData);
    } else {
      // Add new bonus
      addBonus(bonusData);
    }
    setEditingBonus(null); // Close edit/add form
  };

  const handleCancel = () => {
    setEditingBonus(null);
  };

  const handleRemove = (id: string) => {
    if (!readOnly && window.confirm("Are you sure you want to remove this bonus?")) { // Simple confirmation
      removeBonus(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingBonus) return;
    const { name, value } = e.target;
    setEditingBonus({ ...editingBonus, [name]: value });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editingBonus) return;
      const value = e.target.value;
      // Allow empty string or numbers (optional)
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
          setEditingBonus({ ...editingBonus, value: value });
      }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-300">
        Add 1-3 valuable bonuses that complement your core offer and make it even more irresistible.
        Focus on bonuses that help customers achieve the desired result faster or easier.
      </p>

      {/* List existing bonuses */}
      <div className="space-y-4">
        {bonuses.map((bonus) => (
          <div key={bonus.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333] flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-white">{bonus.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{bonus.description}</p>
              {bonus.value && (
                <p className="text-xs text-[#FFD23F] mt-1">(Value: ${bonus.value.toLocaleString()})</p>
              )}
            </div>
            {!readOnly && (
              <div className="flex space-x-2 flex-shrink-0 ml-4">
                <button onClick={() => handleEdit(bonus)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                <button onClick={() => handleRemove(bonus.id)} className="text-red-500 hover:text-red-400 text-sm">Remove</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New / Edit Form */}
      {!readOnly && !editingBonus && bonuses.length < 3 && (
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bonus ({bonuses.length}/3)
        </button>
      )}

      {editingBonus && (
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#FFD23F] space-y-4 mt-4">
          <h4 className="font-semibold text-white">{editingBonus.id ? 'Edit Bonus' : 'Add New Bonus'}</h4>
          <div>
            <label htmlFor="bonusName" className="block text-sm font-medium text-gray-300 mb-1">Bonus Name</label>
            <input
              type="text"
              id="bonusName"
              name="name"
              value={editingBonus.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., Private Community Access"
              className="w-full p-2 bg-[#2A2A2A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="bonusDescription" className="block text-sm font-medium text-gray-300 mb-1">Primary Benefit</label>
            <textarea
              id="bonusDescription"
              name="description"
              rows={2}
              value={editingBonus.description || ''}
              onChange={handleInputChange}
              placeholder="e.g., Get faster answers and support from peers."
              className="w-full p-2 bg-[#2A2A2A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none resize-none"
            />
          </div>
          <div>
            <label htmlFor="bonusValue" className="block text-sm font-medium text-gray-300 mb-1">Perceived Value (Optional $)</label>
            <input
              type="text" // Use text to allow empty string and better validation control
              id="bonusValue"
              name="value"
              value={editingBonus.value ?? ''}
              onChange={handleValueChange}
              placeholder="e.g., 197"
              className="w-full p-2 bg-[#2A2A2A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={handleCancel} className="px-3 py-1 text-gray-400 hover:text-white text-sm">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1 bg-[#FFD23F] text-[#1C1C1C] rounded hover:bg-opacity-90 text-sm font-medium">Save Bonus</button>
          </div>
        </div>
      )}
    </div>
  );
} 