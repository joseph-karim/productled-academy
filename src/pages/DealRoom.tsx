import { useState } from 'react';
import { FileText, MessageSquare, Calendar, Link as LinkIcon, Plus, Download, ExternalLink, Share2, Video, PresentationIcon, CheckSquare, UserPlus, Square, ChevronDown } from 'lucide-react';
import { Menu } from '@headlessui/react';

type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed';

interface Task {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  dependencies: string[];
  completed: boolean;
}

const initialDeal = {
  id: '1',
  name: 'Enterprise License Q1',
  company: 'Tech Corp',
  stage: 'Qualification',
  value: 50000,
  participants: [
    { email: 'john@techcorp.com', role: 'Decision Maker', lastActive: '2h ago' },
    { email: 'sarah@techcorp.com', role: 'Technical Lead', lastActive: '1d ago' }
  ],
  notes: [
    {
      id: '1',
      content: 'Technical requirements discussed - need API documentation',
      author: 'AI Assistant',
      timestamp: '2024-02-28T14:30:00Z',
    },
    {
      id: '2',
      content: 'Pricing concerns addressed, showing positive interest',
      author: 'John Doe',
      timestamp: '2024-02-27T10:15:00Z',
    }
  ],
  resources: [
    {
      id: '1',
      name: 'Technical Specification',
      type: 'document',
      url: '#',
      added: '2024-02-28',
    },
    {
      id: '2',
      name: 'Product Demo',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      added: '2024-02-27',
    },
    {
      id: '3',
      name: 'Solution Overview',
      type: 'presentation',
      url: 'https://docs.google.com/presentation/d/e/2PACX...',
      added: '2024-02-26',
    }
  ],
  actionPlan: [
    {
      id: '1',
      task: 'Technical demo with engineering team',
      assignee: 'john@techcorp.com',
      dueDate: '2024-03-01T15:00:00Z',
      status: 'pending',
      dependencies: [],
      completed: false,
    },
    {
      id: '2',
      task: 'Review security documentation',
      assignee: 'sarah@techcorp.com',
      dueDate: '2024-03-02T10:00:00Z',
      status: 'in_progress',
      dependencies: ['1'],
      completed: false,
    },
    {
      id: '3',
      task: 'Finalize commercial terms',
      assignee: 'john@techcorp.com',
      dueDate: '2024-03-05T10:00:00Z',
      status: 'pending',
      dependencies: ['1', '2'],
      completed: false,
    }
  ]
};

export default function DealRoom() {
  const [activeTab, setActiveTab] = useState('action-plan');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [deal, setDeal] = useState(initialDeal);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    task: '',
    assignee: '',
    dueDate: '',
    status: 'pending',
    dependencies: [],
  });

  const toggleTaskCompletion = (taskId: string) => {
    setDeal(prevDeal => ({
      ...prevDeal,
      actionPlan: prevDeal.actionPlan.map(task => {
        if (task.id === taskId) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            status: completed ? 'completed' : task.status === 'completed' ? 'pending' : task.status
          };
        }
        return task;
      })
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setDeal(prevDeal => ({
      ...prevDeal,
      actionPlan: prevDeal.actionPlan.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status,
            completed: status === 'completed'
          };
        }
        return task;
      })
    }));
  };

  const addNewTask = () => {
    if (!newTask.task || !newTask.assignee || !newTask.dueDate) return;

    const task: Task = {
      id: Date.now().toString(),
      task: newTask.task,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      status: newTask.status as TaskStatus,
      dependencies: newTask.dependencies || [],
      completed: false,
    };

    setDeal(prevDeal => ({
      ...prevDeal,
      actionPlan: [...prevDeal.actionPlan, task]
    }));

    setNewTask({
      task: '',
      assignee: '',
      dueDate: '',
      status: 'pending',
      dependencies: [],
    });
    setShowAddTaskModal(false);
  };

  const completedTasks = deal.actionPlan.filter(task => task.completed).length;
  const totalTasks = deal.actionPlan.length;
  const completionPercentage = (completedTasks / totalTasks) * 100;

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionPlan = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Mutual Action Plan</h3>
        <button 
          onClick={() => setShowAddTaskModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      <div className="space-y-4">
        {deal.actionPlan.map((task) => (
          <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="mt-1 p-0.5 rounded hover:bg-gray-100"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.task}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Assigned to: {task.assignee} • Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  {task.dependencies.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Dependencies: {task.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(task.status)}`}>
                  {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {['pending', 'in_progress', 'blocked', 'completed'].map((status) => (
                      <Menu.Item key={status}>
                        {({ active }) => (
                          <button
                            onClick={() => updateTaskStatus(task.id, status as TaskStatus)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedTasks}/{totalTasks} tasks completed</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderAddTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={newTask.task}
              onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
              placeholder="Enter task description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select assignee</option>
              {deal.participants.map((participant, index) => (
                <option key={index} value={participant.email}>
                  {participant.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependencies
            </label>
            <select
              multiple
              value={newTask.dependencies}
              onChange={(e) => setNewTask({
                ...newTask,
                dependencies: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {deal.actionPlan.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.task}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddTaskModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={addNewTask}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{deal.name}</h2>
          <p className="text-gray-500">{deal.company}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Deal Room
          </button>
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            ${deal.value.toLocaleString()}
          </span>
          <span className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
            {deal.stage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="flex space-x-4 px-6 py-3 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'resources'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab('action-plan')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'action-plan'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mutual Action Plan
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Notes & Updates
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Shared Resources</h3>
                    <button
                      onClick={() => setShowAddResourceModal(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Resource
                    </button>
                  </div>

                  <div className="space-y-4">
                    {deal.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          {resource.type === 'document' && <FileText className="w-5 h-5 mr-3 text-gray-400" />}
                          {resource.type === 'video' && <Video className="w-5 h-5 mr-3 text-gray-400" />}
                          {resource.type === 'presentation' && <PresentationIcon className="w-5 h-5 mr-3 text-gray-400" />}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{resource.name}</h4>
                            <p className="text-sm text-gray-500">Added {resource.added}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-500">
                            <Share2 className="w-4 h-4" />
                          </button>
                          {resource.type === 'document' ? (
                            <button className="p-2 text-gray-400 hover:text-blue-500">
                              <Download className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="p-2 text-gray-400 hover:text-blue-500">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Resource Preview</h4>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={deal.resources[1].url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'action-plan' && renderActionPlan()}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      Add Note
                    </button>
                  </div>

                  <div className="space-y-4">
                    {deal.notes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{note.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Participants</h3>
            <div className="space-y-4">
              {deal.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{participant.email}</p>
                    <p className="text-xs text-gray-500">{participant.role}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    Active {participant.lastActive}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Participant
              </button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Deal Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Resources Shared</span>
                  <span>{deal.resources.length}/5</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/5 h-2 bg-blue-600 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Action Items</span>
                  <span>{completedTasks}/{totalTasks}</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                Technical evaluation phase is progressing well
              </div>
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                High engagement from technical stakeholders
              </div>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm">
                Consider scheduling security review next week
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Deal Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Participant
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Link
                </label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-500 truncate flex-1">
                    https://deal-room.com/d/abc123
                  </span>
                  <button className="text-blue-600 hover:text-blue-700">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Resource</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Document</option>
                  <option>Video</option>
                  <option>Presentation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter resource title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL or File
                </label>
                <input
                  type="text"
                  placeholder="Enter URL or upload file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Add Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTaskModal && renderAddTaskModal()}
    </div>
  );
}