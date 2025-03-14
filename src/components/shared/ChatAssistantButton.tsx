import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { ChatWizard } from '../wizard/ChatWizard';

interface ChatAssistantButtonProps {
  label?: string;
}

export function ChatAssistantButton({ label = 'Use Chat Assistant' }: ChatAssistantButtonProps) {
  const [showWizard, setShowWizard] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowWizard(true)}
        className="flex items-center px-4 py-2 rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
      >
        <MessageSquarePlus className="w-4 h-4 mr-2" />
        <span>{label}</span>
      </button>
      
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <ChatWizard onClose={() => setShowWizard(false)} />
        </div>
      )}
    </>
  );
}