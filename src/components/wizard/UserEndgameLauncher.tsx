import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { UserEndgameWizard } from './UserEndgameWizard';
import type { UserLevel } from '../../types';

interface UserEndgameLauncherProps {
  level: UserLevel;
}

export function UserEndgameLauncher({ level }: UserEndgameLauncherProps) {
  const [showWizard, setShowWizard] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowWizard(true)}
        className="flex items-center px-4 py-2 rounded-lg bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] hover:bg-[#FFD23F] hover:text-[#1C1C1C]"
      >
        <MessageSquarePlus className="w-4 h-4 mr-2" />
        <span>Use Chat Assistant</span>
      </button>
      
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <UserEndgameWizard level={level} onClose={() => setShowWizard(false)} />
        </div>
      )}
    </>
  );
}