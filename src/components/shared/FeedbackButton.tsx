import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface FeedbackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
}

export function FeedbackButton({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  label = 'Get Feedback'
}: FeedbackButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center px-4 py-2 rounded-lg ${
        disabled || isLoading
          ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
          : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
      }`}
    >
      <MessageSquarePlus className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </button>
  );
}