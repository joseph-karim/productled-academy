import { openai, handleOpenAIRequest } from '../client';
import { systemPrompt, generateUserPrompt } from './prompts';
import { analysisFunction } from './functions';
import type { AnalysisInput } from './types';
import type { Analysis } from '../../../types';

function createDefaultJourneyStage() {
  return {
    score: 0,
    analysis: "No analysis available.",
    strengths: [],
    suggestions: []
  };
}

export async function analyzeFormData(input: AnalysisInput): Promise<Analysis> {
  // Log input data for debugging
  console.log("Analyzing input:", {
    productDescription: input.productDescription ? "Present" : "Missing",
    idealUser: input.idealUser ? "Present" : "Missing",
    userEndgame: input.userEndgame ? "Present" : "Missing",
    selectedModel: input.selectedModel ? "Present" : "Missing",
    challenges: input.challenges?.length || 0,
    solutions: input.solutions?.length || 0
  });

  // Validate required fields with detailed error messages
  if (!input.productDescription || typeof input.productDescription !== 'string') {
    throw new Error('Missing required field: productDescription');
  }

  if (!input.userEndgame || typeof input.userEndgame !== 'string') {
    throw new Error('Missing required field: userEndgame');
  }

  if (!input.selectedModel) {
    throw new Error('Missing required field: selectedModel');
  }

  if (!input.idealUser || !input.idealUser.title || !input.idealUser.description) {
    throw new Error('Missing required field: idealUser (must include title and description)');
  }

  // Ensure arrays are properly initialized
  const validatedInput = {
    ...input,
    challenges: Array.isArray(input.challenges) ? input.challenges : [],
    solutions: Array.isArray(input.solutions) ? input.solutions : [],
    idealUser: {
      title: input.idealUser.title,
      description: input.idealUser.description,
      motivation: input.idealUser.motivation || 'Medium',
      ability: input.idealUser.ability || 'Medium',
      traits: Array.isArray(input.idealUser.traits) ? input.idealUser.traits : [],
      impact: input.idealUser.impact || ''
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

    try {
      const parsedResult = JSON.parse(result);
      
      // Add fallbacks for missing properties
      const defaultEmptyArray: string[] = [];
      
      // Ensure action plan exists with all required arrays
      if (!parsedResult.actionPlan) parsedResult.actionPlan = {};
      if (!parsedResult.actionPlan.immediate) parsedResult.actionPlan.immediate = [...defaultEmptyArray];
      if (!parsedResult.actionPlan.medium) parsedResult.actionPlan.medium = [...defaultEmptyArray];
      if (!parsedResult.actionPlan.long) parsedResult.actionPlan.long = [...defaultEmptyArray];
      if (!parsedResult.actionPlan.people) parsedResult.actionPlan.people = [...defaultEmptyArray];
      if (!parsedResult.actionPlan.process) parsedResult.actionPlan.process = [...defaultEmptyArray];
      if (!parsedResult.actionPlan.technology) parsedResult.actionPlan.technology = [...defaultEmptyArray];
      
      // Ensure testing exists with required arrays
      if (!parsedResult.testing) parsedResult.testing = {};
      if (!parsedResult.testing.abTests) parsedResult.testing.abTests = [...defaultEmptyArray];
      if (!parsedResult.testing.metrics) parsedResult.testing.metrics = [...defaultEmptyArray];
      
      // Ensure journey analysis exists with all stages
      if (!parsedResult.journeyAnalysis) {
        parsedResult.journeyAnalysis = {
          overview: "Journey analysis not available.",
          discovery: createDefaultJourneyStage(),
          signup: createDefaultJourneyStage(),
          activation: createDefaultJourneyStage(),
          engagement: createDefaultJourneyStage(),
          conversion: createDefaultJourneyStage()
        };
      }

      // Ensure strengths and weaknesses exist
      if (!parsedResult.strengths) parsedResult.strengths = [...defaultEmptyArray];
      if (!parsedResult.weaknesses) parsedResult.weaknesses = [...defaultEmptyArray];
      if (!parsedResult.recommendations) parsedResult.recommendations = [...defaultEmptyArray];
      
      return parsedResult as Analysis;
    } catch (e) {
      console.error("Error parsing analysis result:", e);
      throw new Error("Failed to parse analysis result");
    }
  } catch (error) {
    console.error("API error:", error);
    throw new Error("Failed to analyze form data");
  }
}

export * from './types';