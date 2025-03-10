import { Handle, Position, NodeProps } from 'reactflow';
import { Phone, Mail, MessageSquare, FileText, GitBranch, Clock, X, 
         Webhook, Database, Search, PlusCircle, FormInput, Send, Linkedin } from 'lucide-react';
import type { ActionType } from '../types/workflow';
import { nodeCategories } from '../types/workflow';

interface WorkflowNodeData {
  type: ActionType;
  name: string;
  content: string;
  category?: keyof typeof nodeCategories;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ActionIcon = ({ type }: { type: ActionType }) => {
  switch (type) {
    // Communication
    case 'voice': return <Phone className="w-5 h-5" />;
    case 'email': return <Mail className="w-5 h-5" />;
    case 'sms': return <MessageSquare className="w-5 h-5" />;
    case 'linkedin': return <Linkedin className="w-5 h-5" />;
    
    // CRM
    case 'crm_update': return <Database className="w-5 h-5" />;
    case 'crm_create': return <PlusCircle className="w-5 h-5" />;
    case 'crm_search': return <Search className="w-5 h-5" />;
    
    // Form
    case 'form_trigger': return <FormInput className="w-5 h-5" />;
    case 'form_submit': return <Send className="w-5 h-5" />;
    
    // Flow
    case 'condition': return <GitBranch className="w-5 h-5" />;
    case 'delay': return <Clock className="w-5 h-5" />;
    case 'end': return <X className="w-5 h-5" />;
    
    // Integration
    case 'api_request': return <Send className="w-5 h-5" />;
    case 'webhook': return <Webhook className="w-5 h-5" />;
    
    default: return <FileText className="w-5 h-5" />;
  }
};

const getCategoryStyles = (type: ActionType) => {
  const category = Object.entries(nodeCategories).find(([_, cat]) => 
    cat.types.includes(type)
  )?.[0] as keyof typeof nodeCategories;

  if (!category) return {};

  const colorMap = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  return {
    wrapper: colorMap[nodeCategories[category].color],
    icon: `text-${nodeCategories[category].color}-600`
  };
};

export default function WorkflowNode({ data, isConnectable }: NodeProps<WorkflowNodeData>) {
  const styles = getCategoryStyles(data.type);
  
  return (
    <div
      className={`px-4 py-2 shadow-lg rounded-lg border ${
        data.isSelected ? 'ring-2 ring-blue-500' : ''
      } ${styles.wrapper || 'bg-white border-gray-200'}`}
      onClick={data.onSelect}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-gray-300"
      />
      
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${styles.icon || 'text-gray-600'}`}>
          <ActionIcon type={data.type} />
        </div>
        <div>
          <div className="font-medium text-sm">{data.name}</div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]">
            {data.content}
          </div>
        </div>
      </div>

      {data.type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: '25%' }}
            isConnectable={isConnectable}
            className="!bg-green-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: '75%' }}
            isConnectable={isConnectable}
            className="!bg-red-500"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="!bg-gray-300"
        />
      )}
    </div>
  );
}