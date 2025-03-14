import type { AnalysisPrompt } from './types';

export const systemPrompt: AnalysisPrompt = {
  role: 'system',
  content: `You are an expert in product-led growth and free model analysis. Using the DEEP framework, analyze the provided information and generate comprehensive insights. Keep all responses concise (2-3 sentences per point).

Consider:
- Desirability: User appeal and value proposition
- Effectiveness: Problem-solution fit and outcome achievement
- Efficiency: Resource utilization and implementation
- Polish: User experience and cohesiveness

Provide:
1. DEEP scores (0-10 for each dimension)
2. Component-specific scores (0-100)
3. Key strengths and weaknesses
4. Actionable recommendations
5. Implementation timeline
6. Testing framework
7. A concise executive summary that highlights key insights and next steps`
};

export function generateUserPrompt(input: {
  productDescription: string;
  idealUser: {
    title?: string;
    description?: string;
    motivation?: string;
    ability?: string;
    traits?: string[];
    impact?: string;
  };
  userEndgame: string;
  challenges: Array<{ title: string; level?: string; magnitude?: string }>;
  solutions: Array<{ text: string; type?: string; cost?: string }>;
  selectedModel: string;
  freeFeatures: Array<{ name?: string; description?: string }>;
  userJourney?: any;
}): AnalysisPrompt {
  // Format the ideal user traits
  const idealUserTraits = Array.isArray(input.idealUser?.traits) 
    ? input.idealUser.traits.join(', ') 
    : typeof input.idealUser?.traits === 'string' 
      ? input.idealUser.traits 
      : '';

  // Format challenges with levels
  const formattedChallenges = input.challenges.map(c => {
    const level = c.level || 'unspecified';
    const magnitude = c.magnitude || 'unspecified';
    return `- ${c.title} (Level: ${level}, Magnitude: ${magnitude})`;
  }).join('\n');

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
${input.solutions.map(s => `- ${s.text} (Type: ${s.type || 'not specified'}, Cost: ${s.cost || 'not specified'})`).join('\n')}

Selected Model: ${input.selectedModel}

Free Features:
${input.freeFeatures.map(f => `- ${f.name || 'Unnamed'}: ${f.description || 'No description'}`).join('\n')}

User Journey Canvas: ${input.userJourney ? JSON.stringify(input.userJourney) : 'Not provided'}

Analyze this information using the DEEP framework. For each component, provide specific strengths and actionable recommendations. Create a comprehensive analysis that evaluates the free model strategy across all dimensions.`
  };
}