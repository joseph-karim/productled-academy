import { openai, handleOpenAIRequest } from './client';

// Define the types for the landing page variations
interface LandingPageVariation {
  id: string;
  name: string;
  description: string;
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    visualDescription: string;
  };
  problem: {
    headline: string;
    description: string;
  };
  solution: {
    headline: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  riskReversal: {
    objection: string;
    assurance: string;
  };
  cta: {
    headline: string;
    description: string;
    buttonText: string;
  };
  visualStyleGuide: {
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
  };
  detailedStructure: string;
  score?: {
    total: number;
    criteria: {
      [key: string]: number;
    };
    feedback: string;
  };
}

/**
 * Generate variations of a landing page
 */
export async function generateLandingPageVariations(
  originalVariation: LandingPageVariation
): Promise<LandingPageVariation[]> {
  // Use the original variation's visual style guide for all variations to maintain brand consistency
  // Create the prompt for generating variations
  const variationsPrompt = `
PURPOSE: Generate alternative versions of landing page sections to test different approaches.

ORIGINAL LANDING PAGE:
Hero Section:
Headline: ${originalVariation.hero.headline}
Subheadline: ${originalVariation.hero.subheadline}
CTA: ${originalVariation.hero.cta}
Visual: ${originalVariation.hero.visualDescription}

Problem Section:
Headline: ${originalVariation.problem.headline}
Description: ${originalVariation.problem.description}

Solution Section:
Headline: ${originalVariation.solution.headline}
Steps:
${originalVariation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${originalVariation.riskReversal.objection}
Assurance: ${originalVariation.riskReversal.assurance}

CTA Section:
Headline: ${originalVariation.cta.headline}
Description: ${originalVariation.cta.description}
Button Text: ${originalVariation.cta.buttonText}

For each variation:
- Use a different copywriting framework
- Test a different emotional appeal
- Vary the length and depth
- Change the primary benefit focus

Variation 1: Focus on fear of missing out (FOMO) and urgency
Variation 2: Focus on specific results and social proof
Variation 3: Focus on ease of implementation and quick wins

Please explain the strategic thinking behind each variation and what specific hypothesis it tests. Include complete copy for each variation.
`;

  // Simulate API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create three variations
      const variations: LandingPageVariation[] = [
        {
          id: 'variation-1',
          name: 'FOMO & Urgency',
          description: 'Emphasizes scarcity and time-sensitive benefits to create urgency.',
          hero: {
            headline: `Don't Miss Out: ${originalVariation.hero.headline.replace(/\.$/, '')} Before It's Too Late`,
            subheadline: `Limited spots available. ${originalVariation.hero.subheadline} Join the successful users who are already seeing results.`,
            cta: `Secure Your Spot Now`,
            visualDescription: `People actively engaging with the product with a countdown timer overlay showing limited availability`
          },
          problem: {
            headline: `The Costly Mistake Most People Are Making Right Now`,
            description: `Every day you wait, you're falling further behind. ${originalVariation.problem.description} Your competitors are already solving this problem - can you afford to wait?`
          },
          solution: {
            headline: `The Time-Sensitive Solution Smart Users Are Leveraging Today`,
            steps: originalVariation.solution.steps.map(step => ({
              title: `FAST: ${step.title}`,
              description: `Quickly ${step.description.toLowerCase()} before your competition does.`
            }))
          },
          riskReversal: {
            objection: `"I'm not sure if I have time to implement this right now"`,
            assurance: `Our quick-start implementation takes just 15 minutes. And with our 30-day money-back guarantee, you have nothing to lose and everything to gain.`
          },
          cta: {
            headline: `Limited Time Offer: Act Now`,
            description: `Only 50 spots remaining at this price point. Don't miss this opportunity to transform your results.`,
            buttonText: `Claim Your Spot Now`
          },
          visualStyleGuide: originalVariation.visualStyleGuide,
          detailedStructure: 'FOMO-driven landing page structure with countdown elements and scarcity indicators'
        },
        {
          id: 'variation-2',
          name: 'Results & Proof',
          description: 'Focuses on specific, measurable outcomes and social validation.',
          hero: {
            headline: `${originalVariation.hero.headline.replace(/\.$/, '')}: 93% of Users See Results in 2 Weeks`,
            subheadline: `Join 10,000+ satisfied customers who have experienced measurable improvements. ${originalVariation.hero.subheadline}`,
            cta: `See Real Results`,
            visualDescription: `Before/after comparison showing measurable improvement with testimonial quotes overlaid`
          },
          problem: {
            headline: `The Data Doesn't Lie: Here's What You're Missing`,
            description: `${originalVariation.problem.description} Our research shows that companies addressing this problem see an average 27% improvement in outcomes.`
          },
          solution: {
            headline: `The Proven System with Measurable Results`,
            steps: originalVariation.solution.steps.map(step => ({
              title: `PROVEN: ${step.title}`,
              description: `${step.description} Our users report a 35% improvement in this area alone.`
            }))
          },
          riskReversal: {
            objection: `"I need to see proof that this actually works"`,
            assurance: `Join 10,000+ users who have already seen results. We offer a data-backed guarantee: if you don't see improvement in 30 days, we'll refund your investment.`
          },
          cta: {
            headline: `Join Thousands of Successful Users`,
            description: `"This solution increased our results by 42% in just 3 weeks" - Jane D., CEO`,
            buttonText: `Get These Results Now`
          },
          visualStyleGuide: originalVariation.visualStyleGuide,
          detailedStructure: 'Results-focused landing page with prominent testimonials and data points throughout'
        },
        {
          id: 'variation-3',
          name: 'Ease & Quick Wins',
          description: 'Emphasizes simplicity, low friction, and immediate benefits.',
          hero: {
            headline: `${originalVariation.hero.headline.replace(/\.$/, '')}: Simple, Fast, Effective`,
            subheadline: `No complicated setup. No learning curve. ${originalVariation.hero.subheadline} Get started in under 5 minutes.`,
            cta: `Start Simply`,
            visualDescription: `A simple 3-step visual showing how easy it is to implement the solution`
          },
          problem: {
            headline: `Tired of Complicated Solutions That Take Forever?`,
            description: `${originalVariation.problem.description} Most solutions are too complex and time-consuming, but it doesn't have to be that way.`
          },
          solution: {
            headline: `The Simplest Way to Achieve Results, Starting Today`,
            steps: originalVariation.solution.steps.map(step => ({
              title: `EASY: ${step.title}`,
              description: `Effortlessly ${step.description.toLowerCase()} with just a few clicks.`
            }))
          },
          riskReversal: {
            objection: `"I don't have time to learn another complicated system"`,
            assurance: `Our solution is designed for busy professionals. Most users are up and running in under 5 minutes, with no training required.`
          },
          cta: {
            headline: `Get Started in 5 Minutes or Less`,
            description: `No credit card required. No complicated setup. Just immediate results.`,
            buttonText: `Start Simply Now`
          },
          visualStyleGuide: originalVariation.visualStyleGuide,
          detailedStructure: 'Simplified landing page structure with emphasis on ease of use and quick implementation'
        }
      ];

      resolve(variations);
    }, 2000);
  });
}

/**
 * Refine the copy for a landing page variation
 */
export async function refineLandingPageCopy(
  variation: LandingPageVariation
): Promise<LandingPageVariation> {
  // Create the prompt for refining copy
  const refinePrompt = `
PURPOSE: Refine your landing page copy to make it more compelling, concise, and conversion-focused.

CURRENT LANDING PAGE:
Hero Section:
Headline: ${variation.hero.headline}
Subheadline: ${variation.hero.subheadline}
CTA: ${variation.hero.cta}
Visual: ${variation.hero.visualDescription}

Problem Section:
Headline: ${variation.problem.headline}
Description: ${variation.problem.description}

Solution Section:
Headline: ${variation.solution.headline}
Steps:
${variation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${variation.riskReversal.objection}
Assurance: ${variation.riskReversal.assurance}

CTA Section:
Headline: ${variation.cta.headline}
Description: ${variation.cta.description}
Button Text: ${variation.cta.buttonText}

Can you drastically improve the copy using these copywriting principles?

- Make it more concise, punchy, and value-driven
- Use the Problem-Agitation-Solution framework
- Focus on specific benefits, not vague features
- Create urgency and emotional resonance
- Use short, powerful sentences
- Cut unnecessary words and business jargon
- Make CTAs clear, compelling, and action-oriented
- Enhance the problem/agitation sections to create more urgency
- Ensure all benefits are concrete, not abstract

Specifically:
- Make headlines more compelling and benefit-driven
- Cut unnecessary words and phrases
- Add more emotional triggers
- Strengthen CTAs to increase desire to click
- Make all benefits concrete and specific, with numbers where possible
`;

  // Simulate API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a refined version of the variation
      const refinedVariation: LandingPageVariation = {
        ...variation,
        id: variation.id,
        name: `${variation.name} (Refined)`,
        description: `${variation.description} Optimized for conversion with punchy, benefit-driven copy.`,
        hero: {
          headline: variation.hero.headline.replace(/\b(Get|Achieve|Discover)\b/g, 'Unlock').replace(/\.$/, '!'),
          subheadline: variation.hero.subheadline.replace(/\b(can|could|may|might)\b/g, 'will'),
          cta: variation.hero.cta.replace(/\b(Get|Start)\b/g, 'Claim Your'),
          visualDescription: variation.hero.visualDescription
        },
        problem: {
          headline: variation.problem.headline.replace(/\?$/, '!'),
          description: variation.problem.description.replace(/\b(issue|problem|challenge)\b/g, 'pain point')
        },
        solution: {
          headline: variation.solution.headline.replace(/\b(The|A)\b/g, 'Your'),
          steps: variation.solution.steps.map(step => ({
            title: step.title.replace(/\b(Get|Achieve|Discover)\b/g, 'Unlock'),
            description: step.description.replace(/\b(can|could|may|might)\b/g, 'will')
          }))
        },
        riskReversal: {
          objection: variation.riskReversal.objection,
          assurance: variation.riskReversal.assurance.replace(/\b(offer|provide)\b/g, 'guarantee')
        },
        cta: {
          headline: variation.cta.headline.replace(/\.$/, '!'),
          description: variation.cta.description.replace(/\b(Get|Start)\b/g, 'Claim'),
          buttonText: variation.cta.buttonText.replace(/\b(Get|Start)\b/g, 'Claim Your')
        },
        visualStyleGuide: variation.visualStyleGuide,
        detailedStructure: variation.detailedStructure
      };

      resolve(refinedVariation);
    }, 1500);
  });
}

/**
 * Create a visual style guide for a landing page
 */
export async function createVisualStyleGuide(
  variation: LandingPageVariation
): Promise<LandingPageVariation['visualStyleGuide']> {
  // Create the prompt for generating a visual style guide
  const styleGuidePrompt = `
PURPOSE: Create a comprehensive visual style guide for your landing page.

LANDING PAGE CONTENT:
Hero Section:
Headline: ${variation.hero.headline}
Subheadline: ${variation.hero.subheadline}
CTA: ${variation.hero.cta}
Visual: ${variation.hero.visualDescription}

Problem Section:
Headline: ${variation.problem.headline}
Description: ${variation.problem.description}

Solution Section:
Headline: ${variation.solution.headline}
Steps:
${variation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${variation.riskReversal.objection}
Assurance: ${variation.riskReversal.assurance}

CTA Section:
Headline: ${variation.cta.headline}
Description: ${variation.cta.description}
Button Text: ${variation.cta.buttonText}

Please create a comprehensive visual style guide for this landing page, based on best practices for B2B SaaS conversion. The guide should include:

- Color palette with primary, secondary, and accent colors (with specific hex codes)
- Typography recommendations for headings, subheadings, and body text
- Button styles and hover states
- Whitespace and spacing principles
- Image and icon guidance
- Mobile optimization principles
- Layout and grid system

The visual style should convey professionalism and trustworthiness while optimizing for conversion. Please provide specific guidance that could be implemented by a designer or in a no-code tool.

The style should prioritize:
- Clean, minimalist design that focuses attention on key messages
- Strong visual hierarchy that guides the user through the page
- Ample whitespace to improve readability
- Strategic use of color to highlight CTAs
- Mobile-first approach to ensure responsive design
- Consistent visual language throughout the page
`;

  // Simulate API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a visual style guide
      const visualStyleGuide: LandingPageVariation['visualStyleGuide'] = {
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

      resolve(visualStyleGuide);
    }, 1000);
  });
}

/**
 * Score a landing page based on conversion criteria
 */
export async function scoreLandingPage(
  variation: LandingPageVariation
): Promise<{
  total: number;
  criteria: { [key: string]: number };
  feedback: string;
}> {
  // Create the prompt for scoring a landing page
  const scorePrompt = `
PURPOSE: Evaluate this landing page against key conversion criteria.

LANDING PAGE CONTENT:
Hero Section:
Headline: ${variation.hero.headline}
Subheadline: ${variation.hero.subheadline}
CTA: ${variation.hero.cta}
Visual: ${variation.hero.visualDescription}

Problem Section:
Headline: ${variation.problem.headline}
Description: ${variation.problem.description}

Solution Section:
Headline: ${variation.solution.headline}
Steps:
${variation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${variation.riskReversal.objection}
Assurance: ${variation.riskReversal.assurance}

CTA Section:
Headline: ${variation.cta.headline}
Description: ${variation.cta.description}
Button Text: ${variation.cta.buttonText}

Please score this landing page on a scale of 1-5 for each of these criteria:

1. Your users are clear on what the main result is
2. It's clear what your advantage is and what makes your product better
3. It's clear that it's not a risky option to signup - you have ample assurances in place
4. Your hero section clearly communicates what you do
5. Your problem section resonates with your ideal users and builds instant rapport
6. Your solution section simply outlines how you help your ideal users win
7. You have compelling social proof that builds trust and comes across as authentic
8. You have an irresistible call to action
9. Your users are motivated to signup
10. A user can read your headlines and understand exactly what your product is all about
11. Your body copy reinforces each of your headlines
12. All aesthetics compliment the copy and amplify the message
13. Your homepage is fast to load and user friendly

For each criterion, provide a score and brief explanation. Then provide an overall score and summary feedback with specific suggestions for improvement.
`;

  // Simulate API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate random scores for each criterion (1-5)
      const criteria = {
        'Clear main result': Math.floor(Math.random() * 5) + 1,
        'Clear advantage': Math.floor(Math.random() * 5) + 1,
        'Risk reduction': Math.floor(Math.random() * 5) + 1,
        'Hero clarity': Math.floor(Math.random() * 5) + 1,
        'Problem resonance': Math.floor(Math.random() * 5) + 1,
        'Solution clarity': Math.floor(Math.random() * 5) + 1,
        'Social proof': Math.floor(Math.random() * 5) + 1,
        'CTA effectiveness': Math.floor(Math.random() * 5) + 1,
        'User motivation': Math.floor(Math.random() * 5) + 1,
        'Headline clarity': Math.floor(Math.random() * 5) + 1,
        'Body copy reinforcement': Math.floor(Math.random() * 5) + 1,
        'Aesthetic alignment': Math.floor(Math.random() * 5) + 1,
        'Page speed/usability': Math.floor(Math.random() * 5) + 1
      };

      // Calculate total score (average of all criteria)
      const total = Object.values(criteria).reduce((sum, score) => sum + score, 0) / Object.keys(criteria).length;

      // Generate feedback based on scores
      const feedback = `This landing page scores well on ${Object.entries(criteria)
        .filter(([_, score]) => score >= 4)
        .map(([criterion]) => criterion.toLowerCase())
        .join(', ')}.

        Areas for improvement include ${Object.entries(criteria)
        .filter(([_, score]) => score <= 2)
        .map(([criterion]) => criterion.toLowerCase())
        .join(', ')}.`;

      resolve({
        total,
        criteria,
        feedback
      });
    }, 1000);
  });
}

/**
 * Create a detailed landing page structure
 */
export async function createDetailedLandingPageStructure(
  variation: LandingPageVariation
): Promise<string> {
  // Create the prompt for generating a detailed landing page structure
  const structurePrompt = `
PURPOSE: Use this detailed template as a starting point for high-converting landing pages.

LANDING PAGE CONTENT:
Hero Section:
Headline: ${variation.hero.headline}
Subheadline: ${variation.hero.subheadline}
CTA: ${variation.hero.cta}
Visual: ${variation.hero.visualDescription}

Problem Section:
Headline: ${variation.problem.headline}
Description: ${variation.problem.description}

Solution Section:
Headline: ${variation.solution.headline}
Steps:
${variation.solution.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Risk Reversal:
Objection: ${variation.riskReversal.objection}
Assurance: ${variation.riskReversal.assurance}

CTA Section:
Headline: ${variation.cta.headline}
Description: ${variation.cta.description}
Button Text: ${variation.cta.buttonText}

VISUAL STYLE GUIDE:
Color Palette:
- Primary: ${variation.visualStyleGuide.colorPalette.primary}
- Secondary: ${variation.visualStyleGuide.colorPalette.secondary}
- Accent: ${variation.visualStyleGuide.colorPalette.accent}
- Background: ${variation.visualStyleGuide.colorPalette.background}
- Text: ${variation.visualStyleGuide.colorPalette.text}

Typography:
- Headings: ${variation.visualStyleGuide.typography.headings}
- Body: ${variation.visualStyleGuide.typography.body}

Spacing: ${variation.visualStyleGuide.spacing}
Imagery: ${variation.visualStyleGuide.imagery}

Please create a detailed landing page structure (designed for a clean, single-column flow, prioritizing mobile readability) that includes:

- Hero Section (Above the Fold)
- Problem/Agitation Section
- Solution/Benefits Section
- Social Proof & Trust Section
- Differentiation Section
- FAQ Section (Addressing Potential Objections)
- Final Call-to-Action (CTA) Section
- Footer (Minimal)

For each section, provide specific guidance on layout, content, and visual elements.
`;

  // Simulate API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a detailed landing page structure
      const detailedStructure = `
Landing Page Structure & Content Elements: (Designed for a clean, single-column flow, prioritizing mobile readability)

Hero Section (Above the Fold)
- Headline: "${variation.hero.headline}" in large, bold font using primary color accents
- Sub-headline: "${variation.hero.subheadline}" in slightly smaller font, light weight
- Primary CTA Button: "${variation.hero.cta}" in accent color with hover effect
- Visual: ${variation.hero.visualDescription}
- Layout: Two-column on desktop (text left, visual right), stacked on mobile

Problem/Agitation Section
- Headline: "${variation.problem.headline}" centered, medium size
- Body: Two paragraphs explaining the problem, with key phrases in bold
- Visual: Simple illustration showing the pain point
- Background: Subtle light gray to differentiate from hero
- Layout: Single column, text-centered design

Solution/Benefits Section
- Headline: "${variation.solution.headline}" centered, medium size
- Feature-to-Benefit Blocks: 3 columns on desktop, stacked on mobile
- Each block includes: Icon, Feature title, Brief description
- Steps presented as numbered cards with clear hierarchy
- Background: White for clean reading
- Layout: Multi-column grid on desktop, single column on mobile

Social Proof & Trust Section
- Customer logos in grayscale
- Featured testimonial with photo, name, and company
- Trust badges/certifications
- Background: Subtle brand color wash
- Layout: Logos in row, testimonial as featured card

Risk Reversal Section
- Objection addressed: "${variation.riskReversal.objection}"
- Assurance provided: "${variation.riskReversal.assurance}"
- Visual: Trust-building icon or guarantee seal
- Layout: Two-column with objection and assurance side by side

Final CTA Section
- Headline: "${variation.cta.headline}" large and centered
- Supporting text: "${variation.cta.description}"
- CTA Button: "${variation.cta.buttonText}" large, accent color
- Background: Contrasting color to make section stand out
- Layout: Centered, full-width design

Footer (Minimal)
- Copyright information
- Essential legal links (Privacy, Terms)
- No distracting navigation
- Background: Dark color for visual closure
- Layout: Simple, minimal design
`;

      resolve(detailedStructure);
    }, 1000);
  });
}
