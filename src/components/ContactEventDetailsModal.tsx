import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Phone, Mail, MessageSquare, Bot, X, Link as LinkIcon, ExternalLink, Users, FileText, Bot as BotIcon } from 'lucide-react';
import type { Event, EventType } from '../types/events';

interface ContactEventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

const EventTypeIcon = ({ type }: { type: EventType }) => {
  switch (type) {
    case 'voice':
      return <Phone className="w-5 h-5 text-blue-500" />;
    case 'email':
      return <Mail className="w-5 h-5 text-green-500" />;
    case 'sms':
      return <MessageSquare className="w-5 h-5 text-purple-500" />;
    default:
      return null;
  }
};

export default function ContactEventDetailsModal({ isOpen, onClose, event }: ContactEventDetailsModalProps) {
  if (!event) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      event.type === 'voice' ? 'bg-blue-100' :
                      event.type === 'email' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <EventTypeIcon type={event.type} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        {event.contact}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">{event.company}</p>
                    </div>
                    {event.aiAssisted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        <Bot className="w-4 h-4 mr-1" />
                        AI Assisted
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    {/* Event Content */}
                    {event.type === 'voice' && event.recording && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <audio
                            controls
                            className="w-full"
                            src={event.recording.url}
                          />
                        </div>
                        <div className="space-y-4">
                          {event.recording.transcript.map((entry, index) => (
                            <div
                              key={index}
                              className={`flex items-start space-x-3 ${
                                entry.speaker === 'agent' ? 'flex-row-reverse space-x-reverse' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${
                                entry.speaker === 'agent' ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                {entry.speaker === 'agent' ? <Bot className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                              </div>
                              <div className={`flex-1 p-4 rounded-lg ${
                                entry.speaker === 'agent' ? 'bg-blue-50' : 'bg-gray-50'
                              }`}>
                                <p className="text-sm text-gray-900">{entry.text}</p>
                                <span className="text-xs text-gray-500">{entry.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.type === 'email' && event.content && (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900">{event.content.subject}</h4>
                          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {event.content.body}
                          </div>
                          {event.content.attachments && event.content.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">Attachments</h5>
                              {event.content.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-900">{attachment.name}</span>
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {event.type === 'sms' && event.content && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-900">{event.content.body}</p>
                      </div>
                    )}

                    {/* Module Information */}
                    {event.module && (
                      <div className="space-y-4">
                        {event.module.campaign && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Campaign</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-900">{event.module.campaign.name}</p>
                                <p className="text-xs text-blue-700">{event.module.campaign.type}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                event.module.campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {event.module.campaign.status}
                              </span>
                            </div>
                          </div>
                        )}

                        {event.module.playbook && (
                          <div className="p-4 bg-violet-50 rounded-lg">
                            <h4 className="text-sm font-medium text-violet-900 mb-2">Playbook</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-violet-900">{event.module.playbook.name}</p>
                                <p className="text-xs text-violet-700">Stage: {event.module.playbook.stage}</p>
                              </div>
                              <BotIcon className="w-5 h-5 text-violet-600" />
                            </div>
                          </div>
                        )}

                        {event.module.dealRoom && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="text-sm font-medium text-green-900 mb-2">Deal Room</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-green-900">{event.module.dealRoom.name}</p>
                                <p className="text-xs text-green-700">Status: {event.module.dealRoom.status}</p>
                              </div>
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* CRM Information */}
                    {event.crm && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">CRM Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Type</span>
                            <span className="font-medium text-gray-900 capitalize">{event.crm.type}</span>
                          </div>
                          {event.crm.stage && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Stage</span>
                              <span className="font-medium text-gray-900">{event.crm.stage}</span>
                            </div>
                          )}
                          {event.crm.value && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Value</span>
                              <span className="font-medium text-gray-900">${event.crm.value.toLocaleString()}</span>
                            </div>
                          )}
                          {event.crm.owner && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Owner</span>
                              <span className="font-medium text-gray-900">{event.crm.owner}</span>
                            </div>
                          )}
                          {event.crm.nextAction && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Next Action</span>
                              <span className="font-medium text-gray-900">{event.crm.nextAction}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <a
                            href="#"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            View in CRM
                          </a>
                        </div>
                      </div>
                    )}

                    {/* AI Notes */}
                    {event.aiNotes && event.aiNotes.length > 0 && (
                      <div className="p-4 bg-violet-50 rounded-lg">
                        <h4 className="text-sm font-medium text-violet-900 mb-4">AI Analysis</h4>
                        <div className="space-y-3">
                          {event.aiNotes.map((note, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg">
                              <span className="text-xs font-medium text-violet-700 uppercase">
                                {note.type.replace('_', ' ')}
                              </span>
                              <p className="mt-1 text-sm text-gray-900">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CRM Updates */}
                    {event.crmUpdates && event.crmUpdates.length > 0 && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">CRM Updates</h4>
                        <div className="space-y-3">
                          {event.crmUpdates.map((update, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{update.field}</span>
                              <span className="font-medium text-gray-900">{update.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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