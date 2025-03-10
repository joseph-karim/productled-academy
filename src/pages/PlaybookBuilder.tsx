import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import { Plus, Save, Bot } from 'lucide-react';
import WorkflowNode from '../components/WorkflowNode';
import AddNodeModal from '../components/AddNodeModal';
import NodeConfiguration from '../components/NodeConfiguration';
import TriggerModal from '../components/TriggerModal';
import KnowledgeBaseModal from '../components/KnowledgeBaseModal';
import PlaybookMetrics from '../components/PlaybookMetrics';
import type { Playbook, PlaybookAction, ActionType, TriggerConfig } from '../types/playbook';
import { usePlaybook } from '../hooks/usePlaybook';
import { useKnowledgeBases } from '../hooks/useKnowledgeBases';
import 'reactflow/dist/style.css';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'workflowNode',
    position: { x: 250, y: 0 },
    data: {
      type: 'form_trigger',
      name: 'Form Submission Trigger',
      content: 'Trigger on form submission',
      category: 'form',
    },
  },
];

const initialEdges: Edge[] = [];

function PlaybookBuilderContent() {
  const { playbook, updatePlaybook, addAction, updateAction, removeAction, updateTrigger, addKnowledgeBase, removeKnowledgeBase, updateKnowledgeBasePriority } = usePlaybook();
  const { knowledgeBases } = useKnowledgeBases();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedAction, setSelectedAction] = useState<PlaybookAction | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds)),
    []
  );

  const handleActionUpdate = (updatedAction: PlaybookAction) => {
    updateAction(updatedAction.id, updatedAction);

    setNodes(prev => prev.map(node =>
      node.id === updatedAction.id
        ? {
            ...node,
            data: {
              ...node.data,
              name: updatedAction.name,
              content: updatedAction.content,
            },
          }
        : node
    ));
  };

  const handleActionDelete = (actionId: string) => {
    removeAction(actionId);
    setNodes(prev => prev.filter(node => node.id !== actionId));
    setEdges(prev => prev.filter(edge => 
      edge.source !== actionId && edge.target !== actionId
    ));
    setSelectedAction(null);
  };

  const handleActionAdd = (type: ActionType) => {
    const newAction: PlaybookAction = {
      id: Date.now().toString(),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: '',
    };

    const newNode: Node = {
      id: newAction.id,
      type: 'workflowNode',
      position: { x: 250, y: nodes.length * 150 },
      data: {
        type: newAction.type,
        name: newAction.name,
        content: newAction.content,
        onSelect: () => setSelectedAction(newAction),
      },
    };

    addAction(newAction);
    setNodes(prev => [...prev, newNode]);
    setSelectedAction(newAction);
  };

  const handleTriggerSet = (trigger: TriggerConfig) => {
    updateTrigger(trigger);

    setNodes(prev => prev.map(node => 
      node.id === 'trigger'
        ? {
            ...node,
            data: {
              ...node.data,
              name: trigger.name,
              content: `Trigger: ${trigger.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
            },
          }
        : node
    ));
  };

  const handleKnowledgeBasesUpdate = (kbs: { id: string; priority: number }[]) => {
    updatePlaybook({
      ...playbook,
      knowledgeBases: kbs
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{playbook.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{playbook.description}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsKnowledgeModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            <Bot className="w-4 h-4 mr-2" />
            Configure Knowledge
          </button>
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Configure Trigger
          </button>
          <button
            onClick={() => setIsAddNodeModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </button>
          <button
            onClick={() => {}}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Playbook
          </button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Trigger: {playbook.trigger.name}</h3>
            <p className="mt-1 text-sm text-blue-700">
              Type: {playbook.trigger.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </p>
          </div>
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
        {playbook.trigger.conditions?.rules.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-blue-900">Conditions:</p>
            <ul className="mt-1 text-sm text-blue-700">
              {playbook.trigger.conditions.rules.map((rule, index) => (
                <li key={index}>
                  {rule.field} {rule.operator} {rule.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {playbook.metrics && (
        <PlaybookMetrics metrics={playbook.metrics} />
      )}

      {playbook.handoffRules && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-violet-900">AI to Human Handoff Rules</h3>
              <div className="mt-2 space-y-2">
                {playbook.handoffRules.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 text-violet-700 mr-2"
                  >
                    {condition.type}: {condition.operator} {condition.value}
                  </div>
                ))}
              </div>
            </div>
            {playbook.handoffRules.targetTeam && (
              <div className="text-sm text-violet-700">
                Target Team: {playbook.handoffRules.targetTeam}
              </div>
            )}
          </div>
        </div>
      )}

      {playbook.owner && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Playbook Owner</h3>
              <p className="mt-1 text-sm text-blue-700">
                {playbook.owner.name} ({playbook.owner.role})
              </p>
            </div>
            <button
              onClick={() => setShowOwnerModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Change Owner
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-[600px] bg-white rounded-lg shadow">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        <div>
          <NodeConfiguration
            action={selectedAction}
            onUpdate={handleActionUpdate}
            onDelete={handleActionDelete}
          />
        </div>
      </div>

      <TriggerModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        onTriggerSet={handleTriggerSet}
      />

      <AddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => setIsAddNodeModalOpen(false)}
        onNodeAdd={handleActionAdd}
      />

      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        knowledgeBases={knowledgeBases}
        selectedKnowledgeBases={playbook.knowledgeBases || []}
        onKnowledgeBasesUpdate={handleKnowledgeBasesUpdate}
      />
    </div>
  );
}

export default function PlaybookBuilder() {
  return (
    <ReactFlowProvider>
      <PlaybookBuilderContent />
    </ReactFlowProvider>
  );
}