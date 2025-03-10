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

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Variable {
  name: string;
  description: string;
  type: DataType;
  required: boolean;
  default?: string;
}

export interface ApiHeader {
  key: string;
  value: string;
  type: string;
}

export interface ApiBodyValue {
  key: string;
  value: string;
  type: string;
}

export interface ApiOutputValue {
  key: string;
  target: string;
  type: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface CrmField {
  field: string;
  value: string;
  operation?: 'set' | 'increment' | 'decrement' | 'append' | 'remove';
}

export interface AIConfig {
  prompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  systemPrompt?: string;
}

export interface ToolConfig {
  // Calendar
  attendees?: string[];
  duration?: number;
  title?: string;
  description?: string;
  
  // Deal Room
  dealName?: string;
  participants?: string[];
  documents?: string[];
  
  // Jira
  projectKey?: string;
  issueType?: string;
  priority?: string;
  assignee?: string;
  
  // Zendesk
  ticketType?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
}

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
  // Form specific
  formId?: string;
  formFields?: string[];
  // Ad platform specific
  adAccount?: string;
  campaignId?: string;
  // CRM specific
  objectType?: string;
  stageFrom?: string;
  stageTo?: string;
  // Website specific
  pageUrl?: string;
  buttonId?: string;
  // Calendar specific
  calendarId?: string;
  // Custom specific
  webhookUrl?: string;
  apiEndpoint?: string;
  eventName?: string;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  content: string;
  category?: 'communication' | 'crm' | 'form' | 'flow' | 'integration';
  
  // Communication nodes
  template?: string;
  subject?: string;
  from?: string;
  to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
  
  // Form nodes
  formId?: string;
  fields?: FormField[];
  submitUrl?: string;
  
  // CRM nodes
  crmType?: 'contact' | 'lead' | 'opportunity' | 'account';
  crmFields?: CrmField[];
  
  // Flow control
  condition?: string;
  branches?: {
    yes?: string[];
    no?: string[];
  };
  delayMinutes?: number;
  
  // Integration
  url?: string;
  method?: HttpMethod;
  headers?: ApiHeader[];
  bodyValues?: ApiBodyValue[];
  outputValues?: ApiOutputValue[];
  async?: boolean;

  // AI Configuration
  aiConfig?: AIConfig;
  
  // Tool Configuration
  toolConfig?: ToolConfig;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  actions: WorkflowAction[];
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