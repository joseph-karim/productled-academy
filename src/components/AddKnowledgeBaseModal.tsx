import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { KnowledgeSourceType } from '../types/knowledge';

interface AddKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKnowledgeBaseAdd: (data: {
    name: string;
    description: string;
    source: KnowledgeSourceType;
    sourceConfig?: any;
  }) => void;
}

export default function AddKnowledgeBaseModal({
  isOpen,
  onClose,
  onKnowledgeBaseAdd
}: AddKnowledgeBaseModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<KnowledgeSourceType>('internal');
  const [sourceConfig, setSourceConfig] = useState<any>({});

  const handleSubmit = () => {
    if (!name) return;

    onKnowledgeBaseAdd({
      name,
      description,
      source,
      sourceConfig: source !== 'internal' ? sourceConfig : undefined
    });

    setName('');
    setDescription('');
    setSource('internal');
    setSourceConfig({});
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
                  Create Knowledge Base
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter knowledge base name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Describe the purpose of this knowledge base..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as KnowledgeSourceType)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="internal">Internal</option>
                      <option value="hubspot">HubSpot</option>
                      <option value="zendesk">Zendesk</option>
                    </select>
                  </div>

                  {source === 'hubspot' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          HubSpot Knowledge Base ID
                        </label>
                        <input
                          type="text"
                          value={sourceConfig.hubspot?.knowledgeBaseId || ''}
                          onChange={(e) =>
                            setSourceConfig({
                              ...sourceConfig,
                              hubspot: { ...sourceConfig.hubspot, knowledgeBaseId: e.target.value }
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter HubSpot Knowledge Base ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category ID (optional)
                        </label>
                        <input
                          type="text"
                          value={sourceConfig.hubspot?.categoryId || ''}
                          onChange={(e) =>
                            setSourceConfig({
                              ...sourceConfig,
                              hubspot: { ...sourceConfig.hubspot, categoryId: e.target.value }
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter category ID"
                        />
                      </div>
                    </div>
                  )}

                  {source === 'zendesk' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Zendesk Help Center ID
                        </label>
                        <input
                          type="text"
                          value={sourceConfig.zendesk?.helpCenterId || ''}
                          onChange={(e) =>
                            setSourceConfig({
                              ...sourceConfig,
                              zendesk: { ...sourceConfig.zendesk, helpCenterId: e.target.value }
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter Zendesk Help Center ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category ID (optional)
                        </label>
                        <input
                          type="text"
                          value={sourceConfig.zendesk?.categoryId || ''}
                          onChange={(e) =>
                            setSourceConfig({
                              ...sourceConfig,
                              zendesk: { ...sourceConfig.zendesk, categoryId: e.target.value }
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter category ID"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Create Knowledge Base
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}