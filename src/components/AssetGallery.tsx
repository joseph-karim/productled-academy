import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Menu } from '@headlessui/react';
import AssetCard from './AssetCard';
import type { Asset, AssetType, AssetCategory } from '../types/asset';

interface AssetGalleryProps {
  assets: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  selectedAssets?: string[];
  onAddAsset?: () => void;
}

export default function AssetGallery({
  assets,
  onAssetSelect,
  selectedAssets = [],
  onAddAsset
}: AssetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Type: {typeFilter === 'all' ? 'All' : typeFilter}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setTypeFilter('all')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      All Types
                    </button>
                  )}
                </Menu.Item>
                {['presentation', 'video', 'document', 'calculator', 'link', 'image'].map((type) => (
                  <Menu.Item key={type}>
                    {({ active }) => (
                      <button
                        onClick={() => setTypeFilter(type as AssetType)}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Category: {categoryFilter === 'all' ? 'All' : categoryFilter}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      All Categories
                    </button>
                  )}
                </Menu.Item>
                {['sales', 'marketing', 'technical', 'support', 'legal'].map((category) => (
                  <Menu.Item key={category}>
                    {({ active }) => (
                      <button
                        onClick={() => setCategoryFilter(category as AssetCategory)}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>
          {onAddAsset && (
            <button
              onClick={onAddAsset}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            selected={selectedAssets.includes(asset.id)}
            onSelect={() => onAssetSelect?.(asset)}
          />
        ))}
      </div>
    </div>
  );
}