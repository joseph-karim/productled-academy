import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { InsightContainer } from './InsightContainer';

interface InsightButtonProps {
  label?: string;
}

export function InsightButton({ label = 'Get AI Insights' }: InsightButtonProps) {
  const [showInsights, setShowInsights] = useState(false);

  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  return (
    <>
      <button
        onClick={toggleInsights}
        className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 transition-colors"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        <span>{label}</span>
      </button>

      <InsightContainer 
        isOpen={showInsights} 
        onToggle={toggleInsights} 
      />
    </>
  );
}
