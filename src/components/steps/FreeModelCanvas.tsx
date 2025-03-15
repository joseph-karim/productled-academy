import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { 
  HelpCircle, 
  Download, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Rocket, 
  Target, 
  ArrowUpRight, 
  BrainCircuit, 
  Calculator, 
  Lightbulb,
  Trash2,
  Plus
} from 'lucide-react';
import type { UserJourney } from '../../types';

export function FreeModelCanvas() {
  const store = useFormStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // Filter beginner challenges and solutions
  const beginnerChallenges = store.challenges.filter(c => c.level === 'beginner');
  const beginnerSolutions = store.solutions.filter(s => 
    beginnerChallenges.some(c => c.id === s.challengeId)
  );

  // Update the initial user journey with meaningful defaults
  const userJourney = React.useMemo(() => {
    const firstChallenge = store.challenges[0];
    const firstSolution = store.solutions.find(s => s.challengeId === firstChallenge?.id);

    return {
      discovery: {
        problem: store.productDescription.split('.')[0] || 'Enter core problem',
        trigger: firstChallenge?.title || 'Enter trigger event',
        initialThought: "Understanding the solution's potential"
      },
      signup: {
        friction: store.selectedModel === 'free-trial' ? 'Credit card required' : 
                 'No credit card required',
        timeToValue: '< 5 minutes',
        guidance: ['Quick onboarding tour', 'Interactive tutorial', 'Setup checklist']
      },
      activation: {
        firstWin: firstSolution?.text || 'First successful outcome',
        ahaFeature: 'Key differentiating feature',
        timeToSuccess: '< 30 minutes'
      },
      engagement: {
        coreTasks: ['Basic workflow completion', 'Data import/export', 'Configuration setup'],
        collaboration: ['Share results', 'Team invites', 'Basic permissions'],
        limitations: ['Limited storage', 'Basic features only', 'Standard support']
      },
      conversion: {
        triggers: [
          'Usage limit reached',
          'Team collaboration needed',
          'Advanced features required',
          'Scale operations'
        ],
        nextFeatures: [
          'Advanced automation',
          'Custom integrations',
          'Enterprise controls',
          'Priority support'
        ]
      }
    };
  }, [store.productDescription, store.selectedModel, store.challenges, store.solutions]);

  // State for editable content
  const [editableContent, setEditableContent] = useState<{
    journey: UserJourney;
    callToAction: string;
  }>({
    journey: store.userJourney || userJourney,
    callToAction: store.callToAction || getInitialCallToAction(store.selectedModel)
  });

  // Update editable content when userJourney changes
  useEffect(() => {
    if (store.userJourney) {
      setEditableContent(prev => ({
        ...prev,
        journey: store.userJourney
      }));
    } else {
      setEditableContent(prev => ({
        ...prev,
        journey: userJourney
      }));
    }
  }, [store.userJourney, userJourney]);

  // Get initial call-to-action based on model
  function getInitialCallToAction(model: string | null): string {
    if (!model) return 'Get Started For Free';
    
    switch (model) {
      case 'freemium':
        return 'Get Started For Free';
      case 'free-trial':
        return 'Start Your 14-Day Free Trial';
      case 'open-core':
        return 'Try Our Open Source Version';
      case 'community':
        return 'Join For Free';
      default:
        return 'Get Started For Free';
    }
  }

  // Handle journey section updates
  const handleJourneyUpdate = (
    section: keyof UserJourney,
    field: string,
    value: string | string[]
  ) => {
    const updatedJourney = {
      ...editableContent.journey,
      [section]: {
        ...editableContent.journey[section],
        [field]: value
      }
    };

    setEditableContent(prev => ({
      ...prev,
      journey: updatedJourney
    }));

    store.setUserJourney(updatedJourney);
  };

  // Handle array field updates
  const handleArrayUpdate = (
    section: keyof UserJourney,
    field: string,
    index: number,
    value: string
  ) => {
    const currentArray = [...(editableContent.journey[section][field] as string[])];
    currentArray[index] = value;

    handleJourneyUpdate(section, field, currentArray);
  };

  // Handle adding new array items
  const handleAddArrayItem = (section: keyof UserJourney, field: string) => {
    const currentArray = [...(editableContent.journey[section][field] as string[])];
    currentArray.push('');
    handleJourneyUpdate(section, field, currentArray);
  };

  // Handle removing array items
  const handleRemoveArrayItem = (section: keyof UserJourney, field: string, index: number) => {
    const currentArray = [...(editableContent.journey[section][field] as string[])];
    currentArray.splice(index, 1);
    handleJourneyUpdate(section, field, currentArray);
  };

  // Handle call-to-action updates
  const handleCallToActionUpdate = (value: string) => {
    setEditableContent(prev => ({
      ...prev,
      callToAction: value
    }));
    store.setCallToAction(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Free Model Canvas</h2>
          <p className="text-gray-400 mt-1">
            A comprehensive overview of your product-led growth strategy.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title={showGuidance ? "Hide guidance" : "Show guidance"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.print()}
            className="text-[#FFD23F] hover:text-[#FFD23F]/80"
            title="Print Canvas"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGuidance && (
        <div className="description-framework">
          <div>
            <h3 className="framework-heading">Canvas Guide</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-white font-medium">Purpose</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Map the complete user journey</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Identify key conversion moments</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Align features with user needs</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Plan natural upgrade paths</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium">Best Practices</h4>
                <ul className="space-y-2">
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Focus on quick time-to-value</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Remove friction points</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Guide users to success</span>
                  </li>
                  <li className="framework-list-item">
                    <span className="framework-bullet" />
                    <span>Create clear upgrade triggers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg shadow-lg">
        <div className="p-6 space-y-8 overflow-hidden">
          {/* Beginner Journey Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <Target className="w-5 h-5" />
              <h3 className="font-medium">Beginner User Journey</h3>
            </div>
            
            {/* Challenges and Solutions */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {beginnerChallenges.length > 0 ? (
                beginnerChallenges.map((challenge, index) => (
                  <div key={challenge.id} className="bg-[#1C1C1C] rounded-lg p-4">
                    {/* Challenge */}
                    <div className="mb-4">
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#333333] text-[#FFD23F] text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="overflow-hidden">
                          <h4 className="font-medium text-white text-ellipsis overflow-hidden">{challenge.title}</h4>
                          {challenge.description && (
                            <p className="mt-1 text-sm text-gray-400 line-clamp-2">{challenge.description}</p>
                          )}
                          <div className="mt-2 text-sm text-gray-400">
                            Magnitude: {challenge.magnitude}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Solutions */}
                    <div className="ml-9 space-y-3">
                      <h5 className="text-sm font-medium text-[#FFD23F]">Solutions</h5>
                      {beginnerSolutions
                        .filter(s => s.challengeId === challenge.id)
                        .map((solution) => (
                          <div key={solution.id} className="bg-[#2A2A2A] p-3 rounded-lg">
                            <p className="text-white mb-2 line-clamp-2">{solution.text}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full capitalize truncate
                                ${solution.type === 'product' ? 'bg-[#333333] text-[#FFD23F] border border-[#FFD23F]' : 
                                  solution.type === 'resource' ? 'bg-[#333333] text-purple-400 border border-purple-400' : 
                                  'bg-[#333333] text-green-400 border border-green-400'}`}>
                                {solution.type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full capitalize truncate
                                ${solution.cost === 'low' ? 'bg-[#333333] text-green-400 border border-green-400' :
                                  solution.cost === 'medium' ? 'bg-[#333333] text-[#FFD23F] border border-[#FFD23F]' :
                                  'bg-[#333333] text-red-400 border border-red-400'}`}>
                                {solution.cost} cost
                              </span>
                            </div>
                          </div>
                      ))}
                      {beginnerSolutions.filter(s => s.challengeId === challenge.id).length === 0 && (
                        <p className="text-gray-500 text-sm">No solutions defined for this challenge</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#1C1C1C] rounded-lg p-6 text-center">
                  <p className="text-gray-400">No beginner challenges defined yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Journey Map */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <Users className="w-5 h-5" />
              <h3 className="font-medium">Customer Journey</h3>
            </div>
            
            {/* Journey Grid - Two Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Row */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-white font-medium flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#FFD23F]" />
                  <span>Discovery</span>
                </h4>
                <div className="space-y-4 overflow-hidden">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Problem</label>
                    <input
                      type="text"
                      value={editableContent.journey.discovery.problem}
                      onChange={(e) => handleJourneyUpdate('discovery', 'problem', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Core problem to solve..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Trigger</label>
                    <input
                      type="text"
                      value={editableContent.journey.discovery.trigger}
                      onChange={(e) => handleJourneyUpdate('discovery', 'trigger', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="What triggers the search..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Initial Thought</label>
                    <input
                      type="text"
                      value={editableContent.journey.discovery.initialThought}
                      onChange={(e) => handleJourneyUpdate('discovery', 'initialThought', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="User's first reaction..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-white font-medium flex items-center space-x-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-[#FFD23F]" />
                  <span>Sign Up</span>
                </h4>
                <div className="space-y-4 overflow-hidden">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Friction</label>
                    <input
                      type="text"
                      value={editableContent.journey.signup.friction}
                      onChange={(e) => handleJourneyUpdate('signup', 'friction', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Signup barriers..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time to Value</label>
                    <input
                      type="text"
                      value={editableContent.journey.signup.timeToValue}
                      onChange={(e) => handleJourneyUpdate('signup', 'timeToValue', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Time to first value..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Guidance</label>
                    <div className="max-h-[180px] overflow-y-auto pr-1">
                      {editableContent.journey.signup.guidance.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayUpdate('signup', 'guidance', index, e.target.value)}
                            className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            placeholder="Enter guidance step..."
                          />
                          <button
                            onClick={() => handleRemoveArrayItem('signup', 'guidance', index)}
                            className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddArrayItem('signup', 'guidance')}
                      className="mt-2 text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Guidance
                    </button>
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-white font-medium flex items-center space-x-2 mb-3">
                  <Rocket className="w-4 h-4 text-[#FFD23F]" />
                  <span>Activation</span>
                </h4>
                <div className="space-y-4 overflow-hidden">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">First Win</label>
                    <input
                      type="text"
                      value={editableContent.journey.activation.firstWin}
                      onChange={(e) => handleJourneyUpdate('activation', 'firstWin', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="First success moment..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">"Aha" Feature</label>
                    <input
                      type="text"
                      value={editableContent.journey.activation.ahaFeature}
                      onChange={(e) => handleJourneyUpdate('activation', 'ahaFeature', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Key differentiating feature..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time to Success</label>
                    <input
                      type="text"
                      value={editableContent.journey.activation.timeToSuccess}
                      onChange={(e) => handleJourneyUpdate('activation', 'timeToSuccess', e.target.value)}
                      className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Time to achieve success..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-white font-medium flex items-center space-x-2 mb-3">
                  <ArrowUpRight className="w-4 h-4 text-[#FFD23F]" />
                  <span>Conversion</span>
                </h4>
                <div className="space-y-4 overflow-hidden">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Triggers</label>
                    <div className="max-h-[120px] overflow-y-auto pr-1">
                      {editableContent.journey.conversion.triggers.map((trigger, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={trigger}
                            onChange={(e) => handleArrayUpdate('conversion', 'triggers', index, e.target.value)}
                            className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            placeholder="Enter trigger..."
                          />
                          <button
                            onClick={() => handleRemoveArrayItem('conversion', 'triggers', index)}
                            className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddArrayItem('conversion', 'triggers')}
                      className="mt-1 text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Trigger
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Next Features</label>
                    <div className="max-h-[120px] overflow-y-auto pr-1">
                      {editableContent.journey.conversion.nextFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleArrayUpdate('conversion', 'nextFeatures', index, e.target.value)}
                            className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                            placeholder="Enter next feature..."
                          />
                          <button
                            onClick={() => handleRemoveArrayItem('conversion', 'nextFeatures', index)}
                            className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddArrayItem('conversion', 'nextFeatures')}
                      className="mt-1 text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Feature
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Section - Full Width */}
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              <h4 className="text-white font-medium flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-[#FFD23F]" />
                <span>Engagement</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Core Tasks */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Core Tasks</label>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    {editableContent.journey.engagement.coreTasks.map((task, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleArrayUpdate('engagement', 'coreTasks', index, e.target.value)}
                          className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                          placeholder="Enter core task..."
                        />
                        <button
                          onClick={() => handleRemoveArrayItem('engagement', 'coreTasks', index)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddArrayItem('engagement', 'coreTasks')}
                    className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Core Task
                  </button>
                </div>

                {/* Collaboration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Collaboration</label>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    {editableContent.journey.engagement.collaboration.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayUpdate('engagement', 'collaboration', index, e.target.value)}
                          className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                          placeholder="Enter collaboration item..."
                        />
                        <button
                          onClick={() => handleRemoveArrayItem('engagement', 'collaboration', index)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddArrayItem('engagement', 'collaboration')}
                    className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Collaboration
                  </button>
                </div>

                {/* Limitations */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Limitations</label>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    {editableContent.journey.engagement.limitations.map((limit, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={limit}
                          onChange={(e) => handleArrayUpdate('engagement', 'limitations', index, e.target.value)}
                          className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                          placeholder="Enter limitation..."
                        />
                        <button
                          onClick={() => handleRemoveArrayItem('engagement', 'limitations', index)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-[#333333]"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddArrayItem('engagement', 'limitations')}
                    className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Limitation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Model and Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-medium">Selected Model</h3>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="font-medium text-white capitalize mb-2">
                  {store.selectedModel?.replace('-', ' ') || 'No model selected'}
                </h4>
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {store.selectedModel === 'freemium' && 'Permanent free tier with limited features and clear upgrade paths. Best for products with network effects and low marginal cost per user.'}
                  {store.selectedModel === 'free-trial' && 'Time-limited access without requiring credit card information. Best for products that deliver value quickly and need maximum trial signups.'}
                  {store.selectedModel === 'open-core' && 'Basic features open source, enterprise features paid. Best for developer tools and technical platforms.'}
                  {store.selectedModel === 'community' && 'Free for individuals, paid for teams/organizations. Best for collaboration tools and knowledge platforms.'}
                  {!store.selectedModel && 'Please select a model in the Model Selection step.'}
                </p>
                <div className="space-y-2 overflow-y-auto max-h-[120px]">
                  <h5 className="text-sm font-medium text-[#FFD23F]">Key Considerations:</h5>
                  <ul className="space-y-1">
                    {store.selectedModel === 'freemium' && (
                      <>
                        <li className="text-gray-400">• Risk of giving too much value</li>
                        <li className="text-gray-400">• Needs significant scale</li>
                        <li className="text-gray-400">• Feature balance critical</li>
                        <li className="text-gray-400">• Resource consumption by free users</li>
                      </>
                    )}
                    {store.selectedModel === 'free-trial' && (
                      <>
                        <li className="text-gray-400">• May attract less qualified users</li>
                        <li className="text-gray-400">• Lower conversion rates</li>
                        <li className="text-gray-400">• Time-to-value must fit trial period</li>
                        <li className="text-gray-400">• Requires strong onboarding</li>
                      </>
                    )}
                    {store.selectedModel === 'open-core' && (
                      <>
                        <li className="text-gray-400">• Balancing open vs. paid features</li>
                        <li className="text-gray-400">• Community management needs</li>
                        <li className="text-gray-400">• Technical user focus</li>
                        <li className="text-gray-400">• Enterprise sales capability required</li>
                      </>
                    )}
                    {store.selectedModel === 'community' && (
                      <>
                        <li className="text-gray-400">• Team vs. individual value prop</li>
                        <li className="text-gray-400">• Network effects critical</li>
                        <li className="text-gray-400">• Collaboration features needed</li>
                        <li className="text-gray-400">• Balance sharing vs. premium features</li>
                      </>
                    )}
                    {(!store.selectedModel) && (
                      <li className="text-gray-400">• Please select a model to see considerations</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#FFD23F]">
                <Calculator className="w-5 h-5" />
                <h3 className="font-medium">Free Quantity Guidelines</h3>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Recommended Limits:</h4>
                <ul className="space-y-2 overflow-y-auto max-h-[160px]">
                  {store.selectedModel === 'freemium' && (
                    <>
                      <li className="text-gray-400">• Core features: Unlimited time</li>
                      <li className="text-gray-400">• Users: 3-5 per workspace</li>
                      <li className="text-gray-400">• Storage: 250MB - 1GB</li>
                      <li className="text-gray-400">• Usage: Basic rate limits</li>
                    </>
                  )}
                  {store.selectedModel === 'free-trial' && (
                    <>
                      <li className="text-gray-400">• Duration: 14-30 days</li>
                      <li className="text-gray-400">• Features: Full access</li>
                      <li className="text-gray-400">• Users: Unrestricted during trial</li>
                      <li className="text-gray-400">• Support: Basic during trial</li>
                    </>
                  )}
                  {store.selectedModel === 'open-core' && (
                    <>
                      <li className="text-gray-400">• Core features: Unlimited, open-source</li>
                      <li className="text-gray-400">• Enterprise features: Paid only</li>
                      <li className="text-gray-400">• Support: Community</li>
                      <li className="text-gray-400">• Security features: Basic only</li>
                    </>
                  )}
                  {store.selectedModel === 'community' && (
                    <>
                      <li className="text-gray-400">• Individual use: Unlimited</li>
                      <li className="text-gray-400">• Team size: 1 person free</li>
                      <li className="text-gray-400">• Sharing: Basic capabilities</li>
                      <li className="text-gray-400">• Collaboration: Limited features</li>
                    </>
                  )}
                  {(!store.selectedModel) && (
                    <li className="text-gray-400">• Please select a model to see recommended limits</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t border-[#333333] pt-6">
            <div className="flex items-center space-x-2 text-[#FFD23F] mb-2">
              <h3 className="font-medium">Call-to-Action</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              <input
                type="text"
                value={editableContent.callToAction}
                onChange={(e) => handleCallToActionUpdate(e.target.value)}
                className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                placeholder="Enter call-to-action text..."
              />
              <p className="mt-2 text-sm text-gray-400">
                Primary action button for website and marketing materials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}