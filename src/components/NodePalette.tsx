import { DragEvent } from 'react';
import { Phone, Mail, MessageSquare, Book, GitBranch, Settings, Bot } from 'lucide-react';
import type { ActionType } from '../types/workflow';

interface NodePaletteProps {
  onNodeAdd: (type: ActionType) => void;
}

const nodeTypes: Array<{
  type: ActionType;
  label: string;
  description: string;
  icon: typeof Phone;
}> = [
  {
    type: 'say',
    label: 'Say',
    description: 'Output a message to the user',
    icon: MessageSquare
  },
  {
    type: 'gather',
    label: 'Gather',
    description: 'Collect input from the user',
    icon: Mail
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on conditions',
    icon: GitBranch
  },
  {
    type: 'api_request',
    label: 'API Request',
    description: 'Make external API calls',
    icon: Settings
  },
  {
    type: 'transfer',
    label: 'Transfer',
    description: 'Transfer call to another number',
    icon: Phone
  },
  {
    type: 'hangup',
    label: 'Hangup',
    description: 'End the conversation',
    icon: Bot
  }
];

export default function NodePalette({ onNodeAdd }: NodePaletteProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: ActionType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-sm font-medium text-gray-900">Available Nodes</h3>
      <div className="space-y-2">
        {nodeTypes.map(({ type, label, description, icon: Icon }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            className="flex items-start p-3 space-x-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50"
          >
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}