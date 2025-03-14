import React from 'react';
import { MessageSquarePlus, CheckCircle } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  icon?: 'chat' | 'feedback' | 'save';
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  isLoading?: boolean;
}

export function ActionButton({ 
  onClick, 
  icon = 'chat',
  label,
  variant = 'primary',
  disabled = false,
  isLoading = false
}: ActionButtonProps) {
  const Icon = icon === 'chat' ? MessageSquarePlus : 
              icon === 'feedback' ? MessageSquarePlus : 
              CheckCircle;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center px-4 py-2 rounded-lg ${
        disabled || isLoading
          ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
          : variant === 'primary'
          ? 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
          : 'bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] hover:bg-[#FFD23F] hover:text-[#1C1C1C]'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );
}