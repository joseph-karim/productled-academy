import { useState } from 'react';
import { Save, Database, Calendar, Bot, Users, DollarSign, Mail, MessageSquare, Link as LinkIcon, Plus, X } from 'lucide-react';

interface IntegrationState {
  provider: string;
  connected: boolean;
  status?: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

interface IntegrationsState {
  crm: IntegrationState;
  calendar: IntegrationState;
  email: IntegrationState;
  sms: IntegrationState;
  ai: IntegrationState;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showConfigureModal, setShowConfigureModal] = useState<keyof IntegrationsState | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsState>({
    crm: {
      provider: 'hubspot',
      connected: true,
      status: 'Connected',
      lastSync: '5m ago',
      settings: {
        syncFields: ['name', 'email', 'company', 'status']
      }
    },
    calendar: {
      provider: 'google',
      connected: true,
      status: 'Connected',
      settings: {
        defaultDuration: 30,
        buffer: 15
      }
    },
    email: {
      provider: 'sendgrid',
      connected: false,
      status: 'Not configured'
    },
    sms: {
      provider: 'twilio',
      connected: false,
      status: 'Not configured'
    },
    ai: {
      provider: 'openai',
      connected: false,
      status: 'Not configured',
      settings: {
        model: 'gpt-4',
        temperature: 0.7
      }
    }
  });

  const handleConnect = async (service: keyof IntegrationsState) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        connected: true,
        status: 'Connected',
        lastSync: service === 'crm' ? 'Just now' : undefined
      }
    }));
  };

  const handleDisconnect = async (service: keyof IntegrationsState) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        connected: false,
        status: 'Not configured',
        lastSync: undefined
      }
    }));
  };

  const handleConfigure = (service: keyof IntegrationsState) => {
    setShowConfigureModal(service);
  };

  const renderIntegrationCard = (
    service: keyof IntegrationsState,
    title: string,
    description: string,
    Icon: typeof Database
  ) => {
    const integration = integrations[service];
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${integration.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${integration.connected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">
                {integration.connected ? (
                  <>
                    {integration.status}
                    {integration.lastSync && ` • Last sync: ${integration.lastSync}`}
                  </>
                ) : (
                  description
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {integration.connected ? (
              <>
                <button
                  onClick={() => handleConfigure(service)}
                  className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  Configure
                </button>
                <button
                  onClick={() => handleDisconnect(service)}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect(service)}
                className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="flex space-x-6">
        <div className="w-64 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'general' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Team Management
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'integrations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'plan' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Plan & Billing
          </button>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'integrations' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CRM Integration</h3>
                  {renderIntegrationCard(
                    'crm',
                    'HubSpot',
                    'Connect your CRM to sync contacts and deals',
                    Database
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar Integration</h3>
                  {renderIntegrationCard(
                    'calendar',
                    'Google Calendar',
                    'Connect your calendar for meeting scheduling',
                    Calendar
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Communication</h3>
                  <div className="space-y-4">
                    {renderIntegrationCard(
                      'email',
                      'Email Service',
                      'Configure email sending service',
                      Mail
                    )}
                    {renderIntegrationCard(
                      'sms',
                      'SMS Provider',
                      'Configure SMS messaging service',
                      MessageSquare
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h3>
                  {renderIntegrationCard(
                    'ai',
                    'AI Assistant',
                    'Configure AI behavior and responses',
                    Bot
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfigureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Configure {showConfigureModal.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowConfigureModal(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {showConfigureModal === 'crm' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sync Fields
                    </label>
                    <select
                      multiple
                      value={integrations.crm.settings?.syncFields}
                      onChange={(e) => {
                        const selectedFields = Array.from(e.target.selectedOptions, option => option.value);
                        setIntegrations(prev => ({
                          ...prev,
                          crm: {
                            ...prev.crm,
                            settings: {
                              ...prev.crm.settings,
                              syncFields: selectedFields
                            }
                          }
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="company">Company</option>
                      <option value="status">Status</option>
                      <option value="source">Source</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sync Frequency
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                    </select>
                  </div>
                </>
              )}

              {showConfigureModal === 'calendar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Meeting Duration
                    </label>
                    <select
                      value={integrations.calendar.settings?.defaultDuration}
                      onChange={(e) => {
                        setIntegrations(prev => ({
                          ...prev,
                          calendar: {
                            ...prev.calendar,
                            settings: {
                              ...prev.calendar.settings,
                              defaultDuration: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
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
                      value={integrations.calendar.settings?.buffer}
                      onChange={(e) => {
                        setIntegrations(prev => ({
                          ...prev,
                          calendar: {
                            ...prev.calendar,
                            settings: {
                              ...prev.calendar.settings,
                              buffer: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="0">No buffer</option>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                    </select>
                  </div>
                </>
              )}

              {showConfigureModal === 'ai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      AI Model
                    </label>
                    <select
                      value={integrations.ai.settings?.model}
                      onChange={(e) => {
                        setIntegrations(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            settings: {
                              ...prev.ai.settings,
                              model: e.target.value
                            }
                          }
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Temperature
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={integrations.ai.settings?.temperature}
                      onChange={(e) => {
                        setIntegrations(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            settings: {
                              ...prev.ai.settings,
                              temperature: parseFloat(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="mt-1 block w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>More Focused</span>
                      <span>More Creative</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConfigureModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfigureModal(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}