
async function mockFetch(url) {
  console.log(`Simulating fetch for URL: ${url}`);
  
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format');
  }
  
  if (url.includes('example.com')) {
    return {
      text: async () => `
        <html>
          <head>
            <title>Example Website</title>
            <meta name="description" content="This is an example website for testing">
          </head>
          <body>
            <h1>Example Product</h1>
            <p>Our product helps businesses streamline their workflows.</p>
            <h2>For Small Business Owners</h2>
            <p>We solve the problem of inefficient task management.</p>
            <ul>
              <li>Feature 1: Automated task assignment</li>
              <li>Feature 2: Real-time progress tracking</li>
              <li>Feature 3: Customizable workflows</li>
            </ul>
          </body>
        </html>
      `
    };
  }
  
  if (url.includes('invalid.com')) {
    throw new Error('Failed to fetch website');
  }
  
  return {
    text: async () => `
      <html>
        <head>
          <title>Generic Website</title>
        </head>
        <body>
          <p>Some generic content</p>
        </body>
      </html>
    `
  };
}

async function mockOpenAI(content) {
  console.log('Simulating OpenAI analysis');
  
  if (content.includes('Example Product')) {
    return {
      "coreOffer": "Workflow management software",
      "targetAudience": "Small Business Owners",
      "problemSolved": "Inefficient task management",
      "keyBenefits": [
        "Automated task assignment",
        "Real-time progress tracking",
        "Customizable workflows"
      ],
      "valueProposition": "Streamline business workflows",
      "cta": "Get Started",
      "tone": "Professional, Solution-Oriented",
      "missingInfo": [
        "Pricing details",
        "Customer testimonials"
      ]
    };
  }
  
  return {
    "coreOffer": "Unknown product",
    "targetAudience": "General audience",
    "problemSolved": "Unspecified problem",
    "keyBenefits": ["Feature 1", "Feature 2"],
    "valueProposition": "Generic value proposition",
    "cta": "Learn More",
    "tone": "Neutral",
    "missingInfo": ["Product details", "Use cases"]
  };
}

async function mockSupabase(operation, data) {
  console.log(`Simulating Supabase ${operation}`);
  console.log('Data:', JSON.stringify(data, null, 2));
  
  return { success: true, data };
}

async function testEdgeFunction() {
  console.log('=== Testing Edge Function ===');
  
  try {
    console.log('\nTest Case 1: Valid URL (example.com)');
    const url = 'https://example.com';
    
    const scrapingRecord = await mockSupabase('insert', {
      offer_id: 'test-offer-id',
      user_id: 'test-user-id',
      url,
      status: 'processing'
    });
    
    const response = await mockFetch(url);
    const html = await response.text();
    
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const metaDescription = html.match(/<meta name="description" content="(.*?)">/)?.[1] || '';
    
    console.log('Extracted metadata:');
    console.log('- Title:', title);
    console.log('- Description:', metaDescription);
    
    const analysisResult = await mockOpenAI(html);
    console.log('Analysis result:', analysisResult);
    
    const timestamp = new Date().toISOString();
    
    await mockSupabase('update', {
      id: scrapingRecord.data.id,
      status: 'completed',
      analysis_result: {
        status: 'complete',
        error_message: null,
        analyzed_url: url,
        findings: analysisResult,
        scraped_at: timestamp
      },
      title,
      meta_description: metaDescription,
      completed_at: timestamp
    });
    
    console.log('Test Case 1: Success');
  } catch (error) {
    console.error('Test Case 1 failed:', error.message);
  }
  
  try {
    console.log('\nTest Case 2: Invalid URL format');
    const url = 'invalid-url';
    
    const scrapingRecord = await mockSupabase('insert', {
      offer_id: 'test-offer-id',
      user_id: 'test-user-id',
      url,
      status: 'processing'
    });
    
    await mockFetch(url);
    
    console.log('Test Case 2: This should not be reached');
  } catch (error) {
    console.error('Test Case 2 failed as expected:', error.message);
    
    await mockSupabase('update', {
      id: 'test-record-id',
      status: 'failed',
      error: error.message,
      completed_at: new Date().toISOString()
    });
    
    console.log('Test Case 2: Success (expected failure handled correctly)');
  }
  
  try {
    console.log('\nTest Case 3: Inaccessible website');
    const url = 'https://invalid.com';
    
    const scrapingRecord = await mockSupabase('insert', {
      offer_id: 'test-offer-id',
      user_id: 'test-user-id',
      url,
      status: 'processing'
    });
    
    await mockFetch(url);
    
    console.log('Test Case 3: This should not be reached');
  } catch (error) {
    console.error('Test Case 3 failed as expected:', error.message);
    
    await mockSupabase('update', {
      id: 'test-record-id',
      status: 'failed',
      error: error.message,
      completed_at: new Date().toISOString()
    });
    
    console.log('Test Case 3: Success (expected failure handled correctly)');
  }
  
  console.log('\n=== Edge Function Testing Complete ===');
}

testEdgeFunction();
