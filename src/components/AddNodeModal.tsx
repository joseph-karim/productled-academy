import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Phone, Mail, MessageSquare, FileText, GitBranch, Clock, X, Webhook, Database, Search, PlusCircle, FormInput, Send, Linkedin, Brain, FileSearch, FileText as FileText2, Tags, Image, HelpCircle, Calendar, Briefcase, TicketCheck, MessageSquareMore } from 'lucide-react';
import type { ActionType } from '../types/workflow';
import { nodeCategories } from '../types/workflow';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeAdd: (type: ActionType) => void;
}

const nodeTypes = [
  {
    category: 'communication',
    nodes: [
      {
        type: 'voice' as ActionType,
        label: 'Voice Call',
        description: 'Make an outbound voice call',
        icon: Phone
      },
      {
        type: 'email' as ActionType,
        label: 'Send Email',
        description: 'Send an email message',
        icon: Mail
      },
      {
        type: 'sms' as ActionType,
        label: 'Send SMS',
        description: 'Send a text message',
        icon: MessageSquare
      },
      {
        type: 'linkedin' as ActionType,
        label: 'LinkedIn Message',
        description: 'Send a LinkedIn message',
        icon: Linkedin
      }
    ]
  },
  {
    category: 'crm',
    nodes: [
      {
        type: 'crm_update' as ActionType,
        label: 'Update CRM',
        description: 'Update records in CRM',
        icon: Database
      },
      {
        type: 'crm_create' as ActionType,
        label: 'Create CRM Record',
        description: 'Create a new CRM record',
        icon: PlusCircle
      },
      {
        type: 'crm_search' as ActionType,
        label: 'Search CRM',
        description: 'Search for CRM records',
        icon: Search
      }
    ]
  },
  {
    category: 'form',
    nodes: [
      {
        type: 'form_trigger' as ActionType,
        label: 'Form Trigger',
        description: 'Trigger on form submission',
        icon: FormInput
      },
      {
        type: 'form_submit' as ActionType,
        label: 'Submit Form',
        description: 'Submit data to a form',
        icon: Send
      }
    ]
  },
  {
    category: 'flow',
    nodes: [
      {
        type: 'condition' as ActionType,
        label: 'Condition',
        description: 'Branch based on conditions',
        icon: GitBranch
      },
      {
        type: 'delay' as ActionType,
        label: 'Delay',
        description: 'Add a time delay',
        icon: Clock
      },
      {
        type: 'end' as ActionType,
        label: 'End',
        description: 'End the workflow',
        icon: X
      }
    ]
  },
  {
    category: 'integration',
    nodes: [
      {
        type: 'api_request' as ActionType,
        label: 'API Request',
        description: 'Make an API request',
        icon: Send
      },
      {
        type: 'webhook' as ActionType,
        label: 'Webhook',
        description: 'Handle webhook events',
        icon: Webhook
      }
    ]
  },
  {
    category: 'ai',
    nodes: [
      {
        type: 'ai_research' as ActionType,
        label: 'Web Research',
        description: 'Perform AI-powered web research',
        icon: FileSearch
      },
      {
        type: 'ai_summarize' as ActionType,
        label: 'Summarize Text',
        description: 'Generate summaries of text content',
        icon: FileText2
      },
      {
        type: 'ai_extract' as ActionType,
        label: 'Extract Data',
        description: 'Extract structured data from text',
        icon: FileText
      },
      {
        type: 'ai_categorize' as ActionType,
        label: 'Categorize',
        description: 'Categorize content using AI',
        icon: Tags
      },
      {
        type: 'ai_analyze_image' as ActionType,
        label: 'Analyze Image',
        description: 'Extract insights from images',
        icon: Image
      },
      {
        type: 'ai_ask' as ActionType,
        label: 'Ask AI',
        description: 'Get AI-generated responses',
        icon: HelpCircle
      }
    ]
  },
  {
    category: 'tools',
    nodes: [
      {
        type: 'calendar_schedule' as ActionType,
        label: 'Schedule Meeting',
        description: 'Create calendar events',
        icon: Calendar
      },
      {
        type: 'deal_room_create' as ActionType,
        label: 'Create Deal Room',
        description: 'Set up a new deal room',
        icon: Briefcase
      },
      {
        type: 'jira_create' as ActionType,
        label: 'Create Jira Issue',
        description: 'Create a new Jira ticket',
        icon: TicketCheck
      },
      {
        type: 'zendesk_ticket' as ActionType,
        label: 'Create Support Ticket',
        description: 'Create a Zendesk ticket',
        icon: MessageSquareMore
      }
    ]
  }
];

export default function AddNodeModal({ isOpen, onClose, onNodeAdd }: AddNodeModalProps) {
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Add Node
                </Dialog.Title>
                <div className="space-y-6">
                  {nodeTypes.map(({ category, nodes }) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {nodeCategories[category as keyof typeof nodeCategories].label}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {nodes.map(({ type, label, description, icon: Icon }) => (
                          <button
                            key={type}
                            onClick={() => {
                              onNodeAdd(type);
                              onClose();
                            }}
                            className={`flex items-start w-full p-3 space-x-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                              category === 'communication' ? 'border-blue-200 bg-blue-50' :
                              category === 'crm' ? 'border-green-200 bg-green-50' :
                              category === 'form' ? 'border-purple-200 bg-purple-50' :
                              category === 'flow' ? 'border-orange-200 bg-orange-50' :
                              category === 'ai' ? 'border-violet-200 bg-violet-50' :
                              category === 'tools' ? 'border-teal-200 bg-teal-50' :
                              'border-pink-200 bg-pink-50'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              category === 'communication' ? 'bg-blue-100 text-blue-600' :
                              category === 'crm' ? 'bg-green-100 text-green-600' :
                              category === 'form' ? 'bg-purple-100 text-purple-600' :
                              category === 'flow' ? 'bg-orange-100 text-orange-600' :
                              category === 'ai' ? 'bg-violet-100 text-violet-600' :
                              category === 'tools' ? 'bg-teal-100 text-teal-600' :
                              'bg-pink-100 text-pink-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                              <p className="text-xs text-gray-500">{description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}