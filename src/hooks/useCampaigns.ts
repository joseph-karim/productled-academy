import { useState } from 'react';
import type { Campaign, CampaignPlaybook, CampaignAsset } from '../types/campaign';

const mockCampaigns: Campaign[] = [
  {
    id: 'enterprise-q1',
    name: 'Enterprise Q1 Outreach',
    description: 'Q1 outbound campaign targeting enterprise software companies',
    type: 'outbound',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-03-31T00:00:00Z',
    budget: {
      allocated: 50000,
      spent: 25000,
      remaining: 25000
    },
    target: {
      industry: ['Software', 'Technology'],
      companySize: ['500-1000', '1000+'],
      region: ['North America', 'Europe'],
      jobTitles: ['CTO', 'VP Engineering', 'Director of Engineering']
    },
    metrics: {
      totalLeads: 150,
      qualifiedLeads: 45,
      meetings: 28,
      opportunities: 12,
      revenue: 180000,
      engagementRate: 35,
      responseRate: 22,
      conversionRate: 8,
      timeline: [
        {
          date: '2024-01-15T00:00:00Z',
          metrics: {
            leads: 50,
            qualified: 15,
            meetings: 8,
            opportunities: 3
          }
        },
        {
          date: '2024-02-15T00:00:00Z',
          metrics: {
            leads: 100,
            qualified: 30,
            meetings: 20,
            opportunities: 9
          }
        }
      ]
    },
    playbooks: [
      {
        id: 'pb1',
        name: 'Enterprise Qualification',
        status: 'active',
        metrics: {
          totalLeads: 80,
          qualifiedLeads: 28,
          successRate: 35
        }
      }
    ],
    assets: [
      {
        id: 'sales-deck',
        name: 'Enterprise Sales Deck 2024',
        type: 'presentation',
        usage: {
          views: 245,
          shares: 34,
          downloads: 82
        }
      }
    ],
    team: {
      owner: {
        id: 'user1',
        name: 'Sarah Wilson',
        role: 'Campaign Manager'
      },
      members: [
        {
          id: 'user2',
          name: 'Mike Brown',
          role: 'Sales Development',
          assignments: 45
        }
      ]
    },
    leads: ['lead1', 'lead2', 'lead3'],
    created: '2023-12-15T00:00:00Z',
    updated: '2024-02-28T00:00:00Z',
    tags: ['enterprise', 'outbound', 'q1-2024']
  }
];

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const addCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === id
        ? { ...campaign, ...updates, updated: new Date().toISOString() }
        : campaign
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const addPlaybookToCampaign = (campaignId: string, playbook: CampaignPlaybook) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          playbooks: [...campaign.playbooks, playbook],
          updated: new Date().toISOString()
        };
      }
      return campaign;
    }));
  };

  const addAssetToCampaign = (campaignId: string, asset: CampaignAsset) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          assets: [...campaign.assets, asset],
          updated: new Date().toISOString()
        };
      }
      return campaign;
    }));
  };

  const addLeadToCampaign = (campaignId: string, leadId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId && !campaign.leads.includes(leadId)) {
        return {
          ...campaign,
          leads: [...campaign.leads, leadId],
          metrics: {
            ...campaign.metrics,
            totalLeads: campaign.metrics.totalLeads + 1
          },
          updated: new Date().toISOString()
        };
      }
      return campaign;
    }));
  };

  const updateCampaignMetrics = (campaignId: string, metrics: Partial<Campaign['metrics']>) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          metrics: {
            ...campaign.metrics,
            ...metrics
          },
          updated: new Date().toISOString()
        };
      }
      return campaign;
    }));
  };

  const getCampaignsByAsset = (assetId: string): Campaign[] => {
    return campaigns.filter(campaign =>
      campaign.assets.some(asset => asset.id === assetId)
    );
  };

  const getCampaignsByPlaybook = (playbookId: string): Campaign[] => {
    return campaigns.filter(campaign =>
      campaign.playbooks.some(playbook => playbook.id === playbookId)
    );
  };

  const getCampaignsByLead = (leadId: string): Campaign[] => {
    return campaigns.filter(campaign =>
      campaign.leads.includes(leadId)
    );
  };

  return {
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addPlaybookToCampaign,
    addAssetToCampaign,
    addLeadToCampaign,
    updateCampaignMetrics,
    getCampaignsByAsset,
    getCampaignsByPlaybook,
    getCampaignsByLead
  };
}