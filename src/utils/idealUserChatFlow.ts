import type { IdealUser } from '../types';

export interface ChatResponse {
  problemStatement?: string;
  userSituation?: string;
  successPatterns?: string;
  decisionMakerInfo?: string;
  technicalContext?: string;
  urgencyContext?: string;
  businessImpact?: string;
  keyTraits?: string[];
  technicalLevel?: 'Low' | 'Medium' | 'High';
  motivationLevel?: 'Low' | 'Medium' | 'High';
}

export interface ChatQuestion {
  id: string;
  message: string;
  responseAnalysis: (response: string) => {
    nextQuestion: string | null;
    [key: string]: any;
  };
}

export const idealUserChatFlow: ChatQuestion[] = [
  {
    id: "problem_exploration",
    message: "Let's identify who would get the most value from your product. What specific problem does your product solve better than existing alternatives?",
    responseAnalysis: (response) => ({
      problemStatement: response,
      nextQuestion: "user_situation"
    })
  },
  {
    id: "user_situation",
    message: "Think about a situation where someone would be incredibly grateful to have your product. What would they be trying to accomplish? What would be frustrating them?",
    responseAnalysis: (response) => ({
      userSituation: response,
      nextQuestion: "success_stories"
    })
  },
  {
    id: "success_stories",
    message: "If you have any current users or customers, tell me about 1-2 who've gotten the most value from your product. What makes them successful with it?",
    responseAnalysis: (response) => ({
      successPatterns: response,
      nextQuestion: "decision_maker"
    })
  },
  {
    id: "decision_maker",
    message: "Who typically makes the decision to use or purchase your product? Are they the same person who uses it day-to-day?",
    responseAnalysis: (response) => ({
      decisionMakerInfo: response,
      nextQuestion: "technical_context"
    })
  },
  {
    id: "technical_context",
    message: "How technically sophisticated does someone need to be to get value from your product? Do they need special knowledge or skills?",
    responseAnalysis: (response) => {
      let technicalLevel: 'Low' | 'Medium' | 'High' = "Medium";
      if (response.toLowerCase().includes("simple") || 
          response.toLowerCase().includes("easy") ||
          response.toLowerCase().includes("no technical")) {
        technicalLevel = "Low";
      } else if (response.toLowerCase().includes("advanced") ||
                response.toLowerCase().includes("technical") ||
                response.toLowerCase().includes("developer") ||
                response.toLowerCase().includes("engineer")) {
        technicalLevel = "High";
      }
      
      return {
        technicalContext: response,
        technicalLevel,
        nextQuestion: "urgency"
      };
    }
  },
  {
    id: "urgency",
    message: "How urgent is the problem you're solving? Is it something users actively search for solutions to, or more of a 'nice to have'?",
    responseAnalysis: (response) => {
      let motivationLevel: 'Low' | 'Medium' | 'High' = "Medium";
      if (response.toLowerCase().includes("nice to have") || 
          response.toLowerCase().includes("not urgent") ||
          response.toLowerCase().includes("exploring")) {
        motivationLevel = "Low";
      } else if (response.toLowerCase().includes("urgent") ||
                response.toLowerCase().includes("critical") ||
                response.toLowerCase().includes("immediate") ||
                response.toLowerCase().includes("pressing")) {
        motivationLevel = "High";
      }
      
      return {
        urgencyContext: response,
        motivationLevel,
        nextQuestion: "business_impact"
      };
    }
  },
  {
    id: "business_impact",
    message: "What measurable impact does your product have on a user's business? Think about time saved, revenue increased, costs reduced, etc.",
    responseAnalysis: (response) => ({
      businessImpact: response,
      nextQuestion: "distinguish_traits"
    })
  },
  {
    id: "distinguish_traits",
    message: "What 3-5 characteristics distinguish your ideal users from people who wouldn't get as much value from your product?",
    responseAnalysis: (response) => ({
      keyTraits: response.split(/[,.;\n]/)
        .map(trait => trait.trim())
        .filter(trait => trait.length > 0)
        .slice(0, 5),
      nextQuestion: null
    })
  }
];

export function synthesizeIdealUserProfile(chatResponses: ChatResponse): IdealUser {
  // Generate role/title
  let title = ""; 
  if (chatResponses.decisionMakerInfo) {
    const roleKeywords = ["manager", "director", "lead", "head", "specialist", "coordinator"];
    const words = chatResponses.decisionMakerInfo.split(" ");
    for (let i = 0; i < words.length - 1; i++) {
      if (roleKeywords.some(keyword => words[i+1].toLowerCase().includes(keyword))) {
        title = `${words[i]} ${words[i+1]}`;
        break;
      }
    }
  }
  
  // If no role extracted, generate from problem statement
  if (!title && chatResponses.problemStatement) {
    title = "Team Lead dealing with " + 
      chatResponses.problemStatement.split(" ").slice(0, 3).join(" ");
  }
  
  // Generate description
  const description = `A professional who ${chatResponses.problemStatement ? 
    "struggles with " + chatResponses.problemStatement.split(".")[0] : ""} and ${
    chatResponses.userSituation ? 
    "needs " + chatResponses.userSituation.split(".")[0] : "seeks efficiency improvements"}.`;
  
  return {
    title,
    description,
    impact: chatResponses.businessImpact || "",
    motivation: chatResponses.motivationLevel || "Medium",
    ability: chatResponses.technicalLevel || "Medium",
    traits: chatResponses.keyTraits || []
  };
}