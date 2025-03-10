import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  FormInput, Globe, MessageSquare, Calendar, Database,
  Mail, BellRing, Webhook, Code, Settings
} from 'lucide-react';
import type { TriggerType, TriggerConfig } from '../types/workflow';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSet: (trigger: TriggerConfig) => void;
}

const triggerCategories = [
  {
    name: 'Forms & Chat',
    triggers: [
      { type: 'form_submission', label: 'Form Submission', icon: FormInput },
      { type: 'landing_page', label: 'Landing Page', icon: Globe },
      { type: 'chat_widget', label: 'Chat Widget', icon: MessageSquare }
    ]
  },
  {
    name: 'Ad Platforms',
    triggers: [
      { type: 'google_ads', label: 'Google Ads', icon: Globe },
      { type: 'facebook_ads', label: 'Facebook Ads', icon: Globe },
      { type: 'linkedin_ads', label: 'LinkedIn Ads', icon: Globe }
    ]
  },
  {
    name: 'CRM',
    triggers: [
      { type: 'lead_created', label: 'Lead Created', icon: Database },
      { type: 'deal_stage_changed', label: 'Deal Stage Changed', icon: Database },
      { type: 'task_completed', label: 'Task Completed', icon: Database }
    ]
  },
  {
    name: 'Email',
    triggers: [
      { type: 'email_opened', label: 'Email Opened', icon: Mail },
      { type: 'email_clicked', label: 'Email Clicked', icon: Mail },
      { type: 'email_bounced', label: 'Email Bounced', icon: Mail }
    ]
  },
  {
    name: 'Website',
    triggers: [
      { type: 'page_visited', label: 'Page Visited', icon: Globe },
      { type: 'button_clicked', label: 'Button Clicked', icon: Globe },
      { type: 'form_abandoned', label: 'Form Abandoned', icon: FormInput }
    ]
  },
  {
    name: 'Calendar',
    triggers: [
      { type: 'meeting_scheduled', label: 'Meeting Scheduled', icon: Calendar },
      { type: 'meeting_canceled', label: 'Meeting Canceled', icon: Calendar }
    ]
  },
  {
    name: 'Custom',
    triggers: [
      { type: 'webhook', label: 'Webhook', icon: Webhook },
      { type: 'api_event', label: 'API Event', icon: Code },
      { type: 'custom_event', label: 'Custom Event', icon: Settings }
    ]
  }
];

export default function TriggerModal({ isOpen, onClose, onTriggerSet }: TriggerModalProps) {
  const [selectedType, setSelectedType] = useState<TriggerType | null>(null);
  const [triggerName, setTriggerName] = useState('');
  const [conditions, setConditions] = useState<any[]>([]);

  const handleSave = () => {
    if (!selectedType || !triggerName) return;

    const trigger: TriggerConfig = {
      type: selectedType,
      name: triggerName,
      conditions: conditions.length > 0 ? {
        type: 'ALL',
        rules: conditions
      } : undefined
    };

    onTriggerSet(trigger);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Configure Trigger
                </Dialog.Title>

                <div className="space-y-6">
                  {!selectedType ? (
                    // Trigger Type Selection
                    <div className="space-y-6">
                      {triggerCategories.map((category) => (
                        <div key={category.name}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {category.triggers.map(({ type, label, icon: Icon }) => (
                              <button
                                key={type}
                                onClick={() => setSelectedType(type as TriggerType)}
                                className="flex items-start w-full p-3 space-x-3 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="text-left">
                                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Trigger Configuration
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Trigger Name
                        </label>
                        <input
                          type="text"
                          value={triggerName}
                          onChange={(e) => setTriggerName(e.target.value)}
                          placeholder="Enter a name for this trigger"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Conditions
                        </label>
                        <div className="mt-1 space-y-2">
                          {conditions.map((condition, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <select
                                value={condition.field}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].field = e.target.value;
                                  setConditions(newConditions);
                                }}
                                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              >
                                <option>Select field</option>
                                <option value="email">Email</option>
                                <option value="name">Name</option>
                                <option value="company">Company</option>
                              </select>
                              <select
                                value={condition.operator}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].operator = e.target.value;
                                  setConditions(newConditions);
                                }}
                                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              >
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                                <option value="exists">Exists</option>
                              </select>
                              <input
                                type="text"
                                value={condition.value}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].value = e.target.value;
                                  setConditions(newConditions);
                                }}
                                placeholder="Value"
                                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setConditions([...conditions, { field: '', operator: 'equals', value: '' }])}
                            className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            Add Condition
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setSelectedType(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Save Trigger
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}