import { useState } from 'react';
import { MessageSquare, Mail, Phone, Globe, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

const mockLead = {
  id: 1,
  name: 'John Smith',
  company: 'Tech Corp',
  email: 'john@techcorp.com',
  phone: '+1 (555) 123-4567',
  position: 'CTO',
  status: 'Qualified',
  source: 'Website',
  lastContact: '2h ago',
  score: 85,
  interactions: [
    {
      type: 'voice',
      timestamp: '2024-02-28T14:30:00Z',
      summary: 'Discussed product features and pricing',
      sentiment: 'positive',
      nextSteps: 'Schedule technical demo',
    },
    {
      type: 'email',
      timestamp: '2024-02-27T10:15:00Z',
      subject: 'Follow-up on product demo',
      status: 'opened',
      clickedLinks: true,
    },
    {
      type: 'sms',
      timestamp: '2024-02-26T16:45:00Z',
      message: 'Confirmation of meeting time',
      status: 'delivered',
    },
  ],
  crmData: {
    deals: [
      { id: 1, name: 'Enterprise License Q1', value: 50000, stage: 'Qualification' },
    ],
    meetings: [
      { date: '2024-03-01T15:00:00Z', type: 'Technical Demo', attendees: 4 },
    ],
  },
  productInteractions: [
    { page: 'Pricing', duration: '5m', date: '2024-02-25' },
    { page: 'API Documentation', duration: '15m', date: '2024-02-26' },
    { page: 'Case Studies', duration: '8m', date: '2024-02-27' },
  ],
};

const InteractionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'voice':
      return <Phone className="w-5 h-5 text-blue-500" />;
    case 'email':
      return <Mail className="w-5 h-5 text-green-500" />;
    case 'sms':
      return <MessageSquare className="w-5 h-5 text-purple-500" />;
    default:
      return <Globe className="w-5 h-5 text-gray-500" />;
  }
};

export default function LeadDetails() {
  const [activeTab, setActiveTab] = useState('interactions');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{mockLead.name}</h2>
          <p className="text-gray-500">{mockLead.company}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            Score: {mockLead.score}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full
            ${mockLead.status === 'Qualified' 
              ? 'text-green-700 bg-green-100' 
              : 'text-yellow-700 bg-yellow-100'}`}>
            {mockLead.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('interactions')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'interactions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Interactions
              </button>
              <button
                onClick={() => setActiveTab('product')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'product'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Product Activity
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'crm'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                CRM Data
              </button>
            </div>

            {activeTab === 'interactions' && (
              <div className="mt-6 space-y-6">
                {mockLead.interactions.map((interaction, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <InteractionIcon type={interaction.type} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} Interaction
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {interaction.summary || interaction.subject || interaction.message}
                      </p>
                      {interaction.sentiment && (
                        <span className={`inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium rounded-full
                          ${interaction.sentiment === 'positive' 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-yellow-700 bg-yellow-100'}`}>
                          {interaction.sentiment.charAt(0).toUpperCase() + interaction.sentiment.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'product' && (
              <div className="mt-6 space-y-4">
                {mockLead.productInteractions.map((interaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{interaction.page}</h3>
                        <p className="text-sm text-gray-500">Duration: {interaction.duration}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{interaction.date}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'crm' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Deals</h3>
                  <div className="mt-2 space-y-3">
                    {mockLead.crmData.deals.map((deal, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{deal.name}</h4>
                          <span className="text-sm font-medium text-green-600">
                            ${deal.value.toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Stage: {deal.stage}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Upcoming Meetings</h3>
                  <div className="mt-2 space-y-3">
                    {mockLead.crmData.meetings.map((meeting, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <h4 className="text-sm font-medium text-gray-900">{meeting.type}</h4>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(meeting.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {meeting.attendees} attendees
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{mockLead.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{mockLead.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{mockLead.company}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
            <div className="mt-4 space-y-3">
              <div className="p-3 text-sm text-blue-700 bg-blue-50 rounded-lg">
                High engagement with technical content suggests decision-maker role
              </div>
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg">
                Positive sentiment in recent voice interaction
              </div>
              <div className="p-3 text-sm text-purple-700 bg-purple-50 rounded-lg">
                Ready for technical demo based on product page visits
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900">Next Best Action</h3>
            <div className="mt-4">
              <button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Schedule Technical Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}