import { useState } from 'react';
import { Phone, Mail, MessageSquare, Bot, Play, Pause, Filter, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import ContactEventDetailsModal from '../components/ContactEventDetailsModal';
import type { Event } from '../types/events';

const mockEvents: Event[] = [
  {
    id: 1,
    type: 'voice',
    contact: 'John Smith',
    company: 'Tech Corp',
    duration: '5:23',
    status: 'completed',
    outcome: 'interested',
    timestamp: '2h ago',
    details: 'Discussed product features and pricing. Customer showed strong interest in enterprise package.',
    aiAssisted: true,
    crm: {
      id: '123',
      type: 'opportunity',
      stage: 'Qualification',
      value: 50000,
      owner: 'Sarah Wilson',
      nextAction: 'Schedule technical demo'
    },
    module: {
      campaign: {
        id: 'camp1',
        name: 'Enterprise Q1',
        type: 'Outbound',
        status: 'active'
      },
      playbook: {
        id: 'pb1',
        name: 'Enterprise Qualification',
        stage: 'Technical Evaluation'
      }
    },
    recording: {
      url: 'https://example.com/recording.mp3',
      transcript: [
        {
          speaker: 'agent',
          timestamp: '0:00',
          text: 'Hi John, thanks for taking my call today.'
        },
        {
          speaker: 'contact',
          timestamp: '0:05',
          text: 'Yes, I was looking forward to discussing your solution.'
        }
      ]
    },
    aiNotes: [
      {
        type: 'sentiment',
        content: 'Positive sentiment detected. High interest in technical capabilities.'
      },
      {
        type: 'action_item',
        content: 'Schedule technical demo with engineering team'
      }
    ]
  },
  {
    id: 2,
    type: 'email',
    contact: 'Sarah Johnson',
    company: 'Digital Solutions',
    status: 'completed',
    outcome: 'opened',
    timestamp: '1h ago',
    details: 'Follow-up email with requested documentation and pricing information.',
    aiAssisted: true,
    content: {
      subject: 'Product Information Request',
      body: "Hi Sarah,\n\nThank you for your interest in our solution. I have attached the requested documentation and pricing information.",
      attachments: [
        { name: 'Product_Overview.pdf', url: '#' },
        { name: 'Pricing_Guide.pdf', url: '#' }
      ]
    },
    crm: {
      id: '124',
      type: 'lead',
      stage: 'Engaged',
      owner: 'Mike Brown'
    }
  },
  {
    id: 3,
    type: 'sms',
    contact: 'Michael Brown',
    company: 'Innovation Inc',
    status: 'completed',
    outcome: 'replied',
    timestamp: '30m ago',
    details: 'Confirmed meeting time for tomorrow.',
    aiAssisted: false,
    content: {
      body: "Looking forward to our meeting tomorrow at 2 PM. I will have the technical team join as well."
    }
  }
];

export default function ContactEvents() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCall, setActiveCall] = useState<Event | null>(null);

  const filteredEvents = events.filter(event => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.contact.toLowerCase().includes(searchLower) ||
      event.company.toLowerCase().includes(searchLower) ||
      event.details.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Events</h2>
          <p className="mt-1 text-sm text-gray-500">Track all communication attempts with leads</p>
        </div>
        <div className="flex space-x-3">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100">
              <Bot className="w-4 h-4 mr-2" />
              AI Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/ai-actions"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      View Action Log
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Configure AI Settings
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
            <Phone className="w-4 h-4 mr-2" />
            New Call
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100">
            <Mail className="w-4 h-4 mr-2" />
            New Email
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">
            <MessageSquare className="w-4 h-4 mr-2" />
            New SMS
          </button>
        </div>
      </div>

      {activeCall && (
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Call</h3>
            <button className="flex items-center px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
              <Pause className="w-4 h-4 mr-2" />
              End Call
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{activeCall.contact}</p>
                <p className="text-sm text-gray-500">{activeCall.company}</p>
              </div>
              <div className="text-sm text-gray-500">Duration: {activeCall.duration}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.contact}</div>
                  <div className="text-sm text-gray-500">{event.company}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {event.type === 'voice' && <Phone className="w-5 h-5 text-blue-500" />}
                    {event.type === 'email' && <Mail className="w-5 h-5 text-green-500" />}
                    {event.type === 'sms' && <MessageSquare className="w-5 h-5 text-purple-500" />}
                    {event.aiAssisted && (
                      <Bot className="w-5 h-5 text-violet-500 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    event.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.outcome === 'interested' ? 'bg-green-100 text-green-800' :
                    event.outcome === 'opened' ? 'bg-blue-100 text-blue-800' :
                    event.outcome === 'replied' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.outcome}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2 break-words">
                    {event.details}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.timestamp}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {event.type === 'voice' && event.status === 'completed' && (
                    <button className="text-gray-400 hover:text-gray-500">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactEventDetailsModal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
}