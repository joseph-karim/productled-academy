import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TranscriptUploader } from './TranscriptUploader';

interface WebsiteContextInputProps {
  readOnly?: boolean;
}

export function WebsiteContextInput({ readOnly = false }: WebsiteContextInputProps) {
  const {
    websiteUrl,
    setWebsiteUrl,
    websiteScraping,
    startWebsiteScraping,
  } = useOfferStore();

  const [isValidUrl, setIsValidUrl] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setWebsiteUrl(url);

    // Normalize URL by adding https:// if missing
    let normalizedUrl = url;
    if (url.length > 0 && !url.match(/^(http|https):\/\//i)) {
      normalizedUrl = `https://${url}`;
    }

    // Validate URL format
    const isValid = normalizedUrl.match(/^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/) !== null;
    setIsValidUrl(isValid);

    // Log for debugging
    console.log('URL validation:', { url, normalizedUrl, isValid });
  };

  const handleStartScraping = async () => {
    // Normalize URL by adding https:// if missing
    let urlToScrape = websiteUrl;
    if (websiteUrl.length > 0 && !websiteUrl.match(/^(http|https):\/\//i)) {
      urlToScrape = `https://${websiteUrl}`;
    }

    // Validate URL and start scraping
    if (isValidUrl && urlToScrape) {
      console.log('Starting website scraping for:', urlToScrape);
      await startWebsiteScraping(urlToScrape);

      // Dispatch event to launch AI chat with website data
      window.dispatchEvent(new CustomEvent('launch-ai-chat', {
        detail: {
          websiteUrl: urlToScrape,
          scrapingStatus: 'processing',
          hasFindings: false
        }
      }));
    } else {
      console.error('Invalid URL:', urlToScrape);
    }
  };

  const [activeTab, setActiveTab] = useState<string>('website');
  const [transcriptUploaded, setTranscriptUploaded] = useState<boolean>(false);

  const handleTranscriptUploadComplete = (success: boolean) => {
    setTranscriptUploaded(success);
  };

  return (
    <Card className="bg-[#2A2A2A] border-[#333333] text-white mb-8">
      <CardHeader>
        <CardTitle>Context Sources</CardTitle>
        <CardDescription className="text-gray-400">
          Provide context for AI suggestions by analyzing your website or uploading customer call transcripts. This helps the AI generate more relevant and personalized recommendations for your offer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Custom Tabs Implementation */}
        <div className="w-full">
          {/* Tab Headers */}
          <div className="grid grid-cols-2 mb-4 bg-[#1C1C1C] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('website')}
              className={`flex items-center justify-center py-2 px-4 rounded-md transition-colors ${activeTab === 'website' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Website Analysis
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center justify-center py-2 px-4 rounded-md transition-colors ${activeTab === 'transcript' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Customer Transcripts
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {/* Website Analysis Tab */}
            {activeTab === 'website' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="websiteUrlInput" className="text-gray-300 text-sm">Analyze Website (Optional)</Label>
                      <p className="text-xs text-gray-400 mt-1">Enter your website URL to extract offer details, target audience, and key benefits</p>
                    </div>
                    {!readOnly && websiteScraping.status !== 'processing' && websiteScraping.status !== 'completed' && (
                      <Button
                        onClick={() => {
                          // Dispatch event with website data
                          window.dispatchEvent(new CustomEvent('launch-ai-chat', {
                            detail: {
                              websiteUrl: '',
                              scrapingStatus: 'idle',
                              hasFindings: false
                            }
                          }));
                        }}
                        className="px-4 py-2 text-sm bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90"
                        size="sm"
                      >
                        Skip & Use AI Chat
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id="websiteUrlInput"
                      type="url"
                      value={websiteUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com"
                      className="flex-1 p-2 bg-[#1C1C1C] border-[#333333] text-white rounded-lg placeholder-gray-500 text-sm focus:border-[#FFD23F] focus:outline-none"
                      disabled={readOnly || websiteScraping.status === 'processing'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && isValidUrl) {
                          e.preventDefault();
                          handleStartScraping();
                        }
                      }}
                    />
                    <Button
                      onClick={handleStartScraping}
                      disabled={!isValidUrl || websiteScraping.status === 'processing' || readOnly}
                      className="px-4 py-2 text-sm bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
                      size="sm"
                    >
                      {websiteScraping.status === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : ( 'Analyze' )}
                    </Button>
                  </div>
                  {websiteScraping.status === 'processing' && (
                    <p className="text-xs text-[#FFD23F]">Analyzing...</p>
                  )}
                  {websiteScraping.status === 'completed' && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-500">Analysis complete.</p>
                      <Button
                        onClick={() => {
                          // Dispatch event to launch AI chat with completed website data
                          window.dispatchEvent(new CustomEvent('launch-ai-chat', {
                            detail: {
                              websiteUrl: websiteUrl,
                              scrapingStatus: 'completed',
                              hasFindings: true
                            }
                          }));
                        }}
                        className="px-4 py-2 text-xs bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90"
                        size="sm"
                      >
                        Start AI Chat
                      </Button>
                    </div>
                  )}
                  {websiteScraping.status === 'failed' && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-500">Analysis failed: {websiteScraping.error || 'Unknown error'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transcript Upload Tab */}
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <TranscriptUploader onUploadComplete={handleTranscriptUploadComplete} />

                {transcriptUploaded && (
                  <div className="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md text-green-300">
                    <p className="text-sm">Transcript processed successfully! The AI assistant will now use insights from your customer calls.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}