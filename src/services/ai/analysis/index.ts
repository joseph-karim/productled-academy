import { openai, handleOpenAIRequest } from '../client';
import { systemPrompt, generateUserPrompt } from './prompts';
import { analysisFunction } from './functions';
import type { AnalysisInput } from './types';
import type { Analysis } from '../../../types';

export async function analyzeFormData(input: AnalysisInput): Promise<Analysis> {
  // Validate required fields
  if (!input.productDescription || !input.userEndgame || !input.selectedModel) {
    throw new Error('Missing required fields for analysis');
  }

  // Ensure arrays are properly initialized
  const validatedInput = {
    ...input,
    challenges: Array.isArray(input.challenges) ? input.challenges : [],
    solutions: Array.isArray(input.solutions) ? input.solutions : [],
    freeFeatures: Array.isArray(input.freeFeatures) ? input.freeFeatures : [],
    idealUser: {
      title: input.idealUser?.title || '',
      description: input.idealUser?.description || '',
      motivation: input.idealUser?.motivation || 'Medium',
      ability: input.idealUser?.ability || 'Medium',
      traits: Array.isArray(input.idealUser?.traits) ? input.idealUser.traits : [],
      impact: input.idealUser?.impact || ''
    }
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        systemPrompt,
        generateUserPrompt(validatedInput)
      ],
      functions: [analysisFunction],
      function_call: { name: "provide_analysis" }
    });

    const result = completion.choices[0].message.function_call?.arguments;
    if (!result) {
      throw new Error("No analysis received");
    }

    let parsedResult: Analysis;
    try {
      parsedResult = JSON.parse(result);
    } catch (error) {
      throw new Error("Failed to parse analysis result");
    }

    // Validate required fields in the response
    const requiredFields = [
      'deepScore',
      'componentScores',
      'componentFeedback',
      'strengths',
      'weaknesses',
      'recommendations',
      'actionPlan',
      'testing',
      'summary'
    ];

    const missingFields = requiredFields.filter(field => !parsedResult[field]);
    if (missingFields.length > 0) {
      throw new Error(`Incomplete analysis results: missing ${missingFields.join(', ')}`);
    }

    // Validate nested required fields
    if (!parsedResult.deepScore.desirability || 
        !parsedResult.deepScore.effectiveness ||
        !parsedResult.deepScore.efficiency ||
        !parsedResult.deepScore.polish) {
      throw new Error("Incomplete analysis results: missing DEEP score components");
    }

    // Validate component scores
    const requiredComponentScores = [
      'productDescription',
      'idealUser',
      'userEndgame',
      'challenges',
      'solutions',
      'modelSelection',
      'freeFeatures',
      'userJourney'
    ];

    const missingScores = requiredComponentScores.filter(
      field => typeof parsedResult.componentScores[field] !== 'number'
    );

    if (missingScores.length > 0) {
      throw new Error(`Incomplete analysis results: missing component scores for ${missingScores.join(', ')}`);
    }

    // Validate component feedback
    const missingFeedback = requiredComponentScores.filter(
      field => !parsedResult.componentFeedback[field] ||
               !Array.isArray(parsedResult.componentFeedback[field].strengths) ||
               !Array.isArray(parsedResult.componentFeedback[field].recommendations)
    );

    if (missingFeedback.length > 0) {
      throw new Error(`Incomplete analysis results: missing feedback for ${missingFeedback.join(', ')}`);
    }

    // Validate action plan
    if (!Array.isArray(parsedResult.actionPlan.immediate) ||
        !Array.isArray(parsedResult.actionPlan.medium) ||
        !Array.isArray(parsedResult.actionPlan.long)) {
      throw new Error("Incomplete analysis results: invalid action plan structure");
    }

    // Validate testing framework
    if (!Array.isArray(parsedResult.testing.abTests) ||
        !Array.isArray(parsedResult.testing.metrics)) {
      throw new Error("Incomplete analysis results: invalid testing framework structure");
    }

    return parsedResult;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw specific validation errors
      if (error.message.includes("Failed to parse analysis result") ||
          error.message.includes("Incomplete analysis results") ||
          error.message === "No analysis received") {
        throw error;
      }
    }
    // Wrap other errors
    throw new Error("Failed to analyze form data");
  }
}

export * from './types';