import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Calendar, TrendingUp, Bot, FileText, Plus, Settings, ChevronDown } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAssets } from '../hooks/useAssets';
import AssetGallery from '../components/AssetGallery';
import CampaignTeamModal from '../components/CampaignTeamModal';
import CampaignSettingsModal from '../components/CampaignSettingsModal';
import type { Campaign } from '../types/campaign';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaigns();
  const { assets } = useAssets();
  const [activeTab, setActiveTab] = useState<'overview' | 'playbooks' | 'assets' | 'leads'>('overview');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return <div>Campaign not found</div>;

  const campaignAssets = assets.filter(asset =>
    campaign.assets.some(campaignAsset => campaignAsset.id === asset.id)
  );

  const handleTeamUpdate = (updatedTeam: Campaign['team']) => {
    updateCampaign(campaign.id, { team: updatedTeam });
  };

  const handleStatusChange = (status: Campaign['status']) => {
    updateCampaign(campaign.id, { status });
  };

  const handleSettingsUpdate = (updates: Partial<Campaign>) => {
    updateCampaign(campaign.id, updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
            <Menu as="div" className="relative">
              <Menu.Button className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                <ChevronDown className="w-4 h-4 ml-1 inline-block" />
              </Menu.Button>
              <Menu.Items className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {['active', 'paused', 'completed'].map((status) => (
                    <Menu.Item key={status}>
                      {({ active }) => (
                        <button
                          onClick={() => handleStatusChange(status as Campaign['status'])}
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
          <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Team
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('playbooks')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'playbooks'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Playbooks
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'assets'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assets
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'leads'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Leads
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{campaign.metrics.totalLeads}</p>
                  <p className="mt-1 text-sm text-blue-600">{campaign.metrics.engagementRate}% engagement</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Qualified Leads</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{campaign.metrics.qualifiedLeads}</p>
                  <p className="mt-1 text-sm text-green-600">{campaign.metrics.conversionRate}% conversion</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Meetings</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{campaign.metrics.meetings}</p>
                  <p className="mt-1 text-sm text-purple-600">{campaign.metrics.responseRate}% response rate</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">${campaign.metrics.revenue.toLocaleString()}</p>
                  <p className="mt-1 text-sm text-orange-600">{campaign.metrics.opportunities} opportunities</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Qualification Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={campaign.metrics.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="metrics.qualified" 
                      name="Qualified Leads"
                      stroke="#16a34a" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="metrics.leads" 
                      name="Total Leads"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Metrics</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaign.metrics.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="metrics.meetings" 
                      name="Meetings" 
                      fill="#8b5cf6" 
                    />
                    <Bar 
                      dataKey="metrics.opportunities" 
                      name="Opportunities" 
                      fill="#f59e0b" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Playbooks</h3>
              <div className="space-y-4">
                {campaign.playbooks.map(playbook => (
                  <div key={playbook.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-violet-600" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{playbook.name}</h4>
                        <p className="text-xs text-gray-500">
                          {playbook.metrics?.qualifiedLeads} qualified leads
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      playbook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {playbook.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Assets</h3>
              <div className="space-y-4">
                {campaign.assets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{asset.name}</h4>
                        <p className="text-xs text-gray-500">
                          {asset.usage.views} views • {asset.usage.shares} shares
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Team</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Owner</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        {campaign.team.owner.name}
                      </p>
                    </div>
                    <span className="text-sm text-blue-700">{campaign.team.owner.role}</span>
                  </div>
                </div>
                {campaign.team.members.map(member => (
                  <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {member.assignments && (
                        <span className="text-sm text-gray-500">
                          {member.assignments} assignments
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playbooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Campaign Playbooks</h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Playbook
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {campaign.playbooks.map(playbook => (
              <div key={playbook.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-violet-600" />
                    <h4 className="text-lg font-medium text-gray-900">{playbook.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${
                    playbook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {playbook.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-500">Total Leads</h5>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{playbook.metrics?.totalLeads}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-500">Qualified</h5>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{playbook.metrics?.qualifiedLeads}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-500">Success Rate</h5>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{playbook.metrics?.successRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Campaign Assets</h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>

          <AssetGallery assets={campaignAssets} />
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Campaign Leads</h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaign.leads.map((leadId, index) => (
                  <tr key={leadId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">John Doe</div>
                      <div className="text-sm text-gray-500">Tech Corp</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Qualified
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2h ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">85</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CampaignTeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        team={campaign.team}
        onTeamUpdate={handleTeamUpdate}
      />

      <CampaignSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        campaign={campaign}
        onUpdate={handleSettingsUpdate}
      />
    </div>
  );
}