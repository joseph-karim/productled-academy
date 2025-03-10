import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bot, GripVertical, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { KnowledgeBase } from '../types/knowledge';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBases: KnowledgeBase[];
  selectedKnowledgeBases: { id: string; priority: number }[];
  onKnowledgeBasesUpdate: (kbs: { id: string; priority: number }[]) => void;
}

export default function KnowledgeBaseModal({
  isOpen,
  onClose,
  knowledgeBases,
  selectedKnowledgeBases,
  onKnowledgeBasesUpdate,
}: KnowledgeBaseModalProps) {
  const [selected, setSelected] = useState<{ id: string; priority: number }[]>([]);

  useEffect(() => {
    setSelected(selectedKnowledgeBases);
  }, [selectedKnowledgeBases]);

  const handleToggleKnowledgeBase = (kbId: string) => {
    setSelected(prev => {
      if (prev.some(kb => kb.id === kbId)) {
        return prev.filter(kb => kb.id !== kbId);
      }
      return [...prev, { id: kbId, priority: 1 }];
    });
  };

  const handlePriorityChange = (kbId: string, change: number) => {
    setSelected(prev => prev.map(kb => {
      if (kb.id === kbId) {
        return {
          ...kb,
          priority: Math.max(1, Math.min(10, kb.priority + change))
        };
      }
      return kb;
    }));
  };

  const handleSave = () => {
    onKnowledgeBasesUpdate(selected);
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
                <Dialog.Title as="div" className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Configure Knowledge Access
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Select knowledge bases that this playbook can access. Higher priority knowledge bases will be searched first.
                  </p>

                  <div className="mt-4 space-y-2">
                    {knowledgeBases.map((kb) => {
                      const isSelected = selected.some(s => s.id === kb.id);
                      const selectedKb = selected.find(s => s.id === kb.id);

                      return (
                        <div
                          key={kb.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleKnowledgeBase(kb.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{kb.name}</h4>
                              <p className="text-xs text-gray-500">{kb.articles.length} articles</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center space-x-2">
                              <div className="flex flex-col">
                                <button
                                  onClick={() => handlePriorityChange(kb.id, 1)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePriorityChange(kb.id, -1)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                Priority: {selectedKb?.priority || 1}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Configuration
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}