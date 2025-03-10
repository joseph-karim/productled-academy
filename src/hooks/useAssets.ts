import { useState } from 'react';
import type { Asset, AssetCollection } from '../types/asset';

const mockAssets: Asset[] = [
  {
    id: 'sales-deck',
    name: 'Enterprise Sales Deck 2024',
    description: 'Main sales presentation for enterprise customers',
    type: 'presentation',
    category: 'sales',
    url: 'https://example.com/sales-deck.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&h=200',
    status: 'active',
    created: '2024-02-01T00:00:00Z',
    updated: '2024-02-28T00:00:00Z',
    createdBy: 'Sarah Wilson',
    metadata: {
      fileSize: 2500000,
      format: 'pdf',
      version: '2.1'
    },
    tags: ['enterprise', 'sales', 'presentation'],
    campaigns: ['enterprise-q1'],
    stats: {
      views: 245,
      downloads: 82,
      shares: 34
    }
  },
  {
    id: 'product-demo',
    name: 'Product Demo Video',
    description: 'Overview of key features and benefits',
    type: 'video',
    category: 'marketing',
    url: 'https://example.com/demo.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&h=200',
    status: 'active',
    created: '2024-02-15T00:00:00Z',
    updated: '2024-02-15T00:00:00Z',
    createdBy: 'Mike Brown',
    metadata: {
      fileSize: 15000000,
      duration: 180,
      format: 'mp4'
    },
    tags: ['demo', 'product', 'features'],
    campaigns: ['enterprise-q1', 'smb-outreach'],
    stats: {
      views: 567,
      downloads: 0,
      shares: 89,
      avgEngagementTime: 162
    }
  },
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Interactive calculator for demonstrating value',
    type: 'calculator',
    category: 'sales',
    url: 'https://example.com/roi-calculator',
    status: 'active',
    created: '2024-02-20T00:00:00Z',
    updated: '2024-02-20T00:00:00Z',
    createdBy: 'John Davis',
    tags: ['roi', 'calculator', 'sales-tools'],
    campaigns: ['enterprise-q1'],
    stats: {
      views: 189,
      downloads: 0,
      shares: 45
    }
  }
];

const mockCollections: AssetCollection[] = [
  {
    id: 'enterprise-kit',
    name: 'Enterprise Sales Kit',
    description: 'Complete set of enterprise sales materials',
    assets: ['sales-deck', 'product-demo', 'roi-calculator'],
    created: '2024-02-01T00:00:00Z',
    updated: '2024-02-28T00:00:00Z',
    createdBy: 'Sarah Wilson',
    campaigns: ['enterprise-q1']
  }
];

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [collections, setCollections] = useState<AssetCollection[]>(mockCollections);

  const addAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, ...updates, updated: new Date().toISOString() } : asset
    ));
  };

  const deleteAsset = (id: string) => {
    // Remove asset from collections first
    setCollections(prev => prev.map(collection => ({
      ...collection,
      assets: collection.assets.filter(assetId => assetId !== id)
    })));

    // Then remove the asset itself
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const addCollection = (collection: AssetCollection) => {
    setCollections(prev => [...prev, collection]);
  };

  const updateCollection = (id: string, updates: Partial<AssetCollection>) => {
    setCollections(prev => prev.map(collection =>
      collection.id === id ? { ...collection, ...updates, updated: new Date().toISOString() } : collection
    ));
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(collection => collection.id !== id));
  };

  const addAssetToCollection = (collectionId: string, assetId: string) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId && !collection.assets.includes(assetId)) {
        return {
          ...collection,
          assets: [...collection.assets, assetId],
          updated: new Date().toISOString()
        };
      }
      return collection;
    }));
  };

  const removeAssetFromCollection = (collectionId: string, assetId: string) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          assets: collection.assets.filter(id => id !== assetId),
          updated: new Date().toISOString()
        };
      }
      return collection;
    }));
  };

  const getAssetsByCollection = (collectionId: string): Asset[] => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];
    return assets.filter(asset => collection.assets.includes(asset.id));
  };

  const getAssetsByCampaign = (campaignId: string): Asset[] => {
    return assets.filter(asset => asset.campaigns.includes(campaignId));
  };

  return {
    assets,
    collections,
    addAsset,
    updateAsset,
    deleteAsset,
    addCollection,
    updateCollection,
    deleteCollection,
    addAssetToCollection,
    removeAssetFromCollection,
    getAssetsByCollection,
    getAssetsByCampaign
  };
}