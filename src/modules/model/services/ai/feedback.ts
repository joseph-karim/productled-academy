import { openai, handleOpenAIRequest } from './client';

interface AnalysisResult {
  feedbacks: Array<{
    id: string;
    text: string;
    suggestion: string;
    type: 'improvement' | 'warning' | 'positive';
    category: string;
    startIndex: number;
    endIndex: number;
  }>;
  missingElements: Array<{
    category: string;
    description: string;
    examples?: string[];
  }>;
  suggestedText?: string;
}

const prompts: Record<string, { role: string; content: string }> = {
  'Product Description': {
    role: 'system',
    content: `You are an expert product strategist helping improve product descriptions. Analyze the text and provide feedback on these core elements:

1. Core Product
   - What is your product/service at its core?
   - Is it clearly defined?
   - Is it a recongizable product category?

2. Features
   - What are the key features and capabilities?
   - Are they specific and tangible?
   - Do they support the core value?

3. Uniqueness
   - What makes it unique or different?
   - Is the differentiation clear?
   - Are comparisons effective?

For each element:
- Provide specific feedback (positive or needs improvement)
- Give concrete examples of how to improve
- Suggest clearer alternatives

Also provide a suggested revision that:
- Is concise (2-3 sentences max)
- Focuses on immediate value
- Uses simple, clear language
- Includes specific metrics when possible
- Avoids technical jargon`
  },
  'Solution': {
    role: 'system',
    content: `You are an expert product strategist specializing in solution design. Analyze the solution and provide feedback. Keep all responses concise (2-3 sentences max).

Key elements to consider:
1. Problem-Solution Fit
   - Does it directly address the challenge?
   - Is the approach effective?

2. Implementation Feasibility
   - Is it technically feasible?
   - What are the key requirements?

3. Quick Win vs Long-term
   - What's the time to value?
   - Are there immediate benefits?

For each element:
- Provide specific, actionable feedback
- Focus on immediate impact
- Keep suggestions brief and clear

Suggested revisions should:
- Be specific and actionable (2-3 sentences)
- Include clear success metrics
- Focus on immediate value delivery`
  },
  'Challenge': {
    role: 'system',
    content: `You are an expert in user experience and product challenges. Analyze the challenge description and provide concise feedback (2-3 sentences max).

Focus on:
1. Problem Definition
   - Specific pain point
   - Clear impact
   - Frequency/severity

2. Context
   - When/where it occurs
   - Affected workflows
   - User scenarios

Keep all feedback brief and actionable. Suggested improvements should be clear and implementable immediately.`
  },
  'User Endgame': {
    role: 'system',
    content: `You are an expert in user success and product outcomes. Analyze the text and provide feedback on these core elements:

1. How
   - What features/approaches enable the transformation?
   - Are the methods clear and specific?
   - Is the approach realistic and achievable?

2. Who
   - Who are the target users?
   - Are their needs clearly defined?
   - Is the audience segmentation appropriate?

3. Why
   - What problems are being solved?
   - Are the pain points clear?
   - Is the motivation compelling?

4. Results
   - What specific outcomes are achieved?
   - Are the benefits measurable?
   - Is the timeline realistic?

For each element:
- Provide specific feedback (positive or needs improvement)
- Give concrete examples of how to improve
- Suggest clearer alternatives

Also provide a suggested revision that:
- Is concise and focused
- Includes specific metrics
- Shows clear transformation
- Links features to outcomes`
  }
};

export async function analyzeText(text: string, context: keyof typeof prompts): Promise<AnalysisResult> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  const contextPrompt = prompts[context];
  if (!contextPrompt) {
    throw new Error(`No prompt found for context: ${context}`);
  }

  const completion = await handleOpenAIRequest(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        contextPrompt,
        { 
          role: "user", 
          content: `Analyze this ${context}:\n\n${text}\n\nProvide detailed, specific feedback with concrete examples and improvements.`
        }
      ],
      functions: [
        {
          name: "provide_feedback",
          description: "Provide structured feedback on the text",
          parameters: {
            type: "object",
            properties: {
              feedbacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    suggestion: { type: "string" },
                    type: { 
                      type: "string",
                      enum: ["improvement", "warning", "positive"]
                    },
                    category: {
                      type: "string",
                      enum: context === 'Solution'
                        ? ["Problem-Solution Fit", "Implementation Feasibility", "Scalability & Maintenance", "Quick Win vs Long-term"]
                        : context === 'Product Description'
                        ? ["Core Product", "Features", "Uniqueness", "Use Case"]
                        : ["Problem Definition", "Impact Assessment", "Context", "Current Workarounds"]
                    },
                    startIndex: { type: "number" },
                    endIndex: { type: "number" }
                  },
                  required: ["text", "suggestion", "type", "category", "startIndex", "endIndex"]
                }
              },
              missingElements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: context === 'Solution'
                        ? ["Problem-Solution Fit", "Implementation Feasibility", "Scalability & Maintenance", "Quick Win vs Long-term"]
                        : context === 'Product Description'
                        ? ["Core Product", "Features", "Uniqueness", "Use Case"]
                        : ["Problem Definition", "Impact Assessment", "Context", "Current Workarounds"]
                    },
                    description: { type: "string" },
                    examples: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["category", "description"]
                }
              },
              suggestedText: { type: "string" }
            },
            required: ["feedbacks", "missingElements"]
          }
        }
      ],
      function_call: { name: "provide_feedback" }
    }),
    'analyzing text'
  );

  const result = completion.choices[0].message.function_call?.arguments;
  if (!result) throw new Error("No feedback received from the analysis");

  const parsedResult = JSON.parse(result) as AnalysisResult;

  // Add unique IDs to feedbacks
  const feedbacksWithIds = parsedResult.feedbacks.map(feedback => ({
    ...feedback,
    id: crypto.randomUUID()
  }));

  // Add missing elements as warnings with unique IDs
  const feedbacksWithMissing = [
    ...feedbacksWithIds,
    ...parsedResult.missingElements.map(missing => ({
      id: crypto.randomUUID(),
      text: '',
      suggestion: missing.description,
      type: 'warning' as const,
      category: missing.category,
      startIndex: 0,
      endIndex: 0
    }))
  ];

  return {
    ...parsedResult,
    feedbacks: feedbacksWithMissing
  };
}