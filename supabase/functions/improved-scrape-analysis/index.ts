import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Get the Supabase URL and service role key from environment variables
    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    console.log(`Using Supabase URL: ${supabaseUrl}`);
    console.log(`Service role key available: ${!!supabaseServiceKey}`);

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured on the server' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { scrapingId } = await req.json();

    if (!scrapingId) {
      return new Response(
        JSON.stringify({ error: 'Missing scrapingId parameter' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Query the database for the scraping result
    const { data, error } = await supabase
      .from('website_scraping')
      .select('*')
      .eq('id', scrapingId)
      .single();

    if (error) {
      console.error('Error fetching scraping result:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Scraping result not found' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }

    // Check if we already have analysis results
    if (data.analysis_result?.findings && 
        data.analysis_result.findings.coreOffer && 
        data.analysis_result.findings.targetAudience) {
      console.log('Analysis results already exist, returning existing data');
      return new Response(
        JSON.stringify({
          id: data.id,
          status: data.status,
          url: data.url,
          title: data.title,
          meta_description: data.meta_description,
          analysis_result: data.analysis_result,
          error: data.error,
          created_at: data.created_at,
          completed_at: data.completed_at
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // If we don't have analysis results or they're incomplete, perform a new analysis
    console.log('Performing improved analysis on scraped content');

    // Extract the content from the scraping result
    const title = data.title || '';
    const metaDescription = data.meta_description || '';
    const htmlContent = data.html_content || '';

    // Prepare the content for analysis
    let contentToAnalyze = '';
    
    if (data.analysis_result?.extracted_text) {
      // Use the extracted text if available
      contentToAnalyze = data.analysis_result.extracted_text;
    } else if (htmlContent) {
      // Use the HTML content if available (first 5000 chars)
      contentToAnalyze = htmlContent.substring(0, 5000);
    } else {
      // If no content is available, return an error
      return new Response(
        JSON.stringify({ error: 'No content available for analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Call the OpenAI proxy with an improved prompt
    const response = await fetch(
      `${supabaseUrl}/functions/v1/openai-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          temperature: 0.2,
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: `You are an expert marketing analyst specializing in extracting core offer components from websites. Your task is to analyze website content and extract the key elements of the R-A-R-A framework (Result-Advantage-Risk-Assurance) along with other important marketing data. Be thorough and specific in your analysis.`
            },
            {
              role: 'user',
              content: `Analyze this website content and extract the core offer components using the R-A-R-A framework:

Title: ${title}
Meta Description: ${metaDescription}
Content: ${contentToAnalyze}

Extract the following information in JSON format:

1. Target Audience (Who): Who is the ideal customer? Be specific about demographics, roles, industries, or company types.
2. Desired Result (What): What specific outcome or transformation does the customer want to achieve?
3. Key Advantage (Why): What makes this solution uniquely better than alternatives? Focus on their 5-10x advantage.
4. Biggest Risk/Barrier (Risk): What objection or concern might prevent customers from buying?
5. Assurance (How): How does the offer overcome the risk or provide guarantees?

Also extract:
- Core Offer: The main product/service being offered
- Value Proposition: The concise statement of value
- Key Benefits: 3-5 specific benefits customers receive
- Competitive Advantages: 2-3 ways they differentiate from competitors
- Onboarding Steps: 3-5 steps in their implementation process with time estimates

Format your response as a valid JSON object with these exact keys:
"coreOffer", "targetAudience", "desiredResult", "keyAdvantage", "biggestBarrier", "assurance", "valueProposition", "keyBenefits" (array), "competitiveAdvantages" (array), "onboardingSteps" (array of objects with "description" and "timeEstimate").

If you can't find specific information, provide your best educated guess based on the industry and context rather than returning "Not found".`
            }
          ],
          response_format: { type: 'json_object' }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI proxy error: ${response.status} ${errorText}`);
    }

    const completion = await response.json();
    const analysisContent = completion.choices[0].message.content;
    const analysisResult = typeof analysisContent === 'string' ? JSON.parse(analysisContent) : analysisContent;

    // Update the scraping record with the new analysis
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('website_scraping')
      .update({
        analysis_result: {
          status: 'complete',
          error_message: null,
          analyzed_url: data.url,
          findings: analysisResult,
          scraped_at: timestamp
        },
        status: 'completed',
        completed_at: timestamp
      })
      .eq('id', scrapingId);

    if (updateError) {
      console.error('Error updating analysis result:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Return the updated scraping result
    return new Response(
      JSON.stringify({
        id: data.id,
        status: 'completed',
        url: data.url,
        title: data.title,
        meta_description: data.meta_description,
        analysis_result: {
          status: 'complete',
          error_message: null,
          analyzed_url: data.url,
          findings: analysisResult,
          scraped_at: timestamp
        },
        error: null,
        created_at: data.created_at,
        completed_at: timestamp
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
