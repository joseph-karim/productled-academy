/**
 * Simple utility to test Supabase API key validity
 */

export async function testSupabaseApiKey(apiKey: string, supabaseUrl: string): Promise<boolean> {
  try {
    console.log('Testing Supabase API key...');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Key Length: ${apiKey.length}`);
    
    // Try a simple health check query
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const status = response.status;
    console.log(`API Test Response Status: ${status}`);
    
    if (status === 200) {
      console.log('API key is valid!');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`API key test failed with status ${status}:`, errorText);
      return false;
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return false;
  }
}

// Create a function to expose in dev console for direct testing
declare global {
  interface Window {
    testSupabaseKey: (key?: string) => Promise<boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.testSupabaseKey = async (key?: string) => {
    const apiKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    return testSupabaseApiKey(apiKey, url);
  };
} 