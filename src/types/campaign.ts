import { nanoid } from 'nanoid';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CampaignType = 'outbound' | 'inbound' | 'nurture' | 'event' | 'product_launch';

export interface CampaignTarget {
  industry?: string[];
  companySize?: string[];
  region?: string[];
  jobTitles?: string[];
  budget?: {
    min?: number;
    max?: number;
  };
  customFilters?: Record<string, any>;
}

export interface CampaignMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  meetings: number;
  opportunities: number;
  revenue: number;
  engagementRate: number;
  responseRate: number;
  conversionRate: number;
  timeline: Array<{
    date: string;
    metrics: {
      leads: number;
      qualified: number;
      meetings: number;
      opportunities: number;
    };
  }>;
}

export interface CampaignPlaybook {
  id: string;
  name: string;
  status: 'active' | 'paused';
  metrics?: {
    totalLeads: number;
    qualifiedLeads: number;
    successRate: number;
  };
}

export interface CampaignAsset {
  id: string;
  name: string;
  type: string;
  usage: {
    views: number;
    shares: number;
    downloads: number;
  };
}

export interface CampaignTeam {
  owner: {
    id: string;
    name: string;
    role: string;
  };
  members: Array<{
    id: string;
    name: string;
    role: string;
    assignments?: number;
  }>;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  budget?: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  target: CampaignTarget;
  metrics: CampaignMetrics;
  playbooks: CampaignPlaybook[];
  assets: CampaignAsset[];
  team: CampaignTeam;
  leads: string[]; // Lead IDs
  created: string;
  updated: string;
  tags: string[];
}

export const createCampaign = (
  name: string,
  description: string,
  type: CampaignType,
  startDate: string,
  target: CampaignTarget,
  owner: { id: string; name: string; role: string }
): Campaign => ({
  id: nanoid(),
  name,
  description,
  type,
  status: 'draft',
  startDate,
  target,
  metrics: {
    totalLeads: 0,
    qualifiedLeads: 0,
    meetings: 0,
    opportunities: 0,
    revenue: 0,
    engagementRate: 0,
    responseRate: 0,
    conversionRate: 0,
    timeline: []
  },
  playbooks: [],
  assets: [],
  team: {
    owner,
    members: []
  },
  leads: [],
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  tags: []
});