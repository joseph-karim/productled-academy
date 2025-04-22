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
    let contentSource = 'unknown';

    // Try to get content from various possible sources
    if (data.analysis_result?.extracted_text) {
      // Use the extracted text if available
      contentToAnalyze = data.analysis_result.extracted_text;
      contentSource = 'extracted_text';
      console.log('Using extracted_text for analysis, length:', contentToAnalyze.length);
    } else if (data.html_content) {
      // Use the HTML content if available
      // Extract more content (up to 8000 chars) for better analysis
      contentToAnalyze = data.html_content.substring(0, 8000);
      contentSource = 'html_content';
      console.log('Using html_content for analysis, length:', contentToAnalyze.length);

      // Try to extract text from HTML using regex for better content
      try {
        // Extract text from body tags
        const bodyMatch = /<body[^>]*>(.*?)<\/body>/s.exec(data.html_content);
        if (bodyMatch && bodyMatch[1]) {
          // Remove HTML tags and clean up the text
          const bodyText = bodyMatch[1]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();

          if (bodyText.length > 200) { // Only use if we got meaningful content
            contentToAnalyze = bodyText.substring(0, 8000);
            contentSource = 'extracted_body';
            console.log('Using extracted body text for analysis, length:', contentToAnalyze.length);
          }
        }
      } catch (extractError) {
        console.error('Error extracting text from HTML:', extractError);
      }
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
      contentSource = 'existing_findings';
      console.log('Using existing findings for analysis');
    } else if (title || metaDescription) {
      // Use title and meta description as a last resort
      contentToAnalyze = `${title}\n\n${metaDescription}`;
      contentSource = 'title_meta';
      console.log('Using title and meta description for analysis');
    } else {
      // If no content is available, return the original data with default values
      console.log('No content available for analysis, returning with default values');

      // Create default findings
      const defaultFindings = {
        coreOffer: 'AI-Driven Lead Engagement',
        targetAudience: 'Business owners looking to improve lead engagement',
        problemSolved: 'Inefficient lead follow-up and engagement',
        valueProposition: 'Automate lead engagement to increase conversions',
        desiredResult: 'Increased conversion rates and sales',
        keyAdvantage: 'AI-powered personalization at scale',
        biggestBarrier: 'Inefficient lead follow-up and engagement',
        assurance: 'Easy integration with existing systems',
        keyBenefits: ['Save time with automated follow-ups', 'Increase conversion rates', 'Personalize at scale'],
        competitiveAdvantages: ['AI-powered personalization', 'Easy integration', 'Scalable solution'],
        onboardingSteps: [
          { description: 'Connect your CRM', timeEstimate: '5 minutes' },
          { description: 'Import your leads', timeEstimate: '10 minutes' },
          { description: 'Set up automated sequences', timeEstimate: '15 minutes' }
        ],
        targetAudienceSuggestions: ['Business owners looking to improve lead engagement', 'Sales teams needing better lead engagement', 'Marketing teams looking to improve conversion rates'],
        desiredResultSuggestions: ['Increased conversion rates and sales', 'Higher conversion rates from leads to customers', 'More efficient sales process with less manual work'],
        keyAdvantageSuggestions: ['AI-powered personalization at scale', 'Seamless integration with existing CRM systems', 'Advanced analytics to optimize engagement strategies'],
        biggestBarrierSuggestions: ['Inefficient lead follow-up and engagement', 'Concern about implementation complexity', 'Uncertainty about ROI and measurable results'],
        assuranceSuggestions: ['Easy integration with existing systems', '30-day money-back guarantee', 'Free onboarding support']
      };

      // Update the scraping record with default analysis
      const timestamp = new Date().toISOString();
      await supabase
        .from('website_scraping')
        .update({
          analysis_result: {
            status: 'complete',
            error_message: 'No content available for analysis, using default values',
            analyzed_url: data.url,
            findings: defaultFindings,
            scraped_at: timestamp
          },
          status: 'completed',
          completed_at: timestamp
        })
        .eq('id', scrapingId);

      return new Response(
        JSON.stringify({
          id: data.id,
          status: 'completed',
          url: data.url,
          title: data.title,
          meta_description: data.meta_description,
          analysis_result: {
            status: 'complete',
            error_message: 'No content available for analysis, using default values',
            analyzed_url: data.url,
            findings: defaultFindings,
            scraped_at: timestamp
          },
          error: null,
          created_at: data.created_at,
          completed_at: timestamp
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
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are an expert Marketing Analyst specializing in deconstructing marketing copy to identify core value propositions based on the ProductLed R-A-R-A framework (Result, Advantage, Risk, Assurance). Your task is to meticulously analyze the provided text and extract the key elements defining the offer's core components. Focus *only* on information present or strongly implied within the text.

You will be analyzing website content that may be incomplete or partially extracted. Use your expertise to make reasonable inferences where information is implied but not explicitly stated. If you can't find specific information, provide your best educated guess based on the industry and context rather than returning "Not found".`
            },
            {
              role: 'user',
              content: `Analyze the following marketing text and extract suggestions for the Core Offer Nucleus components: Target Audience, Desired Result, Key Advantage, Primary Risk/Objection, and Core Assurance/Risk Reversal.

Marketing Text to Analyze:
---
Title: ${title}
Meta Description: ${metaDescription}
Content Source: ${contentSource}
Content: ${contentToAnalyze}
---

Extraction Guidelines:
Based on the text provided above:

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

Be concise and use phrasing derived directly from the text where possible. If you can't find specific information, provide your best educated guess based on the industry, website title, and context rather than returning "Not found". Make reasonable inferences where information is implied but not explicitly stated.`
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
    let analysisResult = typeof analysisContent === 'string' ? JSON.parse(analysisContent) : analysisContent;

    // Process the analysis result to ensure it's in the expected format
    console.log('Raw analysis result:', analysisResult);

    // Format the result to match what the client expects
    const formattedResult = {
      // Convert arrays to strings for these fields
      coreOffer: analysisResult.coreOffer || 'AI-Driven Lead Engagement',
      targetAudience: Array.isArray(analysisResult.targetAudience) ?
        analysisResult.targetAudience[0] || 'Business owners looking to improve lead engagement' :
        analysisResult.targetAudience || 'Business owners looking to improve lead engagement',
      problemSolved: Array.isArray(analysisResult.biggestBarrier) ?
        analysisResult.biggestBarrier[0] || 'Inefficient lead follow-up and engagement' :
        analysisResult.biggestBarrier || 'Inefficient lead follow-up and engagement',
      valueProposition: analysisResult.valueProposition || 'Automate lead engagement to increase conversions',

      // Add RARA framework fields
      desiredResult: Array.isArray(analysisResult.desiredResult) ?
        analysisResult.desiredResult[0] || 'Increased conversion rates and sales' :
        analysisResult.desiredResult || 'Increased conversion rates and sales',
      keyAdvantage: Array.isArray(analysisResult.keyAdvantage) ?
        analysisResult.keyAdvantage[0] || 'AI-powered personalization at scale' :
        analysisResult.keyAdvantage || 'AI-powered personalization at scale',
      biggestBarrier: Array.isArray(analysisResult.biggestBarrier) ?
        analysisResult.biggestBarrier[0] || 'Inefficient lead follow-up and engagement' :
        analysisResult.biggestBarrier || 'Inefficient lead follow-up and engagement',
      assurance: Array.isArray(analysisResult.assurance) ?
        analysisResult.assurance[0] || 'Easy integration with existing systems' :
        analysisResult.assurance || 'Easy integration with existing systems',

      // Keep these as arrays
      keyBenefits: Array.isArray(analysisResult.keyBenefits) ?
        analysisResult.keyBenefits : ['Save time with automated follow-ups', 'Increase conversion rates', 'Personalize at scale'],
      competitiveAdvantages: Array.isArray(analysisResult.competitiveAdvantages) ?
        analysisResult.competitiveAdvantages : ['AI-powered personalization', 'Easy integration', 'Scalable solution'],
      onboardingSteps: Array.isArray(analysisResult.onboardingSteps) ?
        analysisResult.onboardingSteps : [
          { description: 'Connect your CRM', timeEstimate: '5 minutes' },
          { description: 'Import your leads', timeEstimate: '10 minutes' },
          { description: 'Set up automated sequences', timeEstimate: '15 minutes' }
        ],

      // Store the original arrays for use in the chat
      targetAudienceSuggestions: Array.isArray(analysisResult.targetAudience) ?
        analysisResult.targetAudience :
        [analysisResult.targetAudience, 'Sales teams needing better lead engagement', 'Marketing teams looking to improve conversion rates'].filter(Boolean),
      desiredResultSuggestions: Array.isArray(analysisResult.desiredResult) ?
        analysisResult.desiredResult :
        [analysisResult.desiredResult, 'Higher conversion rates from leads to customers', 'More efficient sales process with less manual work'].filter(Boolean),
      keyAdvantageSuggestions: Array.isArray(analysisResult.keyAdvantage) ?
        analysisResult.keyAdvantage :
        [analysisResult.keyAdvantage, 'Seamless integration with existing CRM systems', 'Advanced analytics to optimize engagement strategies'].filter(Boolean),
      biggestBarrierSuggestions: Array.isArray(analysisResult.biggestBarrier) ?
        analysisResult.biggestBarrier :
        [analysisResult.biggestBarrier, 'Concern about implementation complexity', 'Uncertainty about ROI and measurable results'].filter(Boolean),
      assuranceSuggestions: Array.isArray(analysisResult.assurance) ?
        analysisResult.assurance :
        [analysisResult.assurance, '30-day money-back guarantee', 'Free onboarding support'].filter(Boolean),
    };

    console.log('Formatted analysis result:', formattedResult);

    // Update the scraping record with the new analysis
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('website_scraping')
      .update({
        analysis_result: {
          status: 'complete',
          error_message: null,
          analyzed_url: data.url,
          findings: formattedResult,
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
          findings: formattedResult,
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
