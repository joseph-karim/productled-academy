import { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { StarIcon } from 'lucide-react';
import { ContextGatheringForm } from './ContextGatheringForm';
import { ContextReview } from './ContextReview';

export function OfferIntro() {
  const { offerRating, setOfferRating } = useOfferStore();
  const [currentView, setCurrentView] = useState<'contextGathering' | 'contextReview' | 'offerRating'>('contextGathering');
  
  return (
    <div className="space-y-8">
      {currentView === 'contextGathering' && (
        <ContextGatheringForm onNext={() => setCurrentView('contextReview')} />
      )}
      
      {currentView === 'contextReview' && (
        <ContextReview 
          onEdit={() => setCurrentView('contextGathering')}
          onConfirm={() => setCurrentView('offerRating')}
        />
      )}
      
      {currentView === 'offerRating' && (
        <>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Irresistible Offer Builder</h2>
            <p className="text-gray-300 mb-4">
              Your offer is the heart of your product-led growth strategy. It's how you communicate value to potential users 
              and convince them to take action. This builder will guide you through creating an offer that converts 
              users and drives growth.
            </p>
            <p className="text-gray-300">
              Before we begin building your irresistible offer, let's assess where you are today.
            </p>
          </div>

          <div className="bg-[#222222] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Rate Your Current Offer</h3>
            <p className="text-gray-300 mb-6">
              How effective do you think your current offer is at converting visitors to users?
            </p>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setOfferRating(rating)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`w-10 h-10 ${
                        rating <= (offerRating || 0)
                          ? 'text-[#FFD23F] fill-[#FFD23F]'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between w-full max-w-md text-sm text-gray-400">
                <span>Very ineffective</span>
                <span>Very effective</span>
              </div>
              
              {offerRating && (
                <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg w-full">
                  <h4 className="text-white font-medium mb-2">
                    {offerRating <= 2
                      ? "There's room for major improvement"
                      : offerRating === 3
                      ? "You're on the right track"
                      : "Your offer is already strong"}
                  </h4>
                  <p className="text-gray-300">
                    {offerRating <= 2
                      ? "Don't worry! By the end of this process, you'll have a much more compelling offer that resonates with your users."
                      : offerRating === 3
                      ? "You have some elements working already. This process will help you refine and strengthen your offer even further."
                      : "Great! Let's analyze what's working well and see how we can make your offer even more irresistible."}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#222222] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">What You'll Create</h3>
            <p className="text-gray-300 mb-4">
              By the end of this process, you will have:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>A clear understanding of your users' success metrics</li>
              <li>A defined value proposition that addresses user challenges</li>
              <li>Risk-reversals to overcome user hesitation</li>
              <li>A complete landing page framework with headlines, copy, and CTAs</li>
              <li>Optimization strategies to continuously improve conversion</li>
            </ul>
          </div>
          
          <div className="flex justify-start mt-6">
            <button
              onClick={() => setCurrentView('contextReview')}
              className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Back to Context Review
            </button>
          </div>
        </>
      )}
    </div>
  );
}    