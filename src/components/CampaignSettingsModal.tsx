import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Calendar, Target, X, Settings, Users, Database, DollarSign, Bot } from 'lucide-react';
import type { Campaign, CampaignTarget } from '../types/campaign';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onUpdate: (updates: Partial<Campaign>) => void;
}

export default function CampaignSettingsModal({
  isOpen,
  onClose,
  campaign,
  onUpdate
}: CampaignSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'integrations' | 'plan'>('general');
  const [startDate, setStartDate] = useState(campaign.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(campaign.endDate?.split('T')[0] || '');
  const [target, setTarget] = useState<CampaignTarget>(campaign.target);
  const [budget, setBudget] = useState(campaign.budget || {
    allocated: 0,
    spent: 0,
    remaining: 0,
    costPerLead: 0,
    costPerQualified: 0
  });
  const [integrations, setIntegrations] = useState({
    crm: {
      provider: 'hubspot',
      connected: true,
      syncFields: ['name', 'email', 'company', 'status'],
      lastSync: '2024-02-28T10:00:00Z'
    },
    calendar: {
      provider: 'google',
      connected: true,
      settings: {
        defaultDuration: 30,
        buffer: 15
      }
    },
    messaging: {
      provider: 'twilio',
      connected: false
    }
  });

  const handleSave = () => {
    onUpdate({
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      target,
      budget
    });
    onClose();
  };

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="flex">
                  <div className="w-48 bg-gray-50 p-6 border-r border-gray-200">
                    <nav className="space-y-2">
                      <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'general' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>General</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('team')}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Team</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('integrations')}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'integrations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Database className="w-4 h-4" />
                        <span>Integrations</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'plan' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Plan & Billing</span>
                      </button>
                    </nav>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Campaign Settings
                      </Dialog.Title>
                      <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {activeTab === 'general' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Campaign Timeline</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                End Date (Optional)
                              </label>
                              <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Target Audience</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Industries
                              </label>
                              <select
                                multiple
                                value={target.industry}
                                onChange={(e) => setTarget({
                                  ...target,
                                  industry: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="Software">Software</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Manufacturing">Manufacturing</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Company Size
                              </label>
                              <select
                                multiple
                                value={target.companySize}
                                onChange={(e) => setTarget({
                                  ...target,
                                  companySize: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="1-50">1-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="501-1000">501-1000</option>
                                <option value="1000+">1000+</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Regions
                              </label>
                              <select
                                multiple
                                value={target.region}
                                onChange={(e) => setTarget({
                                  ...target,
                                  region: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="North America">North America</option>
                                <option value="Europe">Europe</option>
                                <option value="Asia Pacific">Asia Pacific</option>
                                <option value="Latin America">Latin America</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'team' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Import from CRM</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Database className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">HubSpot Teams</p>
                                  <p className="text-sm text-gray-500">Import team structure from HubSpot</p>
                                </div>
                              </div>
                              <button className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100">
                                Import
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Team Members</h4>
                          <div className="space-y-4">
                            {campaign.team.members.map((member, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                  <p className="text-sm text-gray-500">{member.role}</p>
                                </div>
                                <button className="text-sm text-red-600 hover:text-red-700">
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100">
                              <Users className="w-4 h-4 mr-2" />
                              Add Team Member
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'integrations' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">CRM Integration</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Database className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">HubSpot</p>
                                  <p className="text-sm text-gray-500">Connected • Last sync: 5m ago</p>
                                </div>
                              </div>
                              <button className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                                Connected
                              </button>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Sync Fields
                              </label>
                              <select
                                multiple
                                value={integrations.crm.syncFields}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="company">Company</option>
                                <option value="status">Status</option>
                                <option value="source">Source</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Calendar Integration</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Google Calendar</p>
                                  <p className="text-sm text-gray-500">Connected</p>
                                </div>
                              </div>
                              <button className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                                Connected
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Default Meeting Duration
                                </label>
                                <select
                                  value={integrations.calendar.settings.defaultDuration}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="15">15 minutes</option>
                                  <option value="30">30 minutes</option>
                                  <option value="45">45 minutes</option>
                                  <option value="60">60 minutes</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Meeting Buffer
                                </label>
                                <select
                                  value={integrations.calendar.settings.buffer}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="0">No buffer</option>
                                  <option value="5">5 minutes</option>
                                  <option value="10">10 minutes</option>
                                  <option value="15">15 minutes</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">AI Integration</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Bot className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">AI Assistant</p>
                                  <p className="text-sm text-gray-500">Configure AI behavior and responses</p>
                                </div>
                              </div>
                              <button className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100">
                                Configure
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'plan' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Budget & Costs</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Total Budget
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  value={budget.allocated}
                                  onChange={(e) => setBudget({ ...budget, allocated: parseInt(e.target.value) })}
                                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Cost per Qualified Lead
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  value={budget.costPerQualified}
                                  onChange={(e) => setBudget({ ...budget, costPerQualified: parseInt(e.target.value) })}
                                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Qualification Criteria</h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Demo Completion</h5>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked
                                  />
                                  <label className="ml-2 text-sm text-gray-700">
                                    Require product demo completion
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked
                                  />
                                  <label className="ml-2 text-sm text-gray-700">
                                    Technical requirements discussed
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Consultation</h5>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked
                                  />
                                  <label className="ml-2 text-sm text-gray-700">
                                    Complete needs assessment
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked
                                  />
                                  <label className="ml-2 text-sm text-gray-700">
                                    Budget confirmation
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                        Save Changes
                      </button>
                    </div>
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