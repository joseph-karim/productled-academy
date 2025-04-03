import React from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Build Better Products with <span className="text-[#FFD23F]">ProductLed Academy</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your product strategy with our interactive tools and frameworks
          </p>
          <Link
            to="/model"
            className="inline-block px-8 py-3 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors"
          >
            Try Free Model Analyzer
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Model Analyzer */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Free Model Analyzer
            </h3>
            <p className="text-gray-300 mb-4">
              Analyze your product's business model and get actionable insights. No account required.
            </p>
            <Link
              to="/model"
              className="text-[#FFD23F] hover:underline inline-flex items-center"
            >
              Get Started
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Premium Features (requires auth) */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Save & Share
            </h3>
            <p className="text-gray-300 mb-4">
              Create an account to save your analyses and share them with your team.
            </p>
            <Link
              to="/login"
              className="text-[#FFD23F] hover:underline inline-flex items-center"
            >
              Sign Up
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Additional Modules */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              More Tools
            </h3>
            <p className="text-gray-300 mb-4">
              Access our full suite of product strategy tools and frameworks.
            </p>
            <Link
              to="/login"
              className="text-[#FFD23F] hover:underline inline-flex items-center"
            >
              Explore All Tools
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 