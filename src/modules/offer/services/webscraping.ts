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
      keyBenefits: string[];
      valueProposition: string;
      cta: string;
      tone: string;
      missingInfo: string[];
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
    
    return await response.json();
  } catch (error) {
    console.error('Error starting website scraping:', error);
    throw error;
  }
}

export async function getScrapingResult(scrapingId: string): Promise<WebsiteScrapingResult | null> {
  try {
    const { data, error } = await supabase
      .from('website_scraping')
      .select('*')
      .eq('id', scrapingId)
      .single();
      
    if (error) {
      console.error('Error fetching scraping result:', error);
      return null;
    }
    
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
