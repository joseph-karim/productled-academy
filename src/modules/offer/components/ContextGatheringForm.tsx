import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';

interface ContextGatheringFormProps {
  onNext: () => void;
}

export function ContextGatheringForm({ onNext }: ContextGatheringFormProps) {
  const { 
    websiteUrl, 
    initialContext, 
    websiteScraping, 
    setWebsiteUrl, 
    setInitialContext, 
    startWebsiteScraping 
  } = useOfferStore();
  
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showUrlFormatMessage, setShowUrlFormatMessage] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setWebsiteUrl(url);
    
    const isValid = url.match(/^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/) !== null;
    setIsValidUrl(isValid);
    
    setShowUrlFormatMessage(url.length > 0 && !url.match(/^(http|https):\/\//));
  };

  const handleStartScraping = async () => {
    if (isValidUrl && websiteUrl) {
      await startWebsiteScraping(websiteUrl);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Tell Us About Your Offer</h2>
        <p className="text-gray-300">
          Let's start by gathering some basic information about your current offer.
          This will help us provide more tailored guidance as you build your irresistible offer.
        </p>
      </div>

      {/* Website URL Input */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Your Website</h3>
        <p className="text-gray-300 mb-6">
          If you have a website for your product or service, please enter the URL below.
          This will help us understand your current positioning.
        </p>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="url"
              value={websiteUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="flex-1 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none"
            />
            <button
              onClick={handleStartScraping}
              disabled={!isValidUrl || websiteScraping.status === 'processing'}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              {websiteScraping.status === 'processing' ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </div>
              ) : websiteScraping.status === 'completed' ? (
                'Analyzed'
              ) : (
                'Analyze Website'
              )}
            </button>
          </div>
          
          {/* Website scraping status */}
          {websiteScraping.status === 'processing' && (
            <p className="text-sm text-[#FFD23F]">
              Analyzing your website. This may take a minute...
            </p>
          )}
          
          {websiteScraping.status === 'completed' && (
            <p className="text-sm text-green-500">
              Website analysis complete! We've extracted key information.
            </p>
          )}
          
          {websiteScraping.status === 'failed' && (
            <p className="text-sm text-red-500">
              Failed to analyze website: {websiteScraping.error}
            </p>
          )}
          
          {showUrlFormatMessage && (
            <p className="text-sm text-red-500">
              Please include the full URL with "https://" prefix (e.g., https://example.com)
            </p>
          )}
          
          <p className="text-sm text-gray-400">
            (Optional) Providing your website helps us give more relevant suggestions.
          </p>
        </div>
      </div>

      {/* Current Offer Input */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Current Offer</h3>
        <p className="text-gray-300 mb-6">
          Briefly describe your current product or service offering.
        </p>
        
        <div className="space-y-4">
          <textarea
            value={initialContext.currentOffer}
            onChange={(e) => setInitialContext('currentOffer', e.target.value)}
            placeholder="Describe what you're currently offering to customers..."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none min-h-[120px]"
          />
        </div>
      </div>

      {/* Target Audience Input */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Target Audience</h3>
        <p className="text-gray-300 mb-6">
          Who is your product or service designed for?
        </p>
        
        <div className="space-y-4">
          <textarea
            value={initialContext.targetAudience}
            onChange={(e) => setInitialContext('targetAudience', e.target.value)}
            placeholder="Describe your ideal customers or users..."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none min-h-[120px]"
          />
        </div>
      </div>

      {/* Problem Solved Input */}
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Problem Solved</h3>
        <p className="text-gray-300 mb-6">
          What problem does your product or service solve for your customers?
        </p>
        
        <div className="space-y-4">
          <textarea
            value={initialContext.problemSolved}
            onChange={(e) => setInitialContext('problemSolved', e.target.value)}
            placeholder="Describe the main problem your offering solves..."
            className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none min-h-[120px]"
          />
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 font-medium"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
