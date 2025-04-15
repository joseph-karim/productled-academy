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

    // Log the Supabase URL and anon key (without showing the full key)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Supabase Anon Key available: ${!!supabaseAnonKey}`);
    if (supabaseAnonKey) {
      console.log(`Anon Key starts with: ${supabaseAnonKey.substring(0, 10)}...`);
    }

    // Try direct fetch approach for anonymous users
    if (!user) {
      console.log('Using direct fetch for anonymous user');
      try {
        console.log('Starting fetch attempt for scraping result');
        // First, check if the environment variables are available
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables:', {
            url: !!supabaseUrl,
            key: !!supabaseAnonKey
          });

          // Fall back to using the Supabase client for anonymous users
          console.log('Falling back to Supabase client for anonymous user');
          const { data, error } = await supabase
            .from('website_scraping')
            .select('*')
            .eq('id', scrapingId)
            .single();

          if (error) {
            console.error('Error fetching scraping result with fallback:', error);
            return null;
          }

          console.log('Successfully retrieved scraping result with fallback:', data);

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
        }

        const apiUrl = `${supabaseUrl}/rest/v1/website_scraping?id=eq.${scrapingId}&select=*`;
        console.log(`Fetching from: ${apiUrl}`);

        // Log the actual headers we're using (without showing the full key)
        console.log('Using headers with apikey:', supabaseAnonKey.substring(0, 10) + '...');

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey
          }
        });

        console.log('Fetch response status:', response.status);

        if (response.ok) {
          // If we get here, the response was successful
          const responseData = await response.json();
          console.log('Response data:', responseData);

          if (responseData && Array.isArray(responseData) && responseData.length > 0) {
            console.log('Successfully retrieved scraping result via direct fetch:', responseData[0]);
            const result = responseData[0];
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
          } else {
            console.log('Response data is empty or not an array, falling back to Supabase client');
          }
        } else {
          const errorText = await response.text();
          console.error(`Direct fetch failed: ${response.status} ${response.statusText}`, errorText);
        }

        // Fall back to using the Supabase client
        console.log('Falling back to Supabase client after fetch');
        const { data, error } = await supabase
          .from('website_scraping')
          .select('*')
          .eq('id', scrapingId)
          .single();

        if (error) {
          console.error('Error fetching scraping result with fallback:', error);
          return null;
        }

        console.log('Successfully retrieved scraping result with fallback:', data);

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
        console.error('Error in direct fetch:', error);

        // Fall back to using the Supabase client for anonymous users
        console.log('Falling back to Supabase client after error');
        const { data, error: supabaseError } = await supabase
          .from('website_scraping')
          .select('*')
          .eq('id', scrapingId)
          .single();

        if (supabaseError) {
          console.error('Error fetching scraping result with fallback:', supabaseError);
          return null;
        }

        console.log('Successfully retrieved scraping result with fallback:', data);

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
      }

      // If we get here, all attempts failed
      console.log('All fetch attempts failed, returning null');
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
