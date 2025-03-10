import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useCampaigns } from '../hooks/useCampaigns';
import CreateCampaignModal from '../components/CreateCampaignModal';
import type { Campaign } from '../types/campaign';

export default function Campaigns() {
  const { campaigns, addCampaign, updateCampaign } = useCampaigns();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = (campaign: Campaign) => {
    addCampaign(campaign);
    setShowCreateModal(false);
  };

  const handleStatusChange = (campaignId: string, status: Campaign['status']) => {
    updateCampaign(campaignId, { status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your marketing and sales campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Campaign
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Status: {statusFilter === 'all' ? 'All' : statusFilter}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              {['all', 'active', 'paused', 'completed'].map((status) => (
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
        {filteredCampaigns.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/campaigns/${campaign.id}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
              <Menu as="div" className="relative">
                <Menu.Button className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  <ChevronDown className="w-4 h-4 ml-1 inline-block" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {['active', 'paused', 'completed'].map((status) => (
                      <Menu.Item key={status}>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleStatusChange(campaign.id, status as Campaign['status']);
                            }}
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

            <p className="text-sm text-gray-500 mb-4">{campaign.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-lg font-medium text-gray-900">{campaign.metrics.totalLeads}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Qualified</p>
                <p className="text-lg font-medium text-gray-900">{campaign.metrics.qualifiedLeads}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{campaign.playbooks.length} playbooks</span>
                <span>{campaign.assets.length} assets</span>
                <span>${campaign.metrics.revenue.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCampaignCreate={handleCreateCampaign}
      />
    </div>
  );
}