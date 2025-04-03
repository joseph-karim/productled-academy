import React, { useState, useEffect } from 'react';
import { useModelInputsStore } from '../store/modelInputsStore';
import { suggestModel } from '../services/ai/suggestions';
import { HelpCircle, Loader2 } from 'lucide-react';
import type { ModelType, UserJourney } from '../services/ai/analysis/types';

interface EditableContent {
  journey: UserJourney;
  callToAction: string;
}

interface FreeModelCanvasProps {
  readOnly?: boolean;
}

const emptyUserJourney: UserJourney = {
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
};

export function FreeModelCanvas({ readOnly = false }: FreeModelCanvasProps) {
  const { 
    selectedModel, 
    setSelectedModel, 
    productDescription,
    challenges, 
    solutions,
    userJourney,
    setUserJourney,
    callToAction,
    setCallToAction
  } = useModelInputsStore();
  const [showGuidance, setShowGuidance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitialCallToAction = (model: ModelType): string => {
    switch (model) {
      case 'freemium':
        return 'Get Started Free';
      case 'opt-in-trial':
        return 'Start Free Trial';
      case 'opt-out-trial':
        return 'Start Your 14-Day Trial';
      case 'usage-trial':
        return 'Try For Free';
      case 'new-product':
        return 'Try Our Free Starter';
      case 'sandbox':
        return 'Experience Live Demo';
      default:
        return 'Get Started';
    }
  };

  const [editableContent, setEditableContent] = useState<EditableContent>({
    journey: userJourney || emptyUserJourney,
    callToAction: callToAction || (selectedModel ? getInitialCallToAction(selectedModel) : '')
  });

  useEffect(() => {
    if (userJourney) {
      setEditableContent(prev => ({
        ...prev,
        journey: { ...userJourney }
      }));
    }
  }, [userJourney]);

  useEffect(() => {
    if (selectedModel) {
      setEditableContent(prev => ({
        ...prev,
        callToAction: getInitialCallToAction(selectedModel)
      }));
    }
  }, [selectedModel]);

  const handleGetSuggestion = async () => {
    if (!productDescription) {
      setError('Please provide a product description first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await suggestModel(
        productDescription,
        '',
        challenges,
        solutions
      );
      setSelectedModel(result.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestion');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelChange = (model: ModelType) => {
    if (!readOnly) {
      setSelectedModel(model);
    }
  };

  const handleJourneyChange = (
    stage: keyof UserJourney,
    step: string,
    value: string | string[]
  ) => {
    if (readOnly) return;

    const updatedJourney = {
      ...editableContent.journey,
      [stage]: {
        ...editableContent.journey[stage],
        [step]: value
      }
    };

    setEditableContent(prev => ({
      ...prev,
      journey: { ...updatedJourney }
    }));

    setUserJourney(updatedJourney);
  };

  const handleCallToActionChange = (value: string) => {
    if (readOnly) return;

    setEditableContent(prev => ({
      ...prev,
      callToAction: value
    }));

    setCallToAction(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Free Model Canvas</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowGuidance(!showGuidance)}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        {!readOnly && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            onClick={handleGetSuggestion}
            disabled={isGenerating || !productDescription}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Get Suggestion</span>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {showGuidance && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Guidance</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Choose the right model based on your product's complexity and target users:
                </p>
                <ul className="mt-2 list-inside list-disc">
                  <li>Freemium: Core value is easy to demonstrate</li>
                  <li>Free Trial: Complex product needing evaluation time</li>
                  <li>Open Core: Technical product with advanced features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleModelChange('freemium')}
            className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center hover:border-blue-400 ${
              selectedModel === 'freemium'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
            disabled={readOnly}
          >
            <h3 className="text-sm font-medium">Freemium</h3>
            <p className="mt-1 text-xs text-gray-500">
              Free forever with premium features
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModelChange('opt-in-trial')}
            className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center hover:border-blue-400 ${
              selectedModel === 'opt-in-trial'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
            disabled={readOnly}
          >
            <h3 className="text-sm font-medium">Free Trial</h3>
            <p className="mt-1 text-xs text-gray-500">
              Time-limited access to full product
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModelChange('sandbox')}
            className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center hover:border-blue-400 ${
              selectedModel === 'sandbox'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
            disabled={readOnly}
          >
            <h3 className="text-sm font-medium">Sandbox</h3>
            <p className="mt-1 text-xs text-gray-500">
              Try before you buy
            </p>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900">User Journey</h3>
            <div className="mt-4 space-y-6">
              {/* Discovery Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Discovery</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Problem Recognition
                    </label>
                    <textarea
                      value={editableContent.journey.discovery.problem}
                      onChange={(e) => handleJourneyChange('discovery', 'problem', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="How do users realize they need your solution?"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Trigger
                    </label>
                    <textarea
                      value={editableContent.journey.discovery.trigger}
                      onChange={(e) => handleJourneyChange('discovery', 'trigger', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="What triggers users to seek a solution?"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Initial Thought
                    </label>
                    <textarea
                      value={editableContent.journey.discovery.initialThought}
                      onChange={(e) => handleJourneyChange('discovery', 'initialThought', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="What's their first reaction?"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Sign Up Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Sign Up</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Friction Points
                    </label>
                    <textarea
                      value={editableContent.journey.signup.friction}
                      onChange={(e) => handleJourneyChange('signup', 'friction', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="What are the friction points in signing up?"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Time to Value
                    </label>
                    <textarea
                      value={editableContent.journey.signup.timeToValue}
                      onChange={(e) => handleJourneyChange('signup', 'timeToValue', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="How quickly do users get value?"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Activation Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Activation</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      First Win
                    </label>
                    <textarea
                      value={editableContent.journey.activation.firstWin}
                      onChange={(e) => handleJourneyChange('activation', 'firstWin', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="What's their first success moment?"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Aha Feature
                    </label>
                    <textarea
                      value={editableContent.journey.activation.ahaFeature}
                      onChange={(e) => handleJourneyChange('activation', 'ahaFeature', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="Which feature demonstrates the most value?"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Time to Success
                    </label>
                    <textarea
                      value={editableContent.journey.activation.timeToSuccess}
                      onChange={(e) => handleJourneyChange('activation', 'timeToSuccess', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={2}
                      placeholder="How long until they achieve success?"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Engagement Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Engagement</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Core Tasks
                    </label>
                    <textarea
                      value={editableContent.journey.engagement.coreTasks.join('\n')}
                      onChange={(e) => handleJourneyChange('engagement', 'coreTasks', e.target.value.split('\n'))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="What are the core tasks users perform? (One per line)"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Collaboration
                    </label>
                    <textarea
                      value={editableContent.journey.engagement.collaboration.join('\n')}
                      onChange={(e) => handleJourneyChange('engagement', 'collaboration', e.target.value.split('\n'))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="How do users collaborate? (One item per line)"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Limitations
                    </label>
                    <textarea
                      value={editableContent.journey.engagement.limitations.join('\n')}
                      onChange={(e) => handleJourneyChange('engagement', 'limitations', e.target.value.split('\n'))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="What are the current limitations? (One per line)"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Conversion Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Conversion</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Triggers
                    </label>
                    <textarea
                      value={editableContent.journey.conversion.triggers.join('\n')}
                      onChange={(e) => handleJourneyChange('conversion', 'triggers', e.target.value.split('\n'))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="What triggers users to upgrade? (One per line)"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Next Features
                    </label>
                    <textarea
                      value={editableContent.journey.conversion.nextFeatures.join('\n')}
                      onChange={(e) => handleJourneyChange('conversion', 'nextFeatures', e.target.value.split('\n'))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="What features do they want next? (One per line)"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900">Call to Action</h3>
            <div className="mt-2">
              <input
                type="text"
                value={editableContent.callToAction}
                onChange={(e) => handleCallToActionChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter your call to action text"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}