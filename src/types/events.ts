export type EventType = 'voice' | 'email' | 'sms' | 'ai';

export interface CRMInfo {
  id: string;
  type: 'lead' | 'contact' | 'opportunity';
  stage?: string;
  value?: number;
  owner?: string;
  lastActivity?: string;
  nextAction?: string;
}

export interface ModuleInfo {
  campaign?: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  playbook?: {
    id: string;
    name: string;
    stage: string;
  };
  dealRoom?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface Event {
  id: number;
  type: EventType;
  contact: string;
  company: string;
  duration?: string;
  status: string;
  outcome: string;
  timestamp: string;
  details: string;
  aiAssisted: boolean;
  content?: {
    subject?: string;
    body?: string;
    attachments?: Array<{ name: string; url: string }>;
  };
  crm?: CRMInfo;
  module?: ModuleInfo;
  aiNotes?: Array<{
    type: 'sentiment' | 'action_item' | 'summary';
    content: string;
  }>;
  recording?: {
    url: string;
    transcript: Array<{
      speaker: 'agent' | 'contact';
      timestamp: string;
      text: string;
    }>;
  };
  crmUpdates?: Array<{
    field: string;
    value: string;
    timestamp: string;
  }>;
}