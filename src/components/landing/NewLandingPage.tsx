import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  User, 
  Box, 
  Zap, 
  BarChart, 
  Activity, 
  Users,
  X
} from 'lucide-react';
import { CircularStageIndicator } from './CircularStageIndicator';

// Define types inline to avoid import issues
interface StageComponent {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
}

interface StageTestimonial {
  text: string;
  author: string;
  title: string;
}

interface Stage {
  stage: number;
  title: string;
  description: string;
  components: StageComponent[];
  centerText: string;
  testimonial: StageTestimonial;
}

// Data for the stages
const stages: Stage[] = [
  {
    stage: 1,
    title: 'Build an Unshakeable Foundation',
    description:
      'The goal is to transform your business from "scattered" to "streamlined." You\'ll achieve that by rolling out these three components:',
    components: [
      { id: 1, name: 'Crafting a Winning Strategy', icon: Target },
      { id: 2, name: 'Identifying Your Ideal User', icon: User },
      { id: 3, name: 'Designing an Intentional Model', icon: Box },
    ],
    centerText: 'UNSHAKEABLE FOUNDATION',
    testimonial: {
      text: 'Implementing the ProductLed System has been a game-changer for Groove.',
      author: 'Alex Turnbull',
      title: 'CEO and Founder of GrooveHQ',
    },
  },
  {
    stage: 2,
    title: 'Unlock Self-Serve Customers',
    description:
      'The goal is to go from "high-touch" to "zero-touch" customers. This gives your business enormous leverage to scale—you don\'t have to hand-hold each user. These three components help you unlock self-serve customers:',
    components: [
      { id: 4, name: 'Building an Irresistible Offer', icon: Zap },
      { id: 5, name: 'Designing Frictionless Onboarding', icon: User },
      { id: 6, name: 'Unlocking Powerful Pricing', icon: BarChart },
    ],
    centerText: 'ZERO-TOUCH CUSTOMERS',
    testimonial: {
      text: 'Wes\' no BS approach to scaling a product-led business works—it helped us double our paying customers using the same marketing efforts.',
      author: 'Will Royall',
      title: 'Founder and CEO at PromoTix',
    },
  },
  {
    stage: 3,
    title: 'Ignite Exponential Expansion',
    description:
      'The goal is to transform your business from "linear" to "leveraged" growth. It\'s all about structuring your team and processes to 10x their impact. You\'ll achieve that by rolling out these three components:',
    components: [
      { id: 7, name: 'Access Actionable Data', icon: BarChart },
      { id: 8, name: 'Adopt a Growth Process', icon: Activity },
      { id: 9, name: 'Build an Elite Team', icon: Users },
    ],
    centerText: 'EXPONENTIAL EXPANSION',
    testimonial: {
      text: 'We took Userflow from $0 to $5M ARR with just three employees. This book is the go-to manual for building a successful product-led business like ours.',
      author: 'Esben Friis-Jensen',
      title: 'Co-Founder of Userflow',
    },
  },
];

export function NewLandingPage() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const currentStage = stages[currentStageIndex];

  const goToNextStage = () => {
    setCurrentStageIndex((prevIndex) => (prevIndex + 1) % stages.length);
  };

  const goToPrevStage = () => {
    setCurrentStageIndex((prevIndex) => (prevIndex - 1 + stages.length) % stages.length);
  };

  // Calculate which stages to show in the diagram
  const prevStageIndex = (currentStageIndex - 1 + stages.length) % stages.length;
  const nextStageIndex = (currentStageIndex + 1) % stages.length;

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white overflow-hidden">
      {/* Optional: Top Banner */}
      <div className="bg-[#FFD23F] text-[#1C1C1C] text-center py-2 px-4 text-sm font-semibold relative">
        We're Hiring PLG Implementers! Apply Now
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black">
          <X size={16} />
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: Text Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="text-sm font-semibold text-[#FFD23F] mb-2">Stage {currentStage.stage}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">{currentStage.title}</h1>
          <p className="text-lg text-gray-300 mb-6">{currentStage.description}</p>
          <ul className="space-y-3 mb-8 text-left">
            {currentStage.components.map((component, index) => (
              <li key={component.id} className="text-lg text-[#FFD23F] font-medium flex items-start">
                <span className="font-bold mr-2">{index + 1}.</span> {component.name}
              </li>
            ))}
          </ul>
          
          {/* Testimonial */}
          <div className="mt-8 border-l-4 border-[#FFD23F] pl-4 italic text-gray-300">
            <p className="mb-2">"{currentStage.testimonial.text}"</p>
            <p className="text-sm not-italic font-semibold">– {currentStage.testimonial.author}, {currentStage.testimonial.title}</p>
          </div>

          {/* CTA - Linking to model analyzer */}
          <Link
            to="/model"
            className="mt-10 inline-flex items-center px-6 py-3 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
          >
            Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Right Side: Circular Diagram */}
        <CircularStageIndicator 
          currentStage={currentStage}
          currentStageIndex={currentStageIndex}
          prevStageIndex={prevStageIndex}
          nextStageIndex={nextStageIndex}
          goToPrevStage={goToPrevStage}
          goToNextStage={goToNextStage}
          stages={stages}
        />
      </div>
      
      {/* Companies/Partners Section */}
      <div className="bg-[#2A2A2A] py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 mb-8">Featured Success Stories From</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* These would be replaced with actual logos */}
            <div className="text-gray-300 opacity-50 hover:opacity-100 transition-opacity">UserFlow</div>
            <div className="text-gray-300 opacity-50 hover:opacity-100 transition-opacity">GrooveHQ</div>
            <div className="text-gray-300 opacity-50 hover:opacity-100 transition-opacity">PromoTix</div>
            <div className="text-gray-300 opacity-50 hover:opacity-100 transition-opacity">Figma</div>
            <div className="text-gray-300 opacity-50 hover:opacity-100 transition-opacity">ConvertKit</div>
          </div>
        </div>
      </div>
    </div>
  );
} 