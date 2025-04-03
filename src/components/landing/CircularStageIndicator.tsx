import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Target, 
  User, 
  Box, 
  Zap, 
  BarChart, 
  Activity, 
  Users 
} from 'lucide-react';

// Defining types inline since there seems to be an issue with importing
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

interface CircularStageIndicatorProps {
  currentStage: Stage;
  currentStageIndex: number;
  prevStageIndex: number;
  nextStageIndex: number;
  goToPrevStage: () => void;
  goToNextStage: () => void;
  stages: Stage[];
}

export function CircularStageIndicator({
  currentStage,
  prevStageIndex,
  nextStageIndex,
  goToPrevStage,
  goToNextStage,
  stages
}: CircularStageIndicatorProps) {
  // Helper to get all components from all stages in a flat array
  const allComponents = stages.flatMap(stage => stage.components);
  
  // Only Model component (ID 3) and Offer component (ID 4) are unlocked for now
  const isUnlocked = (componentId: number) => componentId === 3 || componentId === 4;
  
  // Get route for a component
  const getRouteForComponent = (componentId: number) => {
    switch(componentId) {
      case 3: // Model
        return '/model';
      case 4: // Offer
        return '/offer';
      default:
        return '#'; // No route for locked components
    }
  };

  // Calculate positions and angles for the slices
  const getTotalSegments = () => allComponents.length;
  const getAnglePerSegment = () => 360 / getTotalSegments();

  // Update the display names to be shorter and more compact
  const getDisplayName = (name: string) => {
    // Get the most relevant word from the component name
    const parts = name.split(' ');
    return parts[parts.length - 1]; // Usually the last word is most descriptive
  };

  // Improve the glow effect for the Model and Offer components
  const getStrokeWidth = (component: StageComponent) => {
    if (component.id === 3 || component.id === 4) return 3; // Make Model and Offer component strokes thicker
    return 1;
  };

  return (
    <div className="lg:w-1/2 relative h-[400px] md:h-[500px] w-full max-w-xl mx-auto flex justify-center items-center">
      {/* Stage Indicators */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-gray-400 text-sm font-medium">
        Stage {prevStageIndex + 1}
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-gray-400 text-sm font-medium">
        Stage {nextStageIndex + 1}
      </div>

      {/* SVG for the circular layout */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="-250 -250 500 500" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background circles */}
        <circle cx="0" cy="0" r="225" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-30" />
        <circle cx="0" cy="0" r="175" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-30" />
        <circle cx="0" cy="0" r="125" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-30" />

        {/* Pie slices for components */}
        {allComponents.map((component, index) => {
          const anglePerSegment = getAnglePerSegment();
          const startAngle = (index * anglePerSegment) - 90; // Start from top, at -90 degrees
          const endAngle = startAngle + anglePerSegment;
          
          // Convert angles to radians for calculations
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          // Calculate outer arc points
          const outerRadius = 200;
          const innerRadius = 100;
          
          const outerStartX = Math.cos(startAngleRad) * outerRadius;
          const outerStartY = Math.sin(startAngleRad) * outerRadius;
          const outerEndX = Math.cos(endAngleRad) * outerRadius;
          const outerEndY = Math.sin(endAngleRad) * outerRadius;
          
          // Calculate inner arc points
          const innerStartX = Math.cos(startAngleRad) * innerRadius;
          const innerStartY = Math.sin(startAngleRad) * innerRadius;
          const innerEndX = Math.cos(endAngleRad) * innerRadius;
          const innerEndY = Math.sin(endAngleRad) * innerRadius;
          
          // Create SVG path for pie slice
          const pathData = [
            `M ${innerStartX} ${innerStartY}`, // Start at inner arc start
            `L ${outerStartX} ${outerStartY}`, // Line to outer arc start
            `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}`, // Outer arc
            `L ${innerEndX} ${innerEndY}`, // Line to inner arc end
            `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}`, // Inner arc (reverse direction)
            'Z' // Close path
          ].join(' ');
          
          // Determine if this component is unlocked
          const unlocked = isUnlocked(component.id);
          const isModelOrOffer = component.id === 3 || component.id === 4; // Check if it's Model or Offer component
          
          // Define colors and styles based on unlock status
          const fillColor = unlocked ? '#FFD23F' : '#1F2937';
          const textColor = unlocked ? '#1C1C1C' : '#9CA3AF';
          const animateClass = unlocked ? 'animate-pulse' : '';
          
          // Calculate position for icon and text
          const midAngle = (startAngle + endAngle) / 2;
          const midAngleRad = (midAngle * Math.PI) / 180;
          // Adjust radius for better spacing of components
          const iconRadius = (innerRadius + outerRadius) / 2 + 15; // Increased for better spacing
          const iconX = Math.cos(midAngleRad) * iconRadius;
          const iconY = Math.sin(midAngleRad) * iconRadius;
          
          // Get base angle in degrees normalized to 0-360
          const normalizedAngle = ((midAngle % 360) + 360) % 360;

          // A more precise way to handle flipping - directly check component IDs
          // Components 5, 6, 7, 8, 9 need special handling
          const shouldFlipText = [5, 6, 7, 8, 9].includes(component.id);

          // Hover group ID for this component
          const hoverGroupId = `hover-group-${component.id}`;

          return (
            <g key={component.id} className={animateClass} id={hoverGroupId}>
              {/* Interactive Area */}
              <Link to={unlocked ? getRouteForComponent(component.id) : '#'}>
                {/* Add filter for glow effect on Model and Offer components */}
                {isModelOrOffer && (
                  <defs>
                    <filter id={`glow-${component.id}`}>
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feFlood floodColor="#FFD23F" floodOpacity="1" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="shadow" />
                      <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                    </filter>
                  </defs>
                )}
                <path 
                  d={pathData} 
                  fill={fillColor} 
                  stroke={isModelOrOffer ? "#FFFFFF" : "#2D3748"} 
                  strokeWidth={getStrokeWidth(component)}
                  filter={isModelOrOffer ? `url(#glow-${component.id})` : ""}
                  className={`transition-all duration-200 ${unlocked ? 'cursor-pointer hover:brightness-110 hover:stroke-white' : 'opacity-80 hover:opacity-95'}`}
                  onMouseOver={() => {
                    // Show "Coming Soon" text on hover using direct DOM manipulation since SVG doesn't work well with CSS hover
                    if (!unlocked) {
                      const textEl = document.getElementById(`coming-soon-${component.id}`);
                      if (textEl) textEl.setAttribute('opacity', '1');
                    }
                  }}
                  onMouseOut={() => {
                    // Hide "Coming Soon" text when not hovering
                    if (!unlocked) {
                      const textEl = document.getElementById(`coming-soon-${component.id}`);
                      if (textEl) textEl.setAttribute('opacity', '0');
                    }
                  }}
                />
              </Link>
              
              {/* Component ID and Icon - translate to position but don't rotate */}
              <g 
                transform={`translate(${iconX}, ${iconY})`}
                className="pointer-events-none"
              >
                {/* ID number and Icon - position based on which side of the circle */}
                {shouldFlipText ? (
                  <>
                    {/* For left side components (flipped) - simplified layout */}
                    <text 
                      x="-25" 
                      y="0" 
                      fill={textColor} 
                      fontSize="14" 
                      fontWeight="bold"
                      dominantBaseline="middle"
                      textAnchor="end"
                    >
                      {component.id}
                    </text>
                    
                    <foreignObject 
                      x="-10" 
                      y="-10" 
                      width="20" 
                      height="20" 
                      className={`${!unlocked ? 'opacity-70' : ''}`}
                    >
                      <div className="h-full w-full flex items-center justify-center">
                        {React.createElement(component.icon, { 
                          color: textColor,
                          size: unlocked ? 20 : 16
                        })}
                      </div>
                    </foreignObject>
                    
                    {/* Component name with flipped positioning */}
                    <text 
                      x="0" 
                      y="-20" 
                      fill={textColor} 
                      fontSize={unlocked ? "14" : "12"}
                      fontWeight={unlocked ? "bold" : "normal"}
                      textAnchor="middle"
                    >
                      {getDisplayName(component.name)}
                    </text>
                    
                    {/* For locked components - fixed positioning to avoid overlap */}
                    {!unlocked && (
                      <>
                        <foreignObject x="15" y="-10" width="20" height="20">
                          <div className="h-full w-full flex items-center justify-center">
                            <Lock color={textColor} size={12} />
                          </div>
                        </foreignObject>
                        
                        <text 
                          id={`coming-soon-${component.id}`}
                          x="0" 
                          y="-35" 
                          fill={textColor} 
                          fontSize="9" 
                          textAnchor="middle"
                          opacity="0"
                          className="transition-opacity duration-300"
                        >
                          Coming Soon
                        </text>
                      </>
                    )}
                    
                    {/* For unlocked components */}
                    {unlocked && (
                      <text 
                        x="0" 
                        y="-38" 
                        fill={textColor} 
                        fontSize="10"
                        fontWeight="normal"
                        textAnchor="middle"
                        className="animate-pulse"
                      >
                        Click to Start
                      </text>
                    )}
                  </>
                ) : (
                  <>
                    {/* For right side components (normal) - ensured consistency */}
                    <text 
                      x="-25" 
                      y="0" 
                      fill={textColor} 
                      fontSize="14" 
                      fontWeight="bold"
                      dominantBaseline="middle"
                      textAnchor="end"
                    >
                      {component.id}
                    </text>
                    
                    <foreignObject 
                      x="-10" 
                      y="-10" 
                      width="20" 
                      height="20" 
                      className={`${!unlocked ? 'opacity-70' : ''}`}
                    >
                      <div className="h-full w-full flex items-center justify-center">
                        {React.createElement(component.icon, { 
                          color: textColor,
                          size: unlocked ? 20 : 16
                        })}
                      </div>
                    </foreignObject>
                    
                    {/* Component name */}
                    <text 
                      x="0" 
                      y="20" 
                      fill={textColor} 
                      fontSize={unlocked ? "14" : "12"}
                      fontWeight={unlocked ? "bold" : "normal"}
                      textAnchor="middle"
                    >
                      {getDisplayName(component.name)}
                    </text>
                    
                    {/* For locked components */}
                    {!unlocked && (
                      <>
                        <foreignObject x="15" y="-10" width="20" height="20">
                          <div className="h-full w-full flex items-center justify-center">
                            <Lock color={textColor} size={12} />
                          </div>
                        </foreignObject>
                        
                        <text 
                          id={`coming-soon-${component.id}`}
                          x="0" 
                          y="35" 
                          fill={textColor} 
                          fontSize="9" 
                          textAnchor="middle"
                          opacity="0"
                          className="transition-opacity duration-300"
                        >
                          Coming Soon
                        </text>
                      </>
                    )}
                    
                    {/* For unlocked components */}
                    {unlocked && (
                      <text 
                        x="0" 
                        y="38" 
                        fill={textColor} 
                        fontSize="10"
                        fontWeight="normal"
                        textAnchor="middle"
                        className="animate-pulse"
                      >
                        Click to Start
                      </text>
                    )}
                  </>
                )}
              </g>
            </g>
          );
        })}
        
        {/* Central Circle */}
        <circle cx="0" cy="0" r="75" fill="white" className="shadow-lg" />
        <text x="0" y="-25" fill="#6B7280" fontSize="10" textAnchor="middle" fontWeight="600">THE</text>
        <text x="0" y="-5" fill="#1C1C1C" fontSize="16" textAnchor="middle" fontWeight="bold">Obvious</text>
        <text x="0" y="15" fill="#1C1C1C" fontSize="16" textAnchor="middle" fontWeight="bold">Choice</text>
        <line x1="-40" y1="25" x2="40" y2="25" stroke="#FFD23F" strokeWidth="2" />
        <text x="0" y="40" fill="#1C1C1C" fontSize="8" textAnchor="middle" fontWeight="600">
          {currentStage.centerText}
        </text>
      </svg>

      {/* Navigation Arrows (outside the SVG) */}
      <button 
        onClick={goToPrevStage}
        className="absolute top-1/2 left-[-40px] transform -translate-y-1/2 text-[#FFD23F] hover:text-white transition-colors z-10"
        aria-label="Previous Stage"
      >
        <ArrowLeft className="h-8 w-8" />
      </button>
      <button 
        onClick={goToNextStage}
        className="absolute top-1/2 right-[-40px] transform -translate-y-1/2 text-[#FFD23F] hover:text-white transition-colors z-10"
        aria-label="Next Stage"
      >
        <ArrowRight className="h-8 w-8" />
      </button>
    </div>
  );
} 