import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
    const url = e.target.value;
    setWebsiteUrl(url);
    let normalizedUrl = url;
    if (url.length > 0 && !url.match(/^(http|https):\/\//i)) {
      normalizedUrl = `https://${url}`;
    }
    const isValid = normalizedUrl.match(/^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/) !== null;
    setIsValidUrl(isValid);
  };

  const handleStartScraping = async () => {
    let urlToScrape = websiteUrl;
    if (websiteUrl.length > 0 && !websiteUrl.match(/^(http|https):\/\//i)) {
      urlToScrape = `https://${websiteUrl}`;
    }
    if (isValidUrl && urlToScrape) {
      await startWebsiteScraping(urlToScrape);
    }
  };

  return (
    <Card className="bg-[#2A2A2A] border-[#333333] text-white mb-8">
      <CardHeader>
        <CardTitle>Website Context</CardTitle>
        <CardDescription className="text-gray-400">
          Optionally analyze your website to provide context for AI suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="websiteUrlInput" className="text-gray-300 text-sm">Analyze Website (Optional)</Label>
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
              {!readOnly && (
                <Button
                  onClick={() => {
                    // Dispatch event with website data
                    window.dispatchEvent(new CustomEvent('launch-ai-chat', {
                      detail: {
                        websiteUrl,
                        scrapingStatus: websiteScraping.status,
                        hasFindings: true
                      }
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90"
                  size="sm"
                >
                  Launch AI Chat
                </Button>
              )}
            </div>
          )}
          {websiteScraping.status === 'failed' && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-500">Analysis failed: {websiteScraping.error || 'Unknown error'}</p>
              {!readOnly && (
                <Button
                  onClick={() => {
                    // Dispatch event with website data
                    window.dispatchEvent(new CustomEvent('launch-ai-chat', {
                      detail: {
                        websiteUrl,
                        scrapingStatus: 'failed',
                        hasFindings: false
                      }
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-[#FFD23F] text-black font-medium rounded-lg hover:bg-opacity-90"
                  size="sm"
                >
                  Continue with AI Chat
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}