import { openai, handleOpenAIRequest } from './client';
import { getScrapingResult } from '../webscraping';

export interface BrandingDetails {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headings: string;
    body: string;
  };
  spacing: string;
  imagery: string;
  logoUrl?: string;
}

/**
 * Extract branding details from a website using the scraping result
 */
export async function extractBrandingDetails(scrapingId: string | null): Promise<BrandingDetails | null> {
  if (!scrapingId) {
    console.log('No scraping ID provided for branding extraction');
    return null;
  }

  try {
    // Get the scraping result
    const scrapingResult = await getScrapingResult(scrapingId);
    
    if (!scrapingResult || scrapingResult.status !== 'completed') {
      console.log('Scraping result not available or not completed');
      return null;
    }

    // Create a prompt for the OpenAI API to extract branding details
    const brandingPrompt = `
You are a design expert specializing in extracting branding details from website content. 
I need you to analyze the following website content and extract the brand's visual identity elements.

Website URL: ${scrapingResult.url}
Website Title: ${scrapingResult.title || 'Not available'}
Meta Description: ${scrapingResult.metaDescription || 'Not available'}

${scrapingResult.analysisResult?.findings ? `
Core Offer: ${scrapingResult.analysisResult.findings.coreOffer || 'Not available'}
Target Audience: ${scrapingResult.analysisResult.findings.targetAudience || 'Not available'}
Value Proposition: ${scrapingResult.analysisResult.findings.valueProposition || 'Not available'}
Tone: ${typeof scrapingResult.analysisResult.findings.tone === 'string' 
  ? scrapingResult.analysisResult.findings.tone 
  : scrapingResult.analysisResult.findings.tone?.overall || 'Not available'}
` : ''}

Based on this information, please extract or infer the following branding elements:

1. Color Palette:
   - Primary color (main brand color, used for logos, buttons, etc.)
   - Secondary color (complementary to primary, used for accents)
   - Accent color (for highlights, CTAs)
   - Background color (main page background)
   - Text color (main body text)

2. Typography:
   - Heading font style (serif, sans-serif, display, etc.)
   - Body text font style

3. Spacing:
   - Overall spacing approach (compact, airy, etc.)

4. Imagery:
   - Style of imagery used (photos, illustrations, abstract, etc.)

Please provide specific hex codes for colors when possible. If you can't determine exact values, provide your best educated guess based on the brand's industry, target audience, and tone.

Format your response as a JSON object with the following structure:
{
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "typography": {
    "headings": "description",
    "body": "description"
  },
  "spacing": "description",
  "imagery": "description"
}
`;

    // Call the OpenAI API to extract branding details
    return handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a design expert specializing in extracting branding details from website content."
          },
          {
            role: "user",
            content: brandingPrompt
          }
        ],
        functions: [
          {
            name: "extract_branding_details",
            description: "Extract branding details from website content",
            parameters: {
              type: "object",
              properties: {
                colorPalette: {
                  type: "object",
                  properties: {
                    primary: {
                      type: "string",
                      description: "Primary brand color (hex code)"
                    },
                    secondary: {
                      type: "string",
                      description: "Secondary brand color (hex code)"
                    },
                    accent: {
                      type: "string",
                      description: "Accent color for highlights and CTAs (hex code)"
                    },
                    background: {
                      type: "string",
                      description: "Main page background color (hex code)"
                    },
                    text: {
                      type: "string",
                      description: "Main body text color (hex code)"
                    }
                  },
                  required: ["primary", "secondary", "accent", "background", "text"]
                },
                typography: {
                  type: "object",
                  properties: {
                    headings: {
                      type: "string",
                      description: "Heading font style description"
                    },
                    body: {
                      type: "string",
                      description: "Body text font style description"
                    }
                  },
                  required: ["headings", "body"]
                },
                spacing: {
                  type: "string",
                  description: "Overall spacing approach description"
                },
                imagery: {
                  type: "string",
                  description: "Style of imagery used description"
                }
              },
              required: ["colorPalette", "typography", "spacing", "imagery"]
            }
          }
        ],
        function_call: { name: "extract_branding_details" },
        temperature: 0.5,
        max_tokens: 1000
      })
    ).then(response => {
      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.name === "extract_branding_details") {
        return JSON.parse(functionCall.arguments) as BrandingDetails;
      }
      throw new Error("Failed to extract branding details");
    }).catch(error => {
      console.error('Error extracting branding details:', error);
      return null;
    });
  } catch (error) {
    console.error('Error in extractBrandingDetails:', error);
    return null;
  }
}

/**
 * Fallback branding details if extraction fails
 */
export function getFallbackBrandingDetails(): BrandingDetails {
  return {
    colorPalette: {
      primary: '#4C6FFF',
      secondary: '#1C1C1C',
      accent: '#FFD23F',
      background: '#FFFFFF',
      text: '#333333'
    },
    typography: {
      headings: 'Sans-serif (e.g., Inter, Helvetica) with bold weight',
      body: 'Sans-serif (e.g., Inter, Helvetica) with regular weight'
    },
    spacing: 'Consistent spacing with 16px/24px/32px increments',
    imagery: 'Clean, minimal illustrations or screenshots that demonstrate the product in action'
  };
}
