import { useState } from 'react';
import type { KnowledgeBase } from '../types/knowledge';

// This would typically fetch from an API
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'pricing',
    name: 'Pricing Information',
    description: 'Product pricing, packages, and enterprise quotes',
    source: 'internal',
    articles: [
      {
        id: '1',
        title: 'Enterprise Pricing Guide',
        content: 'Detailed pricing information for enterprise customers...',
        tags: ['pricing', 'enterprise'],
        status: 'published',
        source: 'internal',
        created: '2024-02-28T00:00:00Z',
        updated: '2024-02-28T00:00:00Z',
        author: 'John Doe',
        attachments: []
      },
      {
        id: '2',
        title: 'Volume Discounts',
        content: 'Volume-based pricing tiers and discounts...',
        tags: ['pricing', 'discounts'],
        status: 'published',
        source: 'internal',
        created: '2024-02-27T00:00:00Z',
        updated: '2024-02-27T00:00:00Z',
        author: 'Jane Smith',
        attachments: []
      }
    ]
  },
  {
    id: 'features',
    name: 'Product Features',
    description: 'Detailed feature documentation and capabilities',
    source: 'hubspot',
    sourceConfig: {
      hubspot: {
        knowledgeBaseId: 'kb123',
      }
    },
    articles: [
      {
        id: '3',
        title: 'AI Capabilities Overview',
        content: 'Overview of AI features and capabilities...',
        tags: ['ai', 'features'],
        status: 'published',
        source: 'hubspot',
        sourceId: 'article123',
        created: '2024-02-28T00:00:00Z',
        updated: '2024-02-28T00:00:00Z',
        author: 'AI Team',
        attachments: []
      }
    ]
  },
  {
    id: 'support',
    name: 'Support Documentation',
    description: 'Technical support and troubleshooting guides',
    source: 'zendesk',
    sourceConfig: {
      zendesk: {
        helpCenterId: 'hc123',
      }
    },
    articles: [
      {
        id: '4',
        title: 'Troubleshooting Guide',
        content: 'Common issues and their solutions...',
        tags: ['support', 'troubleshooting'],
        status: 'published',
        source: 'zendesk',
        sourceId: 'article456',
        created: '2024-02-25T00:00:00Z',
        updated: '2024-02-25T00:00:00Z',
        author: 'Support Team',
        attachments: []
      }
    ]
  }
];

export function useKnowledgeBases() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases);

  const addKnowledgeBase = (knowledgeBase: KnowledgeBase) => {
    setKnowledgeBases(prev => [...prev, knowledgeBase]);
  };

  const updateKnowledgeBase = (id: string, updates: Partial<KnowledgeBase>) => {
    setKnowledgeBases(prev => prev.map(kb => 
      kb.id === id ? { ...kb, ...updates } : kb
    ));
  };

  const removeKnowledgeBase = (id: string) => {
    setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
  };

  const addArticle = (knowledgeBaseId: string, article: KnowledgeBase['articles'][0]) => {
    setKnowledgeBases(prev => prev.map(kb => {
      if (kb.id === knowledgeBaseId) {
        return {
          ...kb,
          articles: [...kb.articles, article]
        };
      }
      return kb;
    }));
  };

  const updateArticle = (knowledgeBaseId: string, articleId: string, updates: Partial<KnowledgeBase['articles'][0]>) => {
    setKnowledgeBases(prev => prev.map(kb => {
      if (kb.id === knowledgeBaseId) {
        return {
          ...kb,
          articles: kb.articles.map(article =>
            article.id === articleId ? { ...article, ...updates } : article
          )
        };
      }
      return kb;
    }));
  };

  const removeArticle = (knowledgeBaseId: string, articleId: string) => {
    setKnowledgeBases(prev => prev.map(kb => {
      if (kb.id === knowledgeBaseId) {
        return {
          ...kb,
          articles: kb.articles.filter(article => article.id !== articleId)
        };
      }
      return kb;
    }));
  };

  return {
    knowledgeBases,
    addKnowledgeBase,
    updateKnowledgeBase,
    removeKnowledgeBase,
    addArticle,
    updateArticle,
    removeArticle
  };
}