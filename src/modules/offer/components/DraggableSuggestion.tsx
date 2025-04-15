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
      className={`flex items-start px-3 py-3 rounded-lg cursor-pointer transition-all
        bg-[#333333] text-white border border-[#444444] hover:bg-[#444444]
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        min-h-[3rem] h-auto
      `}
    >
      <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0 text-[#FFD23F] mt-1" />
      <div className="flex-1 text-sm overflow-hidden mr-2">
        <div className="line-clamp-2 whitespace-normal break-words">{suggestion.text}</div>
      </div>
      {suggestion.description && (
        <div className="ml-2 text-xs text-gray-400 flex-shrink-0">
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
      <div className="grid grid-cols-1 gap-2 max-w-full">
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
