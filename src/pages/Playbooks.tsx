import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Bot, Calendar, Users, ArrowRight, Tag } from 'lucide-react';
import { Menu } from '@headlessui/react';
import type { Playbook } from '../types/playbook';
import CreatePlaybookModal from '../components/CreatePlaybookModal';

const mockPlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'Lead Qualification',
    description: 'Automated lead qualification and scoring',
    trigger: {
      type: 'form_submission',
      name: 'Lead Form Submission'
    },
    actions: [],
    created: '2024-02-28T10:00:00Z',
    updated: '2024-02-28T10:00:00Z',
    status: 'active',
    version: 1,
    knowledgeBases: [
      { id: 'pricing', priority: 2 },
      { id: 'features', priority: 1 }
    ]
  },
  {
    id: '2',
    name: 'Meeting Follow-up',
    description: 'Automated follow-up sequence after meetings',
    trigger: {
      type: 'meeting_scheduled',
      name: 'Meeting Scheduled'
    },
    actions: [],
    created: '2024-02-27T15:30:00Z',
    updated: '2024-02-27T15:30:00Z',
    status: 'draft',
    version: 1
  },
  {
    id: '3',
    name: 'Deal Room Creation',
    description: 'Automated deal room setup and participant invitation',
    trigger: {
      type: 'deal_stage_changed',
      name: 'Deal Stage Change'
    },
    actions: [],
    created: '2024-02-26T09:15:00Z',
    updated: '2024-02-26T09:15:00Z',
    status: 'active',
    version: 2
  }
];

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || playbook.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePlaybook = (newPlaybook: Playbook) => {
    setPlaybooks([...playbooks, newPlaybook]);
    setShowCreateModal(false);
  };

  const getTriggerIcon = (type: string) => {
    if (type.includes('form')) return <Tag className="w-5 h-5" />;
    if (type.includes('meeting')) return <Calendar className="w-5 h-5" />;
    if (type.includes('deal')) return <Users className="w-5 h-5" />;
    return <Bot className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Playbooks</h2>
          <p className="mt-1 text-sm text-gray-500">Design and manage AI-driven automation playbooks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Playbook
        </button>
      </div>

      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playbooks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <Menu as="div" className="relative">
          <Menu.Button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              {['all', 'active', 'draft', 'archived'].map((status) => (
                <Menu.Item key={status}>
                  {({ active }) => (
                    <button
                      onClick={() => setStatusFilter(status as any)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Menu>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlaybooks.map((playbook) => (
          <Link
            key={playbook.id}
            to={`/playbooks/${playbook.id}`}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  playbook.status === 'active' ? 'bg-green-100' :
                  playbook.status === 'draft' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {getTriggerIcon(playbook.trigger.type)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{playbook.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{playbook.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  playbook.status === 'active' ? 'bg-green-100 text-green-800' :
                  playbook.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {playbook.status.charAt(0).toUpperCase() + playbook.status.slice(1)}
                </span>
                {playbook.version > 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    v{playbook.version}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                Updated {new Date(playbook.updated).toLocaleDateString()}
              </span>
            </div>

            {playbook.knowledgeBases && playbook.knowledgeBases.length > 0 && (
              <div className="mt-4 flex items-center space-x-2">
                <Bot className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {playbook.knowledgeBases.length} Knowledge Base{playbook.knowledgeBases.length > 1 ? 's' : ''} Connected
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <CreatePlaybookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPlaybookCreate={handleCreatePlaybook}
      />
    </div>
  );
}