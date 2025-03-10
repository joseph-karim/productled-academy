import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { WorkflowAction, Variable, ApiHeader, ApiBodyValue, ApiOutputValue } from '../types/workflow';

interface NodeConfigurationProps {
  action: WorkflowAction | null;
  onUpdate: (action: WorkflowAction) => void;
  onDelete: (id: string) => void;
}

export default function NodeConfiguration({ action, onUpdate, onDelete }: NodeConfigurationProps) {
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({});
  const [newHeader, setNewHeader] = useState<Partial<ApiHeader>>({});
  const [newBodyValue, setNewBodyValue] = useState<Partial<ApiBodyValue>>({});
  const [newOutputValue, setNewOutputValue] = useState<Partial<ApiOutputValue>>({});

  if (!action) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Select a node to configure its settings
          </p>
        </div>
      </div>
    );
  }

  const renderSayConfig = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={action.content}
          onChange={(e) => onUpdate({ ...action, content: e.target.value })}
          rows={4}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter message text..."
        />
      </div>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="exactMessage"
          checked={action.exactMessage}
          onChange={(e) => onUpdate({ ...action, exactMessage: e.target.checked })}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="exactMessage" className="ml-2 text-sm text-gray-700">
          Use exact message (no AI variations)
        </label>
      </div>
    </>
  );

  const renderGatherConfig = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Variables to Collect</label>
          <button
            onClick={() => {
              if (newVariable.name && newVariable.type) {
                onUpdate({
                  ...action,
                  variables: [...(action.variables || []), newVariable as Variable]
                });
                setNewVariable({});
              }
            }}
            className="flex items-center px-2 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variable
          </button>
        </div>
        <div className="space-y-2">
          {action.variables?.map((variable, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
              <div className="flex-1">
                <div className="text-sm font-medium">{variable.name}</div>
                <div className="text-xs text-gray-500">{variable.description}</div>
              </div>
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                {variable.type}
              </div>
              {variable.required && (
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Required
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border rounded-md bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Add New Variable</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Variable name"
            value={newVariable.name || ''}
            onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
            className="block w-full px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Description"
            value={newVariable.description || ''}
            onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
            className="block w-full px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={newVariable.type || ''}
            onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as any })}
            className="block w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Select type...</option>
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={newVariable.required || false}
              onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="required" className="ml-2 text-sm text-gray-700">
              Required
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Condition Type</label>
        <select
          value={action.content}
          onChange={(e) => onUpdate({ ...action, content: e.target.value })}
          className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
        >
          <option value="ALL">ALL conditions must match</option>
          <option value="ANY">ANY condition must match</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logic Conditions</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <select className="block w-full px-3 py-2 border rounded-md text-sm">
              <option>Select field</option>
              <option>budget</option>
              <option>interest_level</option>
              <option>company_size</option>
            </select>
            <select className="block w-full px-3 py-2 border rounded-md text-sm">
              <option>Equals</option>
              <option>Greater than</option>
              <option>Less than</option>
              <option>Contains</option>
            </select>
            <input
              type="text"
              placeholder="Value"
              className="block w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
        <button className="mt-2 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
          Add Logic Condition
        </button>
      </div>
    </div>
  );

  const renderApiRequestConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">URL</label>
        <input
          type="url"
          value={action.url || ''}
          onChange={(e) => onUpdate({ ...action, url: e.target.value })}
          placeholder="https://"
          className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Method</label>
        <select
          value={action.method || 'GET'}
          onChange={(e) => onUpdate({ ...action, method: e.target.value as any })}
          className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Headers</label>
          <button className="flex items-center px-2 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-1" />
            Add Header
          </button>
        </div>
        <div className="space-y-2">
          {action.headers?.map((header, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
              <div className="flex-1">
                <div className="text-sm font-medium">{header.key}</div>
                <div className="text-xs text-gray-500">{header.value}</div>
              </div>
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                {header.type}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="async"
          checked={action.async}
          onChange={(e) => onUpdate({ ...action, async: e.target.checked })}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="async" className="ml-2 text-sm text-gray-700">
          Run in the background
        </label>
      </div>
    </div>
  );

  const renderTransferConfig = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
      <input
        type="tel"
        value={action.phoneNumber || ''}
        onChange={(e) => onUpdate({ ...action, phoneNumber: e.target.value })}
        placeholder="+1234567890"
        className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
      />
    </div>
  );

  const renderAIConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Prompt/Instructions</label>
        <textarea
          value={action.aiConfig?.prompt || ''}
          onChange={(e) => onUpdate({
            ...action,
            aiConfig: { ...action.aiConfig, prompt: e.target.value }
          })}
          rows={4}
          className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
          placeholder="Enter instructions for the AI..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <select
            value={action.aiConfig?.model || 'gpt-4'}
            onChange={(e) => onUpdate({
              ...action,
              aiConfig: { ...action.aiConfig, model: e.target.value }
            })}
            className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={action.aiConfig?.temperature || 0.7}
            onChange={(e) => onUpdate({
              ...action,
              aiConfig: { ...action.aiConfig, temperature: parseFloat(e.target.value) }
            })}
            className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderToolConfig = () => {
    switch (action.type) {
      case 'calendar_schedule':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
              <input
                type="text"
                value={action.toolConfig?.title || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, title: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                value={action.toolConfig?.duration || 30}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, duration: parseInt(e.target.value) }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={action.toolConfig?.description || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, description: e.target.value }
                })}
                rows={3}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
          </div>
        );

      case 'deal_room_create':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Deal Name</label>
              <input
                type="text"
                value={action.toolConfig?.dealName || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, dealName: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Participants</label>
              <input
                type="text"
                placeholder="Enter email addresses, separated by commas"
                value={action.toolConfig?.participants?.join(', ') || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: {
                    ...action.toolConfig,
                    participants: e.target.value.split(',').map(p => p.trim())
                  }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
          </div>
        );

      case 'jira_create':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Key</label>
              <input
                type="text"
                value={action.toolConfig?.projectKey || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, projectKey: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Type</label>
              <select
                value={action.toolConfig?.issueType || 'task'}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, issueType: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="story">Story</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={action.toolConfig?.priority || 'medium'}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, priority: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              >
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>
          </div>
        );

      case 'zendesk_ticket':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ticket Type</label>
              <select
                value={action.toolConfig?.ticketType || 'question'}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, ticketType: e.target.value }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              >
                <option value="question">Question</option>
                <option value="incident">Incident</option>
                <option value="problem">Problem</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={action.toolConfig?.priority || 'normal'}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: { ...action.toolConfig, priority: e.target.value as any }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <input
                type="text"
                placeholder="Enter tags, separated by commas"
                value={action.toolConfig?.tags?.join(', ') || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  toolConfig: {
                    ...action.toolConfig,
                    tags: e.target.value.split(',').map(t => t.trim())
                  }
                })}
                className="block w-full px-3 py-2 mt-1 border rounded-md text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Configure Node</h3>
        <button
          onClick={() => onDelete(action.id)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={action.name}
            onChange={(e) => onUpdate({ ...action, name: e.target.value })}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {action.type === 'say' && renderSayConfig()}
        {action.type === 'gather' && renderGatherConfig()}
        {action.type === 'condition' && renderConditionConfig()}
        {action.type === 'api_request' && renderApiRequestConfig()}
        {action.type === 'transfer' && renderTransferConfig()}
        {action.type.startsWith('ai_') && renderAIConfig()}
        {['calendar_schedule', 'deal_room_create', 'jira_create', 'zendesk_ticket'].includes(action.type) && renderToolConfig()}
      </div>
    </div>
  );
}