import React from 'react';
import { Star } from 'lucide-react';

interface LandingPageScorecardProps {
  score: {
    total: number;
    criteria: {
      [key: string]: number;
    };
    feedback: string;
  };
}

export function LandingPageScorecard({ score }: LandingPageScorecardProps) {
  // Helper function to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-[#FFD23F] fill-[#FFD23F]' : 'text-gray-500'
          }`}
        />
      );
    }
    return stars;
  };
  
  // Calculate overall score color
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-500';
    if (score >= 3) return 'text-[#FFD23F]';
    return 'text-red-500';
  };
  
  return (
    <div className="bg-[#222222] p-4 rounded-lg border border-[#444444]">
      <h4 className="text-lg font-medium text-[#FFD23F] mb-4">Landing Page Analysis</h4>
      
      <div className="flex items-center mb-4">
        <div className="text-2xl font-bold mr-2 flex items-center">
          <span className={getScoreColor(score.total)}>
            {score.total.toFixed(1)}
          </span>
          <span className="text-white text-lg">/5</span>
        </div>
        <div className="flex">
          {renderStars(Math.round(score.total))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Object.entries(score.criteria).map(([criterion, rating]) => (
          <div key={criterion} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{criterion}</span>
            <div className="flex">
              {renderStars(rating)}
            </div>
          </div>
        ))}
      </div>
      
      <div>
        <h5 className="text-white font-medium mb-2">Feedback</h5>
        <p className="text-gray-300 text-sm whitespace-pre-line">{score.feedback}</p>
      </div>
    </div>
  );
}
