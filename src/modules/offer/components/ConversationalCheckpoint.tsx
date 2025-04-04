import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';
import type { ConversationalCheckpoint as CheckpointType } from '../services/ai/types';
import { DraggableSuggestionsList } from './DraggableSuggestion';

interface ConversationalCheckpointProps {
  checkpoint: CheckpointType;
  onClose: () => void;
  onSelectSuggestion: (text: string) => void;
  onChatRequest?: () => void;
}

export function ConversationalCheckpoint({ 
  checkpoint, 
  onClose, 
  onSelectSuggestion,
  onChatRequest
}: ConversationalCheckpointProps) {
  return (
    <div className="bg-[#222222] border border-[#444444] rounded-lg p-4 mt-4 shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 text-[#FFD23F] mr-2" />
          <h4 className="text-white font-medium">AI Assistant</h4>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-4">{checkpoint.message}</p>
      
      <DraggableSuggestionsList 
        suggestions={checkpoint.suggestions} 
        type={checkpoint.type}
        onSelect={onSelectSuggestion}
      />
      
      {onChatRequest && (
        <div className="mt-4">
          <button
            onClick={onChatRequest}
            className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-[#FFD23F]" />
            Continue the conversation
          </button>
        </div>
      )}
    </div>
  );
}

export function ActiveConversationalCheckpoint({
  fieldType,
  onSelectSuggestion,
  onChatRequest
}: {
  fieldType: string;
  onSelectSuggestion: (text: string) => void;
  onChatRequest?: () => void;
}) {
  const { conversationalCheckpoints, activeCheckpoint, setActiveCheckpoint } = useOfferStore();
  
  const currentCheckpoint = conversationalCheckpoints.find(c => c.id === activeCheckpoint && c.type === fieldType);
  
  if (!currentCheckpoint) return null;
  
  return (
    <ConversationalCheckpoint
      checkpoint={currentCheckpoint}
      onClose={() => setActiveCheckpoint(null)}
      onSelectSuggestion={onSelectSuggestion}
      onChatRequest={onChatRequest}
    />
  );
}
