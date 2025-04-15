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

    // For both authenticated and unauthenticated users, use the Edge Function
    console.log('Using Edge Function to fetch scraping result');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }

    // Call the Edge Function to get the scraping result
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-scraping-result`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ scrapingId })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge Function call failed: ${response.status}`, errorText);
      return null;
    }

    // If we get here, the Edge Function call was successful
    const result = await response.json();
    console.log('Successfully retrieved scraping result via Edge Function:', result);

    return {
      id: result.id,
      status: result.status,
      url: result.url,
      title: result.title,
      metaDescription: result.meta_description,
      analysisResult: result.analysis_result,
      error: result.error,
      createdAt: result.created_at,
      completedAt: result.completed_at
    };
  } catch (error) {
    console.error('Error getting scraping result:', error);
    return null;
  }
}
