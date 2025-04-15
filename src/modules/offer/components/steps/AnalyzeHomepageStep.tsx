import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useOfferStore } from '../../store/offerStore';
import { ContextChatInline } from '../ContextChatInline';
import { InitialContext } from '../../services/ai/types';
import { WebsiteFindings } from '../../services/ai/contextChat';
// Re-implementing based on the working logic from the old ContextGatheringForm (commit 3a7ca06)
// This step is optional, progression is handled by the main MultiStepForm buttons.

export function AnalyzeHomepageStep({ readOnly = false }: { readOnly?: boolean }) {
  // Select necessary state slices from store
  const websiteUrl = useOfferStore((state) => state.websiteUrl);
  const setWebsiteUrl = useOfferStore((state) => state.setWebsiteUrl);
  const startWebsiteScraping = useOfferStore((state) => state.startWebsiteScraping);
  const checkScrapingStatus = useOfferStore((state) => state.checkScrapingStatus);
  const scrapingStatus = useOfferStore((state) => state.websiteScraping.status);
  const scrapingId = useOfferStore((state) => state.websiteScraping.scrapingId);
  const coreOffer = useOfferStore((state) => state.websiteScraping.coreOffer);
  const scrapingError = useOfferStore((state) => state.websiteScraping.error);
  const initialContext = useOfferStore((state) => state.initialContext);

  // Prepare websiteFindings prop for ContextChat
  const websiteFindings = useOfferStore((state) => {
      console.log('Preparing websiteFindings:', state.websiteScraping);
      if (state.websiteScraping.status === 'completed') {
          // Direct mapping from store values
          return {
              coreOffer: state.websiteScraping.coreOffer || '',
              targetAudience: state.websiteScraping.targetAudience || '',
              problemSolved: state.websiteScraping.keyProblem || '',
              valueProposition: state.websiteScraping.valueProposition || '',
              keyBenefits: Array.isArray(state.websiteScraping.keyFeatures) ? state.websiteScraping.keyFeatures : [],
              keyPhrases: Array.isArray(state.websiteScraping.keyPhrases) ? state.websiteScraping.keyPhrases : [],
              missingInfo: []
          };
      }
      return null;
  }) as WebsiteFindings | null;

  // Local state for this step
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // URL Validation Effect
  useEffect(() => {
    let normalizedUrl = websiteUrl || '';
    if (normalizedUrl.length > 0 && !normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    const urlPattern = /^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/;
    setIsValidUrl(urlPattern.test(normalizedUrl));
  }, [websiteUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
  };

  // Start/Re-Analyze Handler
  const handleStartScraping = async () => {
    setShowChat(false);
    setIsRefreshing(false);
    let urlToScrape = websiteUrl;
    if (websiteUrl && websiteUrl.length > 0 && !websiteUrl.match(/^https?:\/\//i)) {
      urlToScrape = `https://${websiteUrl}`;
    }
    if (isValidUrl && urlToScrape) {
      await startWebsiteScraping(urlToScrape);
    } else {
      console.warn("Attempted to scrape invalid URL:", urlToScrape);
    }
  };

  // Manual Status Refresh Handler
  const handleRefreshStatus = async () => {
    if (!scrapingId || isRefreshing) return;
    setIsRefreshing(true);
    try {
        await checkScrapingStatus(scrapingId);
    } catch (err) {
        console.error("Error refreshing status:", err);
    } finally {
        setIsRefreshing(false);
    }
  };

  // Variables for rendering status
  const isProcessing = scrapingStatus === 'processing';
  const isCompleted = scrapingStatus === 'completed';
  const isFailed = scrapingStatus === 'failed';

  // DIRECT FIX: Force show chat when scraping completes
  useEffect(() => {
    const handleScrapingCompletion = () => {
      console.log('DIRECT FIX - Scraping status:', scrapingStatus);

      if (scrapingStatus === 'completed' && !readOnly) {
        console.log('DIRECT FIX - Forcing chat to show');
        // Force a small delay to ensure state updates have propagated
        setTimeout(() => {
          setShowChat(true);
        }, 500);
      }
    };

    // Call immediately
    handleScrapingCompletion();

    // Also set up an interval to keep checking (belt and suspenders approach)
    const intervalId = setInterval(handleScrapingCompletion, 1000);

    return () => clearInterval(intervalId);
  }, [scrapingStatus, readOnly]);

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Analyze Homepage Context (Optional)</h2>
        <p className="text-gray-400">Enter your website URL below...</p>
        <p className="text-sm text-gray-500">This step is optional...</p>
      </div>

      {/* URL Input & Actions Section */}
      <div className="bg-[#222222] p-6 rounded-lg space-y-4">
        <label htmlFor="websiteUrlInput" className="block text-sm font-medium text-gray-300">Website URL</label>
        <div className="flex space-x-2 items-start">
          <input
            id="websiteUrlInput" type="url" value={websiteUrl || ''}
            onChange={handleUrlChange} placeholder="https://yourwebsite.com"
            disabled={isProcessing || readOnly}
            className="flex-1 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
          />
          <div className="flex flex-col space-y-2">
            {/* Analyze / Re-Analyze Button */}
            <button onClick={handleStartScraping} disabled={!isValidUrl || isProcessing || readOnly} className="flex items-center justify-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50">
              {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : isCompleted ? 'Re-Analyze' : 'Analyze'}
            </button>
            {/* Manual Refresh Button */}
            {isProcessing && !readOnly && (
                 <button onClick={handleRefreshStatus} disabled={isRefreshing} className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50">
                   <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Status
                 </button>
            )}
          </div>
        </div>

        {/* Status Display */}
        {isProcessing && <p className="text-sm text-[#FFD23F] mt-2">Analyzing your website. This may take a minute...</p>}
        {isCompleted && !showChat && (
             <div className="text-green-500 text-sm mt-2">
                <span>Website analysis complete.</span>
                {!readOnly && <button onClick={() => setShowChat(true)} className="text-blue-500 hover:underline">Start AI Chat</button>}
             </div>
         )}
        {isFailed && <div className="mt-2 p-3 bg-red-900 border border-red-700 rounded-md text-red-200 text-sm">Failed to analyze website: {scrapingError || 'Unknown error'}</div>}
      </div>

      {/* DIRECT FIX: Simplified conditional rendering of ContextChat */}
      {(showChat || isCompleted) && !readOnly && (
        <div className="mt-6 bg-[#222222] p-6 rounded-lg space-y-4">
           <h3 className="text-xl font-semibold text-white mb-3">Refine Your Offer with AI</h3>
           {!coreOffer && <p className="text-yellow-500 mb-3">Note: Some offer details may be missing from the analysis.</p>}
           {/* Debug info */}
           <div className="text-xs text-gray-400 mb-2">
             <p>Debug: Chat should be visible.</p>
             <p>Status: {scrapingStatus}, ShowChat: {showChat.toString()}, ReadOnly: {readOnly.toString()}</p>
             <p>Findings available: {websiteFindings ? 'Yes' : 'No'}</p>
             <p>CoreOffer: {coreOffer || 'None'}</p>
           </div>
           <ContextChatInline
             websiteUrl={websiteUrl}
             initialContext={initialContext}
             websiteScrapingStatus={scrapingStatus}
             websiteFindings={websiteFindings}
           />
        </div>
      )}

      {readOnly && <p className="text-yellow-500 mt-4 text-center">Read-only mode: Cannot perform analysis or use chat.</p>}
    </div>
  );
}
