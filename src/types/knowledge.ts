import { nanoid } from 'nanoid';

export type KnowledgeSourceType = 'internal' | 'hubspot' | 'zendesk';
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type FileType = 'pdf' | 'doc' | 'docx' | 'txt' | 'md';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  status: ArticleStatus;
  source: KnowledgeSourceType;
  sourceId?: string;
  created: string;
  updated: string;
  author: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  source: KnowledgeSourceType;
  sourceConfig?: {
    hubspot?: {
      knowledgeBaseId: string;
      categoryId?: string;
    };
    zendesk?: {
      helpCenterId: string;
      categoryId?: string;
    };
  };
  articles: Article[];
}

export const createArticle = (
  title: string,
  content: string,
  author: string,
  source: KnowledgeSourceType = 'internal'
): Article => ({
  id: nanoid(),
  title,
  content,
  tags: [],
  status: 'draft',
  source,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  author,
  attachments: []
});

export const createAttachment = (
  name: string,
  type: FileType,
  size: number,
  url: string
): Attachment => ({
  id: nanoid(),
  name,
  type,
  size,
  url,
  uploadedAt: new Date().toISOString()
});

export const createKnowledgeBase = (
  name: string,
  description: string,
  source: KnowledgeSourceType = 'internal'
): KnowledgeBase => ({
  id: nanoid(),
  name,
  description,
  source,
  articles: []
});