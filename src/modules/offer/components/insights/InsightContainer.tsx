import React, { useState } from 'react';
import { Sparkles, X, Maximize2, Minimize2 } from 'lucide-react';
import { InsightPanel } from './InsightPanel';

interface InsightContainerProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function InsightContainer({ isOpen = false, onToggle }: InsightContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed transition-all duration-300 ease-in-out ${
        isExpanded 
          ? 'inset-4 z-50 flex items-center justify-center bg-black bg-opacity-75'
          : 'bottom-4 right-4 z-40 w-[450px] max-w-[calc(100vw-2rem)]'
      }`}
    >
      <div 
        className={`bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden border border-[#333333] ${
          isExpanded ? 'w-full max-w-4xl h-[80vh]' : 'w-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#1C1C1C] p-4 border-b border-[#333333] flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-[#FFD23F] mr-2" />
            <h3 className="text-white font-medium">AI Offer Insights</h3>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleToggleExpand}
              className="text-gray-400 hover:text-white p-1"
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            {onToggle && (
              <button 
                onClick={onToggle}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={isExpanded ? 'h-[calc(80vh-60px)] overflow-y-auto' : ''}>
          <InsightPanel />
        </div>
      </div>
    </div>
  );
}
