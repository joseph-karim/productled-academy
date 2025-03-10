import { useState } from 'react';
import { useAssets } from '../hooks/useAssets';
import AssetGallery from '../components/AssetGallery';
import AddAssetModal from '../components/AddAssetModal';
import type { Asset } from '../types/asset';

export default function Assets() {
  const { assets, collections, addAsset } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleAddAsset = (data: any) => {
    addAsset({
      ...data,
      id: Date.now().toString(),
      status: 'active',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      createdBy: 'Current User',
      tags: [],
      campaigns: [],
      stats: {
        views: 0,
        downloads: 0,
        shares: 0
      }
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales and marketing assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <AssetGallery
            assets={assets}
            onAssetSelect={handleAssetSelect}
            onAddAsset={() => setShowAddModal(true)}
          />
        </div>

        <div>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Collections</h3>
              <div className="mt-4 space-y-4">
                {collections.map(collection => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {collection.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {collection.assets.length} assets
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {collection.campaigns.length} campaigns
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Asset Stats</h3>
              <dl className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Total Assets</dt>
                  <dd className="text-sm font-medium text-gray-900">{assets.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Collections</dt>
                  <dd className="text-sm font-medium text-gray-900">{collections.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Active Campaigns</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Set(assets.flatMap(asset => asset.campaigns)).size}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Total Views</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {assets.reduce((sum, asset) => sum + (asset.stats?.views || 0), 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Total Downloads</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {assets.reduce((sum, asset) => sum + (asset.stats?.downloads || 0), 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAssetAdd={handleAddAsset}
      />
    </div>
  );
}