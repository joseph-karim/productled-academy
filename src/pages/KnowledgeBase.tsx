import { useState } from 'react';
import { Plus, Search, FileText, Folder, ChevronRight, Edit2, Trash2, ExternalLink } from 'lucide-react';
import AddKnowledgeBaseModal from '../components/AddKnowledgeBaseModal';
import AddArticleModal from '../components/AddArticleModal';
import type { KnowledgeBase, Article, KnowledgeSourceType } from '../types/knowledge';
import { createKnowledgeBase, createArticle } from '../types/knowledge';

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

export default function KnowledgeBase() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases);
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase>(knowledgeBases[0]);
  const [showAddKbModal, setShowAddKbModal] = useState(false);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddKnowledgeBase = (data: {
    name: string;
    description: string;
    source: KnowledgeSourceType;
    sourceConfig?: any;
  }) => {
    const newKb = createKnowledgeBase(data.name, data.description, data.source);
    if (data.sourceConfig) {
      newKb.sourceConfig = data.sourceConfig;
    }
    setKnowledgeBases([...knowledgeBases, newKb]);
    setSelectedBase(newKb);
  };

  const handleAddArticle = (articleData: Partial<Article>) => {
    if (!articleData.title || !articleData.content) return;

    const newArticle = createArticle(
      articleData.title,
      articleData.content || '',
      'Current User',
      selectedBase.source
    );

    if (articleData.tags) {
      newArticle.tags = articleData.tags;
    }

    setKnowledgeBases(prev => prev.map(kb => {
      if (kb.id === selectedBase.id) {
        return {
          ...kb,
          articles: [...kb.articles, newArticle]
        };
      }
      return kb;
    }));

    setSelectedBase(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle]
    }));
  };

  const handleDeleteArticle = (articleId: string) => {
    setKnowledgeBases(prev => prev.map(kb => {
      if (kb.id === selectedBase.id) {
        return {
          ...kb,
          articles: kb.articles.filter(article => article.id !== articleId)
        };
      }
      return kb;
    }));

    setSelectedBase(prev => ({
      ...prev,
      articles: prev.articles.filter(article => article.id !== articleId)
    }));
  };

  const getSourceIcon = (source: KnowledgeSourceType) => {
    switch (source) {
      case 'hubspot':
        return '🟠';
      case 'zendesk':
        return '🔵';
      default:
        return '🟢';
    }
  };

  const filteredArticles = selectedBase.articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="mt-1 text-sm text-gray-500">Manage AI-accessible knowledge and resources</p>
        </div>
        <button
          onClick={() => setShowAddKbModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Knowledge Base
        </button>
      </div>

      <div className="flex items-center px-4 py-2 bg-white rounded-md shadow">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base..."
          className="w-full px-4 py-2 text-gray-600 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Knowledge Bases</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {knowledgeBases.map((kb) => (
                <button
                  key={kb.id}
                  onClick={() => setSelectedBase(kb)}
                  className={`flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 ${
                    selectedBase.id === kb.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2" title={`Source: ${kb.source}`}>
                      {getSourceIcon(kb.source)}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{kb.name}</h4>
                      <p className="text-sm text-gray-500">{kb.articles.length} articles</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedBase.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{selectedBase.description}</p>
                </div>
                <button
                  onClick={() => setShowAddArticleModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </button>
              </div>
              {selectedBase.source !== 'internal' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connected to {selectedBase.source.charAt(0).toUpperCase() + selectedBase.source.slice(1)}
                    {selectedBase.source === 'hubspot' && ` (KB ID: ${selectedBase.sourceConfig?.hubspot?.knowledgeBaseId})`}
                    {selectedBase.source === 'zendesk' && ` (Help Center ID: ${selectedBase.sourceConfig?.zendesk?.helpCenterId})`}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{article.title}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            Updated {new Date(article.updated).toLocaleDateString()}
                          </span>
                          {article.tags.length > 0 && (
                            <div className="flex items-center ml-4 space-x-2">
                              {article.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddKnowledgeBaseModal
        isOpen={showAddKbModal}
        onClose={() => setShowAddKbModal(false)}
        onKnowledgeBaseAdd={handleAddKnowledgeBase}
      />

      <AddArticleModal
        isOpen={showAddArticleModal}
        onClose={() => setShowAddArticleModal(false)}
        onArticleAdd={handleAddArticle}
      />
    </div>
  );
}