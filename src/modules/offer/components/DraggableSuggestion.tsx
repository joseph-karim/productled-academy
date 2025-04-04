import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import type { AISuggestion } from '../services/ai/types';

interface DraggableSuggestionProps {
  suggestion: AISuggestion;
  onSelect: (suggestionText: string) => void;
}

export function DraggableSuggestion({ suggestion, onSelect }: DraggableSuggestionProps) {
  const { removeAISuggestion } = useOfferStore();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', suggestion.text);
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleClick = () => {
    onSelect(suggestion.text);
    removeAISuggestion(suggestion.id);
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all
        bg-[#333333] text-white border border-[#444444] hover:bg-[#444444]
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <MessageSquarePlus className="w-4 h-4 mr-2 text-[#FFD23F]" />
      <div className="flex-1 text-sm">
        {suggestion.text}
      </div>
      {suggestion.description && (
        <div className="ml-2 text-xs text-gray-400">
          {suggestion.description}
        </div>
      )}
    </div>
  );
}

export function DraggableSuggestionsList({ 
  suggestions, 
  type, 
  onSelect 
}: { 
  suggestions: AISuggestion[]; 
  type: string;
  onSelect: (suggestionText: string) => void;
}) {
  const filteredSuggestions = suggestions.filter(s => s.type === type);
  
  if (filteredSuggestions.length === 0) return null;
  
  return (
    <div className="space-y-2 mt-4">
      <p className="text-sm text-gray-400">AI suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {filteredSuggestions.map(suggestion => (
          <DraggableSuggestion 
            key={suggestion.id} 
            suggestion={suggestion}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
