import { nanoid } from 'nanoid';

export type AssetType = 
  | 'presentation'
  | 'video'
  | 'document'
  | 'calculator'
  | 'link'
  | 'image';

export type AssetCategory =
  | 'sales'
  | 'marketing'
  | 'technical'
  | 'support'
  | 'legal';

export type AssetStatus = 'active' | 'archived' | 'draft';

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: AssetType;
  category: AssetCategory;
  url: string;
  thumbnailUrl?: string;
  status: AssetStatus;
  created: string;
  updated: string;
  createdBy: string;
  metadata?: {
    fileSize?: number;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    format?: string;
    version?: string;
  };
  tags: string[];
  campaigns: string[];
  stats?: {
    views: number;
    downloads: number;
    shares: number;
    avgEngagementTime?: number;
  };
}

export interface AssetCollection {
  id: string;
  name: string;
  description: string;
  assets: string[];
  created: string;
  updated: string;
  createdBy: string;
  campaigns: string[];
}

export const createAsset = (
  name: string,
  description: string,
  type: AssetType,
  category: AssetCategory,
  url: string,
  createdBy: string
): Asset => ({
  id: nanoid(),
  name,
  description,
  type,
  category,
  url,
  status: 'draft',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  createdBy,
  tags: [],
  campaigns: [],
  stats: {
    views: 0,
    downloads: 0,
    shares: 0
  }
});

export const createAssetCollection = (
  name: string,
  description: string,
  createdBy: string,
  assets: string[] = []
): AssetCollection => ({
  id: nanoid(),
  name,
  description,
  assets,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  createdBy,
  campaigns: []
});