import React from 'react';
import { ChatAssistantButton } from './ChatAssistantButton';
import { FeedbackButton } from './FeedbackButton';

interface ButtonGroupProps {
  onGetFeedback: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ButtonGroup({ onGetFeedback, disabled = false, isLoading = false }: ButtonGroupProps) {
  return (
    <div className="flex justify-end space-x-2">
      <ChatAssistantButton />
      <FeedbackButton 
        onClick={onGetFeedback}
        disabled={disabled}
        isLoading={isLoading}
      />
    </div>
  );
}