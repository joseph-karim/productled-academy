import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { HelpCircle, Download } from 'lucide-react';
import type { UserJourney } from '../../types';

export function FreeModelCanvas() {
  const store = useFormStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // State for editable content
  const [editableContent, setEditableContent] = useState<{
    journey: UserJourney;
    callToAction: string;
  }>({
    journey: store.userJourney || {
      discovery: {
        problem: '',
        trigger: '',
        initialThought: ''
      },
      signup: {
        friction: '',
        timeToValue: '',
        guidance: []
      },
      activation: {
        firstWin: '',
        ahaFeature: '',
        timeToSuccess: ''
      },
      engagement: {
        coreTasks: [],
        collaboration: [],
        limitations: []
      },
      conversion: {
        triggers: [],
        nextFeatures: []
      }
    },
    callToAction: store.selectedModel ? getInitialCallToAction(store.selectedModel) : ''
  });

  // Update editable content when userJourney changes
  useEffect(() => {
    if (store.userJourney) {
      setEditableContent(prev => ({
        ...prev,
        journey: store.userJourney
      }));
    }
  }, [store.userJourney]);

  // Get initial call-to-action based on model
  function getInitialCallToAction(model: string): string {
    switch (model) {
      case 'opt-in-trial':
        return 'Start Your Free Trial - No Credit Card Required';
      case 'opt-out-trial':
        return 'Start Your 14-Day Free Trial';
      case 'usage-trial':
        return 'Try For Free - Up to 100 Units';
      case 'freemium':
        return 'Get Started For Free';
      case 'new-product':
        return 'Try Our Free Starter Product';
      case 'sandbox':
        return 'Experience Live Demo';
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
        <div className="p-6 space-y-6">
          {/* Discovery */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <h3 className="font-medium">Discovery</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Problem</label>
                <input
                  type="text"
                  value={editableContent.journey.discovery.problem}
                  onChange={(e) => handleJourneyUpdate('discovery', 'problem', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Enter the core problem..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Trigger</label>
                <input
                  type="text"
                  value={editableContent.journey.discovery.trigger}
                  onChange={(e) => handleJourneyUpdate('discovery', 'trigger', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="What triggers the user to seek a solution..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Initial Thought</label>
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

          {/* Sign Up */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <h3 className="font-medium">Sign Up</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Friction</label>
                <input
                  type="text"
                  value={editableContent.journey.signup.friction}
                  onChange={(e) => handleJourneyUpdate('signup', 'friction', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Enter signup friction points..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Time to Value</label>
                <input
                  type="text"
                  value={editableContent.journey.signup.timeToValue}
                  onChange={(e) => handleJourneyUpdate('signup', 'timeToValue', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="How quickly users get value..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Guidance</label>
                {editableContent.journey.signup.guidance.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayUpdate('signup', 'guidance', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter guidance item..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('signup', 'guidance', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('signup', 'guidance')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Guidance
                </button>
              </div>
            </div>
          </div>

          {/* Activation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <h3 className="font-medium">Activation</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Win</label>
                <input
                  type="text"
                  value={editableContent.journey.activation.firstWin}
                  onChange={(e) => handleJourneyUpdate('activation', 'firstWin', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="User's first success..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">"Aha" Feature</label>
                <input
                  type="text"
                  value={editableContent.journey.activation.ahaFeature}
                  onChange={(e) => handleJourneyUpdate('activation', 'ahaFeature', e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Feature that demonstrates value..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Time to Success</label>
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

          {/* Engagement */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <h3 className="font-medium">Engagement</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Core Tasks</label>
                {editableContent.journey.engagement.coreTasks.map((task, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleArrayUpdate('engagement', 'coreTasks', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter core task..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('engagement', 'coreTasks', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('engagement', 'coreTasks')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Core Task
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Collaboration</label>
                {editableContent.journey.engagement.collaboration.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayUpdate('engagement', 'collaboration', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter collaboration item..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('engagement', 'collaboration', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('engagement', 'collaboration')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Collaboration Item
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Limitations</label>
                {editableContent.journey.engagement.limitations.map((limit, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={limit}
                      onChange={(e) => handleArrayUpdate('engagement', 'limitations', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter limitation..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('engagement', 'limitations', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('engagement', 'limitations')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Limitation
                </button>
              </div>
            </div>
          </div>

          {/* Conversion */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FFD23F]">
              <h3 className="font-medium">Conversion</h3>
            </div>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Triggers</label>
                {editableContent.journey.conversion.triggers.map((trigger, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={trigger}
                      onChange={(e) => handleArrayUpdate('conversion', 'triggers', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter conversion trigger..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('conversion', 'triggers', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('conversion', 'triggers')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Trigger
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Next Features</label>
                {editableContent.journey.conversion.nextFeatures.map((feature, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayUpdate('conversion', 'nextFeatures', index, e.target.value)}
                      className="flex-1 bg-[#2A2A2A] text-white p-2 rounded border border-[#333333] focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                      placeholder="Enter next feature..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('conversion', 'nextFeatures', index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('conversion', 'nextFeatures')}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80 text-sm"
                >
                  + Add Next Feature
                </button>
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