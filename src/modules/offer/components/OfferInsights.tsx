import React, { useEffect, useState } from 'react';
import { CoreOfferNucleus } from '../store/offerStore';
import { Star, StarHalf } from 'lucide-react';

interface OfferInsightsProps {
  currentOffer: CoreOfferNucleus;
  websiteOffer: CoreOfferNucleus;
}

interface OfferRating {
  dimension: keyof CoreOfferNucleus;
  label: string;
  websiteRating: number;
  currentRating: number;
  explanation: string;
}

export function OfferInsights({ currentOffer, websiteOffer }: OfferInsightsProps) {
  const [ratings, setRatings] = useState<OfferRating[]>([]);
  
  useEffect(() => {
    // Generate ratings and explanations
    const generatedRatings = generateRatings(currentOffer, websiteOffer);
    setRatings(generatedRatings);
  }, [currentOffer, websiteOffer]);
  
  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div key={rating.dimension} className="bg-[#1C1C1C] p-3 rounded-lg border border-[#333]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-white">{rating.label}</h4>
            <div className="flex items-center space-x-1">
              <div className="flex mr-2">
                {renderStars(rating.websiteRating)}
              </div>
              <span className="text-xs text-gray-400">Website</span>
              <span className="text-xs text-gray-400 mx-1">→</span>
              <div className="flex mr-2">
                {renderStars(rating.currentRating)}
              </div>
              <span className="text-xs text-gray-400">Current</span>
            </div>
          </div>
          <p className="text-sm text-gray-300">{rating.explanation}</p>
        </div>
      ))}
      
      <div className="bg-[#273B33] p-3 rounded-lg border border-green-600">
        <p className="text-sm text-gray-200">
          {getOverallFeedback(ratings)}
        </p>
      </div>
    </div>
  );
}

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-[#FFD23F] fill-[#FFD23F]" />);
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="w-4 h-4 text-[#FFD23F] fill-[#FFD23F]" />);
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-500" />);
  }
  
  return stars;
}

function generateRatings(currentOffer: CoreOfferNucleus, websiteOffer: CoreOfferNucleus): OfferRating[] {
  const ratings: OfferRating[] = [];
  
  // Target Audience
  const targetAudienceWebsiteRating = rateTargetAudience(websiteOffer.targetAudience);
  const targetAudienceCurrentRating = rateTargetAudience(currentOffer.targetAudience);
  ratings.push({
    dimension: 'targetAudience',
    label: 'Target Audience',
    websiteRating: targetAudienceWebsiteRating,
    currentRating: targetAudienceCurrentRating,
    explanation: generateExplanation('targetAudience', targetAudienceWebsiteRating, targetAudienceCurrentRating, websiteOffer, currentOffer)
  });
  
  // Desired Result
  const desiredResultWebsiteRating = rateDesiredResult(websiteOffer.desiredResult);
  const desiredResultCurrentRating = rateDesiredResult(currentOffer.desiredResult);
  ratings.push({
    dimension: 'desiredResult',
    label: 'Desired Result',
    websiteRating: desiredResultWebsiteRating,
    currentRating: desiredResultCurrentRating,
    explanation: generateExplanation('desiredResult', desiredResultWebsiteRating, desiredResultCurrentRating, websiteOffer, currentOffer)
  });
  
  // Key Advantage
  const keyAdvantageWebsiteRating = rateKeyAdvantage(websiteOffer.keyAdvantage);
  const keyAdvantageCurrentRating = rateKeyAdvantage(currentOffer.keyAdvantage);
  ratings.push({
    dimension: 'keyAdvantage',
    label: 'Unique Advantage',
    websiteRating: keyAdvantageWebsiteRating,
    currentRating: keyAdvantageCurrentRating,
    explanation: generateExplanation('keyAdvantage', keyAdvantageWebsiteRating, keyAdvantageCurrentRating, websiteOffer, currentOffer)
  });
  
  // Biggest Barrier
  const biggestBarrierWebsiteRating = rateBiggestBarrier(websiteOffer.biggestBarrier);
  const biggestBarrierCurrentRating = rateBiggestBarrier(currentOffer.biggestBarrier);
  ratings.push({
    dimension: 'biggestBarrier',
    label: 'Risk/Objection',
    websiteRating: biggestBarrierWebsiteRating,
    currentRating: biggestBarrierCurrentRating,
    explanation: generateExplanation('biggestBarrier', biggestBarrierWebsiteRating, biggestBarrierCurrentRating, websiteOffer, currentOffer)
  });
  
  // Assurance
  const assuranceWebsiteRating = rateAssurance(websiteOffer.assurance);
  const assuranceCurrentRating = rateAssurance(currentOffer.assurance);
  ratings.push({
    dimension: 'assurance',
    label: 'Assurance',
    websiteRating: assuranceWebsiteRating,
    currentRating: assuranceCurrentRating,
    explanation: generateExplanation('assurance', assuranceWebsiteRating, assuranceCurrentRating, websiteOffer, currentOffer)
  });
  
  return ratings;
}

function rateTargetAudience(text: string): number {
  if (!text) return 0;
  
  let score = 0;
  
  // Length check (at least 5 words)
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 5) score += 1;
  if (words.length >= 10) score += 0.5;
  
  // Specificity check (contains specific roles, demographics, or situations)
  const specificityTerms = ['who', 'looking for', 'need', 'want', 'struggling', 'trying to'];
  if (specificityTerms.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Contains numbers or specific qualifiers
  if (/\d+/.test(text) || /\b(small|medium|large|enterprise|startup)\b/i.test(text)) score += 1;
  
  // Contains pain points or desires
  const painTerms = ['frustrated', 'struggle', 'challenge', 'problem', 'difficulty', 'want', 'need', 'desire'];
  if (painTerms.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Cap at 5
  return Math.min(5, score);
}

function rateDesiredResult(text: string): number {
  if (!text) return 0;
  
  let score = 0;
  
  // Length check
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 3) score += 1;
  if (words.length >= 7) score += 0.5;
  
  // Contains measurable outcomes
  if (/\d+%|\d+ times|\d+x|\bboost|\bincrease|\bimprove|\breduce|\bdecrease/i.test(text)) score += 1.5;
  
  // Contains timeframe
  if (/\bin \d+ (days|weeks|months|minutes|hours|seconds)\b|\binstantly\b|\bimmediately\b/i.test(text)) score += 1;
  
  // Contains transformation language
  const transformationTerms = ['transform', 'become', 'achieve', 'attain', 'gain', 'reach', 'unlock'];
  if (transformationTerms.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Cap at 5
  return Math.min(5, score);
}

function rateKeyAdvantage(text: string): number {
  if (!text) return 0;
  
  let score = 0;
  
  // Length check
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 3) score += 1;
  if (words.length >= 7) score += 0.5;
  
  // Contains uniqueness language
  const uniqueTerms = ['only', 'unique', 'proprietary', 'exclusive', 'patent', 'unlike', 'first', 'best'];
  if (uniqueTerms.some(term => text.toLowerCase().includes(term))) score += 1.5;
  
  // Contains comparison language
  if (/\b(better|faster|easier|cheaper|more|less) than\b/i.test(text)) score += 1;
  
  // Contains specific technology or methodology
  const techTerms = ['ai', 'algorithm', 'technology', 'system', 'method', 'process', 'framework', 'approach'];
  if (techTerms.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Cap at 5
  return Math.min(5, score);
}

function rateBiggestBarrier(text: string): number {
  if (!text) return 0;
  
  let score = 0;
  
  // Length check
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 3) score += 1;
  if (words.length >= 7) score += 0.5;
  
  // Contains common objection language
  const objectionTerms = ['worry', 'concern', 'risk', 'afraid', 'fear', 'expensive', 'complicated', 'difficult', 'time-consuming'];
  if (objectionTerms.some(term => text.toLowerCase().includes(term))) score += 1.5;
  
  // Contains specific objection types
  const objectionTypes = ['price', 'cost', 'time', 'effort', 'learning curve', 'technical', 'implementation', 'integration'];
  if (objectionTypes.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Contains customer perspective language
  if (/\b(you|your|they|their|customer|client)\b/i.test(text)) score += 1;
  
  // Cap at 5
  return Math.min(5, score);
}

function rateAssurance(text: string): number {
  if (!text) return 0;
  
  let score = 0;
  
  // Length check
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 3) score += 1;
  if (words.length >= 7) score += 0.5;
  
  // Contains guarantee language
  const guaranteeTerms = ['guarantee', 'promise', 'ensure', 'assure', 'warranty', 'refund', 'money back'];
  if (guaranteeTerms.some(term => text.toLowerCase().includes(term))) score += 1.5;
  
  // Contains timeframe
  if (/\b\d+ (day|week|month|year)s?\b/i.test(text)) score += 1;
  
  // Contains social proof
  const socialProofTerms = ['testimonial', 'review', 'case study', 'client', 'customer', 'success story'];
  if (socialProofTerms.some(term => text.toLowerCase().includes(term))) score += 1;
  
  // Cap at 5
  return Math.min(5, score);
}

function generateExplanation(
  dimension: keyof CoreOfferNucleus, 
  websiteRating: number, 
  currentRating: number,
  websiteOffer: CoreOfferNucleus,
  currentOffer: CoreOfferNucleus
): string {
  const improvement = currentRating - websiteRating;
  
  // If no website data, focus on current offer only
  if (websiteRating === 0) {
    return getStandaloneExplanation(dimension, currentRating);
  }
  
  // If significant improvement
  if (improvement >= 1.5) {
    return getImprovementExplanation(dimension, websiteRating, currentRating);
  }
  
  // If similar ratings
  if (Math.abs(improvement) < 1) {
    return getSimilarExplanation(dimension, websiteRating, currentRating);
  }
  
  // If website was better
  if (improvement <= -1) {
    return getDeclineExplanation(dimension, websiteRating, currentRating);
  }
  
  // Default case
  return getStandaloneExplanation(dimension, currentRating);
}

function getStandaloneExplanation(dimension: keyof CoreOfferNucleus, rating: number): string {
  if (rating <= 2) {
    switch (dimension) {
      case 'targetAudience': return "Your target audience could be more specific. Consider adding demographics, roles, or specific pain points.";
      case 'desiredResult': return "Your desired result could be more compelling. Try adding measurable outcomes or timeframes.";
      case 'keyAdvantage': return "Your advantage needs to be more unique. Highlight what makes your solution different from alternatives.";
      case 'biggestBarrier': return "The risk/objection could be more specific. What's the main concern your audience has?";
      case 'assurance': return "Your assurance could be stronger. Consider adding guarantees or social proof.";
      default: return "This element could use improvement.";
    }
  } else if (rating <= 3.5) {
    switch (dimension) {
      case 'targetAudience': return "Your target audience is fairly clear, but could benefit from more specificity.";
      case 'desiredResult': return "Your desired result is good, but adding measurable outcomes would make it stronger.";
      case 'keyAdvantage': return "Your advantage is solid, but could be more distinctive from competitors.";
      case 'biggestBarrier': return "You've identified a valid objection, but could make it more specific to your audience.";
      case 'assurance': return "Your assurance addresses the risk, but could be more concrete or compelling.";
      default: return "This element is good but has room for improvement.";
    }
  } else {
    switch (dimension) {
      case 'targetAudience': return "Your target audience is well-defined and specific. Great job!";
      case 'desiredResult': return "Your desired result is compelling, specific, and outcome-focused. Excellent!";
      case 'keyAdvantage': return "Your advantage is unique and clearly differentiates your offer. Perfect!";
      case 'biggestBarrier': return "You've identified a specific, relevant objection that resonates with your audience.";
      case 'assurance': return "Your assurance directly addresses the risk with a strong guarantee or proof. Well done!";
      default: return "This element is excellent.";
    }
  }
}

function getImprovementExplanation(dimension: keyof CoreOfferNucleus, websiteRating: number, currentRating: number): string {
  switch (dimension) {
    case 'targetAudience': return "Great improvement! Your current target audience is much more specific and focused than what was on your website.";
    case 'desiredResult': return "Significant improvement! Your current result is more compelling and outcome-focused than your website version.";
    case 'keyAdvantage': return "Much better! Your current advantage is more unique and distinctive than what was communicated on your website.";
    case 'biggestBarrier': return "Strong improvement! You've identified a more specific objection than what was addressed on your website.";
    case 'assurance': return "Excellent progress! Your current assurance is much stronger and more direct than your website version.";
    default: return "You've made significant improvements to this element.";
  }
}

function getSimilarExplanation(dimension: keyof CoreOfferNucleus, websiteRating: number, currentRating: number): string {
  if (websiteRating >= 4) {
    switch (dimension) {
      case 'targetAudience': return "Your target audience is consistent with your website and well-defined in both places.";
      case 'desiredResult': return "Your desired result is strong and consistent with what's on your website.";
      case 'keyAdvantage': return "Your advantage is consistently unique across both your website and current offer.";
      case 'biggestBarrier': return "You've maintained a clear focus on the same key objection from your website.";
      case 'assurance': return "Your assurance is consistently strong in both places.";
      default: return "This element is consistently strong.";
    }
  } else {
    switch (dimension) {
      case 'targetAudience': return "Your target audience is similar to your website version. Consider making it more specific.";
      case 'desiredResult': return "Your desired result is similar to your website. Try making it more compelling with specific outcomes.";
      case 'keyAdvantage': return "Your advantage is similar to your website. Consider highlighting what makes you truly unique.";
      case 'biggestBarrier': return "The objection is similar to your website. Try identifying the most pressing concern for your audience.";
      case 'assurance': return "Your assurance is similar to your website. Consider making it stronger with guarantees.";
      default: return "This element is similar to your website and has room for improvement.";
    }
  }
}

function getDeclineExplanation(dimension: keyof CoreOfferNucleus, websiteRating: number, currentRating: number): string {
  switch (dimension) {
    case 'targetAudience': return "Your website actually had a more specific target audience. Consider incorporating some of those elements.";
    case 'desiredResult': return "Your website communicated a stronger desired result. You might want to review and incorporate those elements.";
    case 'keyAdvantage': return "Your website highlighted a more unique advantage. Consider bringing some of those points into your current offer.";
    case 'biggestBarrier': return "Your website addressed a more specific objection. You might want to incorporate that into your current offer.";
    case 'assurance': return "Your website had a stronger assurance. Consider bringing those elements into your current offer.";
    default: return "Your website version of this element was stronger. Consider reviewing it for ideas.";
  }
}

function getOverallFeedback(ratings: OfferRating[]): string {
  const avgWebsiteRating = ratings.reduce((sum, rating) => sum + rating.websiteRating, 0) / ratings.length;
  const avgCurrentRating = ratings.reduce((sum, rating) => sum + rating.currentRating, 0) / ratings.length;
  const improvement = avgCurrentRating - avgWebsiteRating;
  
  if (improvement >= 1.5) {
    return "Overall, your current offer is significantly stronger than what was on your website. You've made excellent improvements across multiple dimensions.";
  } else if (improvement >= 0.5) {
    return "Your current offer shows good improvement over your website version. Continue refining the elements with lower ratings.";
  } else if (improvement >= -0.5) {
    return "Your current offer is similar in strength to your website. Focus on improving the lower-rated elements to make your offer more compelling.";
  } else {
    return "Your website actually communicated some elements more effectively. Consider reviewing your website content to strengthen your current offer.";
  }
}
