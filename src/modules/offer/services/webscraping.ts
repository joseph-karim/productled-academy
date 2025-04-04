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
    console.log(`Fetching scraping result for ID: ${scrapingId}`);
    
    // Get current auth state for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`Current user state:`, user ? `Authenticated as ${user.id}` : 'Not authenticated');
    
    // Try direct fetch approach for anonymous users
    if (!user) {
      console.log('Using direct fetch for anonymous user');
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/website_scraping?id=eq.${scrapingId}&select=*`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Direct fetch failed: ${response.status} ${response.statusText}`, errorText);
        return null;
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        console.log('Successfully retrieved scraping result via direct fetch:', data[0]);
        const result = data[0];
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
      }
      return null;
    }
    
    // Continue with Supabase client for authenticated users
    const { data, error } = await supabase
      .from('website_scraping')
      .select('*')
      .eq('id', scrapingId)
      .single();
      
    if (error) {
      console.error('Error fetching scraping result:', error);
      console.error(`Error code: ${error.code}, Message: ${error.message}`);
      return null;
    }
    
    console.log('Successfully retrieved scraping result:', data);
    
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
