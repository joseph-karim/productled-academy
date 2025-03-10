import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { Playbook, TriggerType } from '../types/playbook';
import { createPlaybook } from '../types/playbook';

interface CreatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaybookCreate: (playbook: Playbook) => void;
}

const triggerCategories = [
  {
    name: 'Forms & Chat',
    triggers: [
      { type: 'form_submission', label: 'Form Submission' },
      { type: 'landing_page', label: 'Landing Page' },
      { type: 'chat_widget', label: 'Chat Widget' }
    ]
  },
  {
    name: 'CRM',
    triggers: [
      { type: 'lead_created', label: 'Lead Created' },
      { type: 'deal_stage_changed', label: 'Deal Stage Changed' },
      { type: 'task_completed', label: 'Task Completed' }
    ]
  },
  {
    name: 'Calendar',
    triggers: [
      { type: 'meeting_scheduled', label: 'Meeting Scheduled' },
      { type: 'meeting_canceled', label: 'Meeting Canceled' }
    ]
  }
];

export default function CreatePlaybookModal({
  isOpen,
  onClose,
  onPlaybookCreate
}: CreatePlaybookModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);

  const handleNext = () => {
    if (step === 1 && name && description) {
      setStep(2);
    }
  };

  const handleCreate = () => {
    if (!name || !description || !selectedTrigger) return;

    const newPlaybook = createPlaybook(name, description, {
      type: selectedTrigger,
      name: triggerCategories
        .flatMap(cat => cat.triggers)
        .find(t => t.type === selectedTrigger)?.label || 'Trigger'
    });

    onPlaybookCreate(newPlaybook);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setSelectedTrigger(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Create New Playbook
                </Dialog.Title>

                <div className="mt-4">
                  {step === 1 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Playbook Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter playbook name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Describe what this playbook does..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Select a trigger to start your playbook:
                      </p>
                      {triggerCategories.map((category) => (
                        <div key={category.name}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {category.triggers.map(({ type, label }) => (
                              <button
                                key={type}
                                onClick={() => setSelectedTrigger(type as TriggerType)}
                                className={`flex items-start w-full p-3 space-x-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                                  selectedTrigger === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                              >
                                <div className="text-left">
                                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!name || !description}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={!selectedTrigger}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Playbook
                    </button>
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