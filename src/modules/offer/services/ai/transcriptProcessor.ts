import { openai, handleOpenAIRequest } from './client';

export interface TranscriptData {
  targetAudience: string;
  problemSolved: string;
  desiredResult: string;
  keyAdvantage: string;
  biggestBarrier: string;
  assurance: string;
  keyPhrases: string[];
  customerQuotes: string[];
}

/**
 * Process a customer call transcript to extract relevant information for the offer
 */
export async function processTranscript(transcriptText: string): Promise<TranscriptData> {
  try {
    // Truncate the transcript if it's too long
    const maxLength = 15000; // Adjust based on token limits
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;
    
    const response = await handleOpenAIRequest(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing customer call transcripts to extract key information for creating compelling offers. 
            Extract the following information from the transcript:
            1. Target Audience: Who is the ideal customer based on the conversation?
            2. Problem Solved: What key problem does the customer have that the product/service solves?
            3. Desired Result: What is the #1 outcome the customer wants to achieve?
            4. Key Advantage: What unique advantage or approach does the product/service offer?
            5. Biggest Barrier: What objection or concern does the customer express?
            6. Assurance: What guarantee or risk reversal could address the customer's concerns?
            7. Key Phrases: Extract 5-10 verbatim phrases the customer uses that reveal their needs/desires
            8. Customer Quotes: Extract 3-5 powerful direct quotes that could be used as testimonials
            
            Format your response as a JSON object with these fields.`
          },
          {
            role: "user",
            content: `Here is the customer call transcript to analyze:\n\n${truncatedText}`
          }
        ],
        response_format: { type: "json_object" }
      })
    );
    
    // Parse the JSON response
    const content = response.choices[0]?.message?.content || '';
    const parsedData = JSON.parse(content) as TranscriptData;
    
    return {
      targetAudience: parsedData.targetAudience || '',
      problemSolved: parsedData.problemSolved || '',
      desiredResult: parsedData.desiredResult || '',
      keyAdvantage: parsedData.keyAdvantage || '',
      biggestBarrier: parsedData.biggestBarrier || '',
      assurance: parsedData.assurance || '',
      keyPhrases: Array.isArray(parsedData.keyPhrases) ? parsedData.keyPhrases : [],
      customerQuotes: Array.isArray(parsedData.customerQuotes) ? parsedData.customerQuotes : []
    };
  } catch (error) {
    console.error('Error processing transcript:', error);
    throw new Error('Failed to process transcript');
  }
}
