import { nanoid } from 'nanoid';

export type ResourceType = 'document' | 'video' | 'presentation' | 'link';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  added: string;
  addedBy?: string;
}

export interface Task {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  dependencies: string[];
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Participant {
  email: string;
  role: string;
  lastActive: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  stage: string;
  value: number;
  participants: Participant[];
  notes: Note[];
  resources: Resource[];
  actionPlan: Task[];
}

export const createResource = (
  name: string,
  type: ResourceType,
  url: string,
  addedBy?: string
): Resource => ({
  id: nanoid(),
  name,
  type,
  url,
  added: new Date().toISOString(),
  addedBy,
});

export const createTask = (
  task: string,
  assignee: string,
  dueDate: string,
  dependencies: string[] = []
): Task => ({
  id: nanoid(),
  task,
  assignee,
  dueDate,
  status: 'pending',
  dependencies,
  completed: false,
});

export const createNote = (content: string, author: string): Note => ({
  id: nanoid(),
  content,
  author,
  timestamp: new Date().toISOString(),
});

export const createParticipant = (email: string, role: string): Participant => ({
  email,
  role,
  lastActive: new Date().toISOString(),
});