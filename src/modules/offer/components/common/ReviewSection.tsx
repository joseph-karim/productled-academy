import React from 'react';
import { Loader2 } from 'lucide-react';

interface ReviewSectionProps {
  title: string;
  subtitle?: string;
  data: { label: string; value: string }[];
  aiFeedback?: {
    loading: boolean;
    content: string | null;
    rating?: number;
  };
  onEdit: () => void;
  onConfirm: () => void;
  isReadOnly?: boolean;
}

export function ReviewSection({
  title,
  subtitle,
  data,
  aiFeedback,
  onEdit,
  onConfirm,
  isReadOnly = false
}: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {subtitle && (
          <p className="text-gray-300 mb-4">{subtitle}</p>
        )}
      </div>

      {/* Display the data */}
      <div className="bg-[#1A1A1A] p-6 rounded-lg space-y-4">
        {data.map((item, index) => (
          <div key={index} className="border-b border-[#333333] pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
            <h4 className="text-white font-medium mb-1">{item.label}</h4>
            <p className="text-gray-300">{item.value || "Not provided"}</p>
          </div>
        ))}
      </div>

      {/* AI Feedback Section */}
      {aiFeedback && (
        <div className="bg-[#222222] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">AI Feedback</h3>
          
          {aiFeedback.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFD23F]" />
              <p className="ml-3 text-gray-300">Analyzing your information...</p>
            </div>
          ) : aiFeedback.content ? (
            <div>
              {aiFeedback.rating && (
                <div className="flex items-center mb-4">
                  <div className="bg-[#333333] px-3 py-1 rounded-full text-sm font-medium mr-2">
                    Initial Score: {aiFeedback.rating}/5
                  </div>
                </div>
              )}
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-line">{aiFeedback.content}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">No feedback available yet.</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex justify-between mt-6">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
          >
            Edit Information
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90"
          >
            Confirm &amp; Continue
          </button>
        </div>
      )}
    </div>
  );
}
