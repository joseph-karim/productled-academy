import type { AnalysisInput } from './types';

export const systemPrompt: { role: string; content: string } = {
  role: 'system',
  content: `You are an expert in product-led growth and free model analysis. Using the DEEP framework, analyze the provided information and generate comprehensive insights. Keep all responses concise (2-3 sentences per point).

Consider:
- Desirability: User appeal and value proposition
- Effectiveness: Problem-solution fit and outcome achievement
- Efficiency: Resource utilization and implementation
- Polish: User experience and cohesiveness

Analyze:
1. Overall strategy using DEEP framework
2. Each component's strengths and weaknesses
3. Customer journey stages:
   - Discovery: Problem awareness and initial contact
   - Sign Up: Friction points and time to value
   - Activation: First success and key features
   - Engagement: Core tasks and collaboration
   - Conversion: Upgrade triggers and next features

Provide:
1. DEEP scores (0-10 for each dimension)
2. Component-specific scores (0-100)
3. Journey stage analysis with scores and recommendations
4. Key strengths and weaknesses
5. Actionable recommendations
6. Implementation timeline
7. Testing framework
8. A concise executive summary that highlights key insights and next steps`
};

export function generateUserPrompt(input: AnalysisInput): { role: string; content: string } {
  // Format the ideal user traits
  const idealUserTraits = Array.isArray(input.idealUser?.traits) 
    ? input.idealUser.traits.join(', ') 
    : '';

  // Format challenges with levels
  const formattedChallenges = input.challenges.map(c => {
    const level = c.level || 'unspecified';
    const magnitude = c.magnitude || 'unspecified';
    return `- ${c.title} (Level: ${level}, Magnitude: ${magnitude})`;
  }).join('\n');

  // Format solutions with types and costs
  const formattedSolutions = input.solutions.map(s => 
    `- ${s.text} (Type: ${s.type || 'not specified'}, Cost: ${s.cost || 'not specified'})`
  ).join('\n');

  // Format user journey if available
  const formattedJourney = input.userJourney ? `
User Journey:
Discovery:
- Problem: ${input.userJourney.discovery?.problem || 'Not specified'}
- Trigger: ${input.userJourney.discovery?.trigger || 'Not specified'}
- Initial Thought: ${input.userJourney.discovery?.initialThought || 'Not specified'}

Sign Up:
- Friction: ${input.userJourney.signup?.friction || 'Not specified'}
- Time to Value: ${input.userJourney.signup?.timeToValue || 'Not specified'}
- Guidance: ${input.userJourney.signup?.guidance?.join(', ') || 'Not specified'}

Activation:
- First Win: ${input.userJourney.activation?.firstWin || 'Not specified'}
- "Aha" Feature: ${input.userJourney.activation?.ahaFeature || 'Not specified'}
- Time to Success: ${input.userJourney.activation?.timeToSuccess || 'Not specified'}

Engagement:
- Core Tasks: ${input.userJourney.engagement?.coreTasks?.join(', ') || 'Not specified'}
- Collaboration: ${input.userJourney.engagement?.collaboration?.join(', ') || 'Not specified'}
- Limitations: ${input.userJourney.engagement?.limitations?.join(', ') || 'Not specified'}

Conversion:
- Triggers: ${input.userJourney.conversion?.triggers?.join(', ') || 'Not specified'}
- Next Features: ${input.userJourney.conversion?.nextFeatures?.join(', ') || 'Not specified'}
` : 'User Journey: Not provided';

  return {
    role: 'user',
    content: `
Product Description: ${input.productDescription}

Ideal User:
- Title: ${input.idealUser?.title || 'Not specified'}
- Description: ${input.idealUser?.description || 'Not specified'}
- Motivation: ${input.idealUser?.motivation || 'Not specified'}
- Technical Ability: ${input.idealUser?.ability || 'Not specified'}
- Traits: ${idealUserTraits}
- Impact: ${input.idealUser?.impact || 'Not specified'}

User Endgame: ${input.userEndgame}

Challenges:
${formattedChallenges}

Solutions:
${formattedSolutions}

Selected Model: ${input.selectedModel}

${formattedJourney}

Analyze this information using the DEEP framework. For each component and journey stage, provide specific strengths and actionable recommendations. Create a comprehensive analysis that evaluates the free model strategy across all dimensions.`
  };
}