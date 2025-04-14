import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  disabled?: boolean;
}

interface InsightQuestionProps {
  question: string;
  options: Option[];
  onSelect: (optionId: string) => void;
}

export function InsightQuestion({ question, options, onSelect }: InsightQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative' | null>>({});

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onSelect(optionId);
  };

  const handleFeedback = (optionId: string, type: 'positive' | 'negative') => {
    setFeedback(prev => ({
      ...prev,
      [optionId]: prev[optionId] === type ? null : type
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">{question}</h3>

      <div className="space-y-3">
        {options.map(option => (
          <div
            key={option.id}
            className={`p-4 rounded-lg border transition-all ${option.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
              selectedOption === option.id
                ? 'border-[#FFD23F] bg-[#FFD23F]/10'
                : 'border-[#333333] bg-[#1C1C1C] hover:border-[#444444]'
            }`}
            onClick={() => !option.disabled && handleOptionSelect(option.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-white">{option.text}</p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(option.id, 'positive');
                  }}
                  className={`p-1 rounded-full ${
                    feedback[option.id] === 'positive'
                      ? 'bg-green-500 text-white'
                      : 'bg-[#333333] text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(option.id, 'negative');
                  }}
                  className={`p-1 rounded-full ${
                    feedback[option.id] === 'negative'
                      ? 'bg-red-500 text-white'
                      : 'bg-[#333333] text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
