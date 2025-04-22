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

    // Log the available data for debugging
    console.log('Available data fields:', Object.keys(data));
    console.log('Analysis result available:', !!data.analysis_result);
    if (data.analysis_result) {
      console.log('Analysis result fields:', Object.keys(data.analysis_result));
      if (data.analysis_result.findings) {
        console.log('Findings fields:', Object.keys(data.analysis_result.findings));
      }
    }

    // Prepare the content for analysis
    let contentToAnalyze = '';

    // Try to get content from various possible sources
    if (data.analysis_result?.extracted_text) {
      // Use the extracted text if available
      contentToAnalyze = data.analysis_result.extracted_text;
      console.log('Using extracted_text for analysis');
    } else if (data.html_content) {
      // Use the HTML content if available
      contentToAnalyze = data.html_content.substring(0, 5000);
      console.log('Using html_content for analysis');
    } else if (data.analysis_result?.findings) {
      // If we have findings but no raw content, use the findings as a base
      const findings = data.analysis_result.findings;
      contentToAnalyze = `
        Core Offer: ${findings.coreOffer || ''}


        Target Audience: ${findings.targetAudience || ''}


        Problem Solved: ${findings.problemSolved || ''}


        Value Proposition: ${findings.valueProposition || ''}


        Key Benefits: ${Array.isArray(findings.keyBenefits) ? findings.keyBenefits.join(', ') : ''}
      `;
      console.log('Using existing findings for analysis');
    } else if (title || metaDescription) {
      // Use title and meta description as a last resort
      contentToAnalyze = `${title}\n\n${metaDescription}`;
      console.log('Using title and meta description for analysis');
    } else {
      // If no content is available, return the original data
      console.log('No content available for analysis, returning original data');
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
              content: `You are an expert Marketing Analyst specializing in deconstructing marketing copy to identify core value propositions based on the ProductLed R-A-R-A framework (Result, Advantage, Risk, Assurance). Your task is to meticulously analyze the provided text and extract the key elements defining the offer's core components. Focus *only* on information present or strongly implied within the text.`
            },
            {
              role: 'user',
              content: `Analyze the following marketing text and extract suggestions for the Core Offer Nucleus components: Target Audience, Desired Result, Key Advantage, Primary Risk/Objection, and Core Assurance/Risk Reversal.

Marketing Text to Analyze:
---
Title: ${title}
Meta Description: ${metaDescription}
Content: ${contentToAnalyze}
---

Extraction Guidelines:
Based *only* on the text provided above:

1. **Target Audience:** Who is the ideal user explicitly mentioned or strongly implied? (Look for roles, industries, company types, specific problems they face). Provide 2-3 suggestions.

2. **Desired Result:** What is the single most important outcome, transformation, or benefit the user achieves according to the text? (What primary problem is solved?). Provide 2-3 suggestions.

3. **Key Advantage:** What makes this offer unique, different, or significantly better (e.g., 5-10x) than alternatives, according to the text? (Look for comparisons, unique features, claims of speed, ease, or effectiveness). Provide 2-3 suggestions.

4. **Primary Risk/Objection:** What key pain point does the text emphasize solving (implying the risk of inaction)? OR, what potential reason for customer hesitation is addressed or implied? Provide 2-3 suggestions.

5. **Core Assurance/Risk Reversal:** How does the text build trust or reduce perceived risk? (Look for guarantees, pricing models like performance-based, trial offers, demos, claims of easy setup/integration, specific proof points mentioned). Provide 2-3 suggestions.

Also extract:
- Core Offer: The main product/service being offered
- Value Proposition: The concise statement of value
- Key Benefits: 3-5 specific benefits customers receive
- Competitive Advantages: 2-3 ways they differentiate from competitors
- Onboarding Steps: 3-5 steps in their implementation process with time estimates

Format your response as a valid JSON object with these exact keys:
"coreOffer",
"targetAudience" (array of 2-3 suggestions),
"desiredResult" (array of 2-3 suggestions),
"keyAdvantage" (array of 2-3 suggestions),
"biggestBarrier" (array of 2-3 suggestions),
"assurance" (array of 2-3 suggestions),
"valueProposition",
"keyBenefits" (array),
"competitiveAdvantages" (array),
"onboardingSteps" (array of objects with "description" and "timeEstimate").

Be concise and use phrasing derived directly from the text where possible. If you can't find specific information, provide your best educated guess based on the industry and context rather than returning "Not found".`
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
