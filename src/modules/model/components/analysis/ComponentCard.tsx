import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ComponentCardProps {
  title: string;
  score: number;
  strengths: string[];
  recommendations: string[];
  analysis?: string;
  metrics?: {
    [key: string]: number;
  };
}

export function ComponentCard({ 
  title, 
  score, 
  strengths, 
  recommendations,
  analysis,
  metrics 
}: ComponentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-[#FFD23F]';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#1C1C1C] border border-[#333333] rounded-lg">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="flex items-center space-x-3">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </span>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#333333] p-4 space-y-4">
          {/* Analysis */}
          {analysis && (
            <div>
              <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Analysis</h4>
              <p className="text-gray-300">{analysis}</p>
            </div>
          )}

          {/* Metrics */}
          {metrics && Object.keys(metrics).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="bg-[#2A2A2A] p-3 rounded-lg">
                    <div className="text-sm text-gray-400">{key}</div>
                    <div className={`text-lg font-semibold ${getScoreColor(value)}`}>
                      {value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          <div>
            <h4 className="text-sm font-medium text-green-400 mb-2">Strengths</h4>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-400" />
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                  <span className="text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}