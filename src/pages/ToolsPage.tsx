import React from 'react';
import { Link } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  isLocked?: boolean;
}

const tools: Tool[] = [
  {
    id: 'model-analyzer',
    name: 'Free Model Analyzer',
    description: 'Analyze your product\'s business model and get actionable insights.',
    icon: '🎯',
    path: '/model'
  },
  {
    id: 'irresistible-offer',
    name: 'Irresistible Offer Analyzer',
    description: 'Create an offer your customers can\'t refuse.',
    icon: '💎',
    path: '/app/tools/irresistible-offer',
    isLocked: true
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey Map',
    description: 'Map and optimize your customer\'s journey.',
    icon: '🗺️',
    path: '/app/tools/journey',
    isLocked: true
  },
  {
    id: 'value-prop',
    name: 'Value Proposition Canvas',
    description: 'Design a compelling value proposition.',
    icon: '📊',
    path: '/app/tools/value-prop',
    isLocked: true
  },
  {
    id: 'growth-strategy',
    name: 'Growth Strategy Builder',
    description: 'Build a data-driven growth strategy.',
    icon: '📈',
    path: '/app/tools/growth',
    isLocked: true
  },
  {
    id: 'pricing-strategy',
    name: 'Pricing Strategy Optimizer',
    description: 'Optimize your pricing for maximum growth.',
    icon: '💰',
    path: '/app/tools/pricing',
    isLocked: true
  }
];

export function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#1C1C1C] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Product Strategy Tools
          </h1>
          <p className="text-xl text-gray-300">
            Transform your product strategy with our interactive tools and frameworks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-[#2A2A2A] rounded-lg p-6 relative overflow-hidden group"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {tool.name}
              </h3>
              <p className="text-gray-300 mb-4">
                {tool.description}
              </p>
              {tool.isLocked ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Coming Soon</span>
                  <Link
                    to="/signup"
                    className="text-[#FFD23F] hover:underline inline-flex items-center"
                  >
                    Get Notified
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <Link
                  to={tool.path}
                  className="text-[#FFD23F] hover:underline inline-flex items-center"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
              
              {tool.isLocked && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-lg font-medium">Coming Soon</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 