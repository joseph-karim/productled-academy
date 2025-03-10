import { nanoid } from 'nanoid';
import type { KnowledgeBase, Article } from './knowledge';

export type ActionType = 
  // Communication nodes
  | 'voice' 
  | 'email' 
  | 'sms' 
  | 'linkedin'
  // CRM nodes
  | 'crm_update'
  | 'crm_create'
  | 'crm_search'
  // Form nodes
  | 'form_trigger'
  | 'form_submit'
  // Flow control nodes
  | 'condition'
  | 'delay'
  | 'end'
  // Integration nodes
  | 'api_request'
  | 'webhook'
  // AI nodes
  | 'ai_research'
  | 'ai_summarize'
  | 'ai_extract'
  | 'ai_categorize'
  | 'ai_analyze_image'
  | 'ai_ask'
  // Tool nodes
  | 'calendar_schedule'
  | 'deal_room_create'
  | 'jira_create'
  | 'zendesk_ticket';

export type TriggerType = 
  // Form triggers
  | 'form_submission'
  | 'landing_page'
  | 'chat_widget'
  // Ad platform triggers
  | 'google_ads'
  | 'facebook_ads'
  | 'linkedin_ads'
  // CRM triggers
  | 'lead_created'
  | 'deal_stage_changed'
  | 'task_completed'
  // Email triggers
  | 'email_opened'
  | 'email_clicked'
  | 'email_bounced'
  // Website triggers
  | 'page_visited'
  | 'button_clicked'
  | 'form_abandoned'
  // Calendar triggers
  | 'meeting_scheduled'
  | 'meeting_canceled'
  // Custom triggers
  | 'webhook'
  | 'api_event'
  | 'custom_event';

export interface TriggerConfig {
  type: TriggerType;
  name: string;
  description?: string;
  conditions?: {
    type: 'ALL' | 'ANY';
    rules: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
      value: any;
    }>;
  };
}

export interface PlaybookAction {
  id: string;
  type: ActionType;
  name: string;
  content: string;
  category?: keyof typeof nodeCategories;
  aiConfig?: {
    prompt?: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    knowledgeBases?: string[]; // IDs of knowledge bases to use
    articles?: string[]; // IDs of specific articles to use
  };
}

export interface PlaybookMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  engagementRate: number;
  avgResponseTime: number;
  successRate: number;
  aiHandoffs: number;
  humanHandoffs: number;
  lastUpdated: string;
  timeline: Array<{
    date: string;
    metrics: {
      leads: number;
      qualified: number;
      engagement: number;
    };
  }>;
}

export interface PlaybookOwner {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedAt: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  actions: PlaybookAction[];
  knowledgeBases?: {
    id: string;
    priority: number; // Higher number means higher priority
  }[];
  created: string;
  updated: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  metrics?: PlaybookMetrics;
  owner?: PlaybookOwner;
  handoffRules?: {
    conditions: Array<{
      type: 'sentiment' | 'intent' | 'value' | 'complexity';
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
      value: string | number;
    }>;
    targetTeam?: string;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
  };
}

export const nodeCategories = {
  communication: {
    label: 'Communication',
    color: 'blue',
    types: ['voice', 'email', 'sms', 'linkedin']
  },
  crm: {
    label: 'CRM',
    color: 'green',
    types: ['crm_update', 'crm_create', 'crm_search']
  },
  form: {
    label: 'Forms',
    color: 'purple',
    types: ['form_trigger', 'form_submit']
  },
  flow: {
    label: 'Flow',
    color: 'orange',
    types: ['condition', 'delay', 'end']
  },
  integration: {
    label: 'Integration',
    color: 'pink',
    types: ['api_request', 'webhook']
  },
  ai: {
    label: 'AI Actions',
    color: 'violet',
    types: ['ai_research', 'ai_summarize', 'ai_extract', 'ai_categorize', 'ai_analyze_image', 'ai_ask']
  },
  tools: {
    label: 'Tools',
    color: 'teal',
    types: ['calendar_schedule', 'deal_room_create', 'jira_create', 'zendesk_ticket']
  }
} as const;

export const createPlaybook = (
  name: string,
  description: string,
  trigger: TriggerConfig
): Playbook => ({
  id: nanoid(),
  name,
  description,
  trigger,
  actions: [],
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  status: 'draft',
  version: 1
});

export const createPlaybookAction = (
  type: ActionType,
  name: string,
  content: string = ''
): PlaybookAction => ({
  id: nanoid(),
  type,
  name,
  content
});