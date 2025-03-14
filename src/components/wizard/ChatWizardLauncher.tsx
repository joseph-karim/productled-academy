import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatWizard } from './ChatWizard';

export function ChatWizardLauncher() {
  const [showWizard, setShowWizard] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowWizard(true)}
        className="flex items-center px-4 py-2 rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        <span>Use Chat Assistant</span>
      </button>
      
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <ChatWizard onClose={() => setShowWizard(false)} />
        </div>
      )}
    </>
  );
}