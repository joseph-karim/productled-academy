import { supabase } from '../../../core/services/supabase';

export interface WebsiteScrapingResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  url: string;
  title?: string;
  metaDescription?: string;
  analysisResult?: {
    status: 'complete' | 'processing' | 'failed' | 'no_content';
    error_message: string | null;
    analyzed_url: string;
    findings: {
      coreOffer: string;
      targetAudience: string;
      problemSolved: string;
      keyBenefits: string[] | Array<{
        benefit: string;
        problemRelation?: string;
        metrics?: string;
        isUnique?: boolean;
      }>;
      valueProposition: string;
      cta: string | {
        primary: string;
        secondary?: string[];
        action?: string;
        urgency?: string;
      };
      tone: string | {
        overall: string;
        socialProof?: string;
        emotionalAppeals?: string;
        technicalLevel?: string;
        storytelling?: boolean;
      };
      missingInfo: string[];
      keyPhrases?: string[];
      competitiveAdvantages?: string[];
      onboardingSteps?: Array<{
        description: string;
        timeEstimate: string;
      }>;
    } | null;
    scraped_at: string;
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export async function scrapeWebsite(url: string, offerId?: string): Promise<{ scrapingId: string; status: string }> {
  if (!url) {
    throw new Error('URL is required');
  }

  const { data: { user } } = await supabase.auth.getUser();

  try {
    console.log('Starting website scraping for URL:', url);
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-offer-context`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          url,
          offerId,
          userId: user?.id || null // Use null for unauthenticated users
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start website scraping');
    }

    const result = await response.json();
    console.log('Website scraping started successfully:', result);
    return result;
  } catch (error) {
    console.error('Error starting website scraping:', error);
    throw error;
  }
}

export async function getScrapingResult(scrapingId: string): Promise<WebsiteScrapingResult | null> {
  try {
    console.log(`Fetching scraping result for ID: ${scrapingId}`);

    // Get current auth state for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`Current user state:`, user ? `Authenticated as ${user.id}` : 'Not authenticated');

    // First try the improved analysis function
    try {
      console.log('Fetching scraping result from the improved-scrape-analysis Edge Function');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improved-scrape-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ scrapingId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully retrieved improved analysis result:', data);

        return {
          id: data.id,
          status: data.status,
          url: data.url,
          title: data.title,
          metaDescription: data.meta_description,
          analysisResult: data.analysis_result,
          error: data.error,
          createdAt: data.created_at,
          completedAt: data.completed_at
        };
      } else {
        const errorText = await response.text();
        console.log(`Improved analysis function failed with status ${response.status}:`, errorText);

        // Fall back to the original get-scraping-result function
        console.log('Falling back to original get-scraping-result Edge Function');
      }
    } catch (improvedAnalysisError) {
      console.log('Improved analysis function error:', improvedAnalysisError);
      console.log('Falling back to original get-scraping-result Edge Function');
    }

    // Fall back to the original get-scraping-result Edge Function
    try {
      console.log('Fetching scraping result from the get-scraping-result Edge Function');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-scraping-result`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ scrapingId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully retrieved scraping result via Edge Function:', data);

        return {
          id: data.id,
          status: data.status,
          url: data.url,
          title: data.title,
          metaDescription: data.meta_description,
          analysisResult: data.analysis_result,
          error: data.error,
          createdAt: data.created_at,
          completedAt: data.completed_at
        };
      } else {
        const errorText = await response.text();
        console.log(`Edge Function failed with status ${response.status}:`, errorText);
      }
    } catch (edgeFunctionError) {
      console.log('Edge Function error:', edgeFunctionError);
    }

    // As a last resort, try using the Supabase client directly
    console.log('Trying Supabase client as a last resort');
    const { data, error } = await supabase
      .from('website_scraping')
      .select('*')
      .eq('id', scrapingId)
      .single();

    if (error) {
      console.error('Error fetching scraping result with Supabase client:', error);
      return null;
    }

    console.log('Successfully retrieved scraping result via Supabase client:', data);

    return {
      id: data.id,
      status: data.status,
      url: data.url,
      title: data.title,
      metaDescription: data.meta_description,
      analysisResult: data.analysis_result,
      error: data.error,
      createdAt: data.created_at,
      completedAt: data.completed_at
    };
  } catch (error) {
    console.error('Error getting scraping result:', error);
    return null;
  }
}
