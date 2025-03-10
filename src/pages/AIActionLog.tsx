import { useState } from 'react';
import { Phone, Mail, MessageSquare, Bot, Search, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface AIAction {
  id: string;
  timestamp: string;
  lead: {
    name: string;
    company: string;
  };
  campaign: string;
  playbook: string;
  actionType: 'call' | 'email' | 'sms' | 'research' | 'analysis';
  status: 'completed' | 'in_progress' | 'failed';
  result: string;
  confidence: number;
}

const mockActions: AIAction[] = [
  {
    id: '1',
    timestamp: '2024-02-28T14:30:00Z',
    lead: {
      name: 'Sarah Johnson',
      company: 'Tech Corp'
    },
    campaign: 'Enterprise Q1',
    playbook: 'Lead Qualification',
    actionType: 'call',
    status: 'completed',
    result: 'Scheduled demo call for next week',
    confidence: 0.92
  },
  {
    id: '2',
    timestamp: '2024-02-28T14:15:00Z',
    lead: {
      name: 'Michael Chen',
      company: 'Innovate Inc'
    },
    campaign: 'SMB Outreach',
    playbook: 'Meeting Follow-up',
    actionType: 'email',
    status: 'completed',
    result: 'Sent personalized product overview',
    confidence: 0.88
  },
  {
    id: '3',
    timestamp: '2024-02-28T14:00:00Z',
    lead: {
      name: 'Emily Brown',
      company: 'Data Systems'
    },
    campaign: 'Technical Decision Makers',
    playbook: 'Technical Evaluation',
    actionType: 'research',
    status: 'completed',
    result: 'Analyzed company tech stack and prepared recommendations',
    confidence: 0.95
  }
];

const ActionTypeIcon = ({ type }: { type: AIAction['actionType'] }) => {
  switch (type) {
    case 'call':
      return <Phone className="w-5 h-5 text-blue-600" />;
    case 'email':
      return <Mail className="w-5 h-5 text-green-600" />;
    case 'sms':
      return <MessageSquare className="w-5 h-5 text-purple-600" />;
    case 'research':
    case 'analysis':
      return <Bot className="w-5 h-5 text-violet-600" />;
    default:
      return null;
  }
};

export default function AIActionLog() {
  const [actions] = useState<AIAction[]>(mockActions);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Action Log</h2>
          <p className="mt-1 text-sm text-gray-500">Review AI-driven engagement activities</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actions..."
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Playbook
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((action) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ActionTypeIcon type={action.actionType} />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {action.actionType.charAt(0).toUpperCase() + action.actionType.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{action.result}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{action.lead.name}</div>
                  <div className="text-sm text-gray-500">{action.lead.company}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{action.campaign}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{action.playbook}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    action.status === 'completed' ? 'bg-green-100 text-green-800' :
                    action.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{(action.confidence * 100).toFixed(0)}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(action.timestamp), 'MMM d, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}