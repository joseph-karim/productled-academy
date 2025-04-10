import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useOfferStore } from '../../store/offerStore';
import OfferRefinementChat, { ChatMessage } from '../OfferRefinementChat'; // Added import
// Re-implementing based on the working logic from the old ContextGatheringForm (commit 3a7ca06)
// This step is optional, progression is handled by the main MultiStepForm buttons.

export function AnalyzeHomepageStep({ readOnly = false }: { readOnly?: boolean }) {
  // Select specific state slices for better re-render tracking
  const websiteUrl = useOfferStore((state) => state.websiteUrl);
  const setWebsiteUrl = useOfferStore((state) => state.setWebsiteUrl);
  const startWebsiteScraping = useOfferStore((state) => state.startWebsiteScraping);
  // Select nested properties individually
  const scrapingStatus = useOfferStore((state) => state.websiteScraping.status);
  const coreOffer = useOfferStore((state) => state.websiteScraping.coreOffer);
  const scrapingError = useOfferStore((state) => state.websiteScraping.error);
  // Keep the whole object for the API payload if needed, but don't use it for dependencies
  const websiteScraping = useOfferStore((state) => state.websiteScraping); 

  // Use local state for validation, mirroring the old form's approach
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Added chat messages state
  const [isChatLoading, setIsChatLoading] = useState(false); // Added chat loading state

  // Add debug log at the start of the component
  useEffect(() => {
    console.log("[Debug] Component mounted. Initial Status:", scrapingStatus);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to validate the URL whenever it changes in the store or locally
  useEffect(() => {
    let normalizedUrl = websiteUrl || '';
    if (normalizedUrl.length > 0 && !normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    const urlPattern = /^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/;
    setIsValidUrl(urlPattern.test(normalizedUrl));
  }, [websiteUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the store directly, useEffect above will handle validation state
    setWebsiteUrl(e.target.value); 
  };

  const handleStartScraping = async () => {
    // Reset messages when starting a new scrape
    setMessages([]); 
    
    // Normalize URL just before scraping, similar to the old logic
    let urlToScrape = websiteUrl;
    if (websiteUrl && websiteUrl.length > 0 && !websiteUrl.match(/^https?:\/\//i)) {
      urlToScrape = `https://${websiteUrl}`;
      // DO NOT update the store here, only use normalized URL for the scraping call
    }

    // Rely on the isValidUrl state, which is updated by the useEffect based on normalization
    if (isValidUrl && urlToScrape) { // Check isValidUrl state and ensure urlToScrape is defined
      try {
        await startWebsiteScraping(urlToScrape);
        // No onNext callback needed here in the new structure
      } catch (err) {
         console.error("Error initiating scraping:", err); 
         // Error state is handled within the websiteScraping object in the store
      }
    } else {
       console.warn("Attempted to scrape invalid URL:", urlToScrape);
       // Optionally set a local error state here if needed for immediate feedback
    }
  };

  // --- Function to call the backend API for chat responses ---
  // Modified callOfferChatAPI function
  const callOfferChatAPI = async (currentMessages: ChatMessage[]) => {
    // Prevent multiple simultaneous calls
    if (isChatLoading) {
        console.log("[Debug] API call skipped, already loading.");
        return;
    }
    setIsChatLoading(true);
    try {
      // Prepare data for the backend
      const payload = {
        // Use the full websiteScraping object here for the payload
        scrapingResults: websiteScraping, 
        chatHistory: currentMessages,
        // Potentially add other context from offerStore if needed
      };

      console.log("[Debug] Calling backend API /api/offer-chat with payload:", payload); // DEBUG LOG

      // --- Actual fetch call to the backend endpoint ---
      const response = await fetch('/api/offer-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text(); // Get error details if possible
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      console.log("[Debug] API call successful, result:", result); // DEBUG LOG
      
      // --- Adjust based on the actual structure of your backend API response ---
      const aiMessageText = result.aiResponse || result.message || result.response || "Sorry, I couldn't generate a response.";
      // --- End Adjustment ---

      const newAiMessage: ChatMessage = { sender: 'ai', text: aiMessageText };
      // Use functional update to ensure we have the latest messages state
      setMessages(prev => [...prev, newAiMessage]); 

    } catch (error) {
      console.error("[Debug] Error calling chat API:", error); // DEBUG LOG
      
      // Add fallback message to UI even if API fails
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: `I'm having trouble analyzing your website. Let's continue with the offer creation process. You can provide details manually in the next steps. ${error instanceof Error ? `(Error: ${error.message})` : ''}`
      };
       // Use functional update here too
      setMessages(prev => [...prev, errorMessage]);
      
      // Continue with the process despite the error
    } finally {
      setIsChatLoading(false);
    }
  };
  // --- End API call function ---


  // Handle sending user messages
  const handleSendMessage = (messageText: string) => {
    const newUserMessage: ChatMessage = { sender: 'user', text: messageText };
    // Use functional update
    setMessages(prev => [...prev, newUserMessage]); 
    // Pass the updated messages directly to the API call
    // Note: state updates might not be synchronous, so read 'messages' state inside callOfferChatAPI if needed
    callOfferChatAPI([...messages, newUserMessage]); // Pass potentially updated messages
  };


  // Effect to trigger initial AI message when scraping completes
  // Using selected state slices in dependency array
  useEffect(() => {
    console.log("[Debug] Effect Check (Selected State):", { 
      status: scrapingStatus, 
      coreOfferExists: !!coreOffer, 
      messagesLength: messages.length, 
      isChatLoading 
    });
    
    // Reinstate messages.length check
    if (scrapingStatus === 'completed' && messages.length === 0 && !isChatLoading) {
       console.log("[Debug] Conditions met (completed, no messages, not loading). Checking coreOffer..."); // DEBUG LOG
      if (coreOffer) {
        console.log("[Debug] coreOffer exists. Calling API."); // DEBUG LOG
        callOfferChatAPI([]); // Call API only if coreOffer exists
      } else {
        console.log("[Debug] coreOffer does NOT exist. API call skipped."); // DEBUG LOG
        // Optionally set a message indicating coreOffer is missing if needed
        // setMessages([{ sender: 'ai', text: "Analysis complete, but couldn't extract core offer details." }]);
      }
    } else {
      console.log("[Debug] Conditions NOT met or already loading/has messages."); // DEBUG LOG
    }
  // Depend on the selected state slices and local state
  }, [scrapingStatus, coreOffer, messages.length, isChatLoading]); 


  const isProcessing = scrapingStatus === 'processing'; // Use selected status
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Analyze Homepage Context (Optional)</h2>
        <p className="text-gray-400">
          Enter your website URL below. Analyzing it can help us understand your current positioning and provide better suggestions later.
        </p>
        <p className="text-sm text-gray-500">
          This step is optional. Click "Next Step" below to skip.
        </p>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg space-y-4">
        <label htmlFor="websiteUrlInput" className="block text-sm font-medium text-gray-300">Website URL</label>
        <div className="flex space-x-2">
          {/* Use standard input styled with Tailwind */}
          <input
            id="websiteUrlInput"
            type="url"
            value={websiteUrl || ''} // Bind directly to store value
            onChange={handleUrlChange}
            placeholder="https://yourwebsite.com"
            disabled={isProcessing || readOnly}
            className="flex-1 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70" 
          />
          {/* Use standard button styled with Tailwind */}
          <button
            onClick={handleStartScraping}
            disabled={!isValidUrl || isProcessing || readOnly} // Disable based on validation state
            className="flex items-center justify-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : scrapingStatus === 'completed' ? ( // Use selected status
                 'Analyzed'
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        
        {/* Display scraping status from store */}
        {scrapingStatus === 'processing' && ( // Use selected status
             <p className="text-sm text-[#FFD23F] mt-2">Analyzing your website. This may take a minute...</p>
         )}
        {scrapingStatus === 'completed' && ( // Use selected status
             <p className="text-green-500 text-sm mt-2">Website analysis complete.</p>
         )}
        {scrapingStatus === 'failed' && ( // Use selected status
          <div className="mt-2 p-3 bg-red-900 border border-red-700 rounded-md text-red-200 text-sm">
            Failed to analyze website: {scrapingError || 'Unknown error'} {/* Use selected error */}
          </div>
        )}
      </div>

      {/* Conditionally render the chat component after analysis is complete */}
      {/* Use selected status */}
      {scrapingStatus === 'completed' && !readOnly && ( 
        <div className="mt-6 bg-[#222222] p-6 rounded-lg space-y-4">
           <h3 className="text-xl font-semibold text-white mb-3">Refine Your Offer with AI</h3>
           {/* Use selected coreOffer */}
           {!coreOffer && ( 
             <p className="text-yellow-500 mb-3">Note: Some offer details may be missing from the analysis.</p>
           )}
           <OfferRefinementChat
             messages={messages}
             onSendMessage={handleSendMessage}
             isLoading={isChatLoading}
           />
           {/* Add manual trigger button */}
           {messages.length === 0 && !isChatLoading && (
             <div className="mt-3 flex justify-center">
               <button
                 onClick={() => callOfferChatAPI([])}
                 disabled={isChatLoading}
                 className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
               >
                 {isChatLoading ? 'Loading...' : 'Start AI Analysis Manually'}
               </button>
             </div>
           )}
        </div>
      )}

      {readOnly && <p className="text-yellow-500 mt-4 text-center">Read-only mode: Cannot perform analysis or use chat.</p>}
    </div>
  );
}
