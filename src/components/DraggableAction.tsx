import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Phone, Mail, MessageSquare, Book, GitBranch as BranchLeft, Settings, Bot } from 'lucide-react';
import type { ActionType, WorkflowAction } from '../types/workflow';

interface DraggableActionProps {
  action: WorkflowAction;
  isSelected: boolean;
  onSelect: (action: WorkflowAction) => void;
  onDelete: (id: string) => void;
  getBranchActions: (actionId: string, branchType: 'yes' | 'no') => string[];
}

export default function DraggableAction({ action, isSelected, onSelect, onDelete, getBranchActions }: DraggableActionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ActionIcon = ({ type }: { type: ActionType }) => {
    switch (type) {
      case 'voice':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5" />;
      case 'knowledge':
        return <Book className="w-5 h-5" />;
      case 'condition':
        return <BranchLeft className="w-5 h-5" />;
      case 'script':
        return <Settings className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div
        {...attributes}
        {...listeners}
        onClick={() => onSelect(action)}
        className={`flex items-center justify-between p-3 border rounded-lg cursor-move ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <ActionIcon type={action.type} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
            <p className="text-xs text-gray-500">
              {action.type === 'condition' ? 'Branch' : action.condition?.replace(/_/g, ' ')}
              {action.delay ? ` • ${action.delay}h delay` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(action.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {action.type === 'condition' && (
        <div className="ml-8 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BranchLeft className="w-4 h-4" />
            <span>Yes: {getBranchActions(action.id, 'yes').join(', ') || 'No actions'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BranchLeft className="w-4 h-4" />
            <span>No: {getBranchActions(action.id, 'no').join(', ') || 'No actions'}</span>
          </div>
        </div>
      )}
    </div>
  );
}