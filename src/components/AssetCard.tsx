import { FileText, Video, Calculator, Link as LinkIcon, Image, Presentation, Download, Share2, Eye, Clock, ExternalLink } from 'lucide-react';
import type { Asset } from '../types/asset';

interface AssetCardProps {
  asset: Asset;
  onSelect?: () => void;
  selected?: boolean;
}

const AssetTypeIcon = ({ type }: { type: Asset['type'] }) => {
  switch (type) {
    case 'presentation':
      return <Presentation className="w-5 h-5" />;
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    case 'calculator':
      return <Calculator className="w-5 h-5" />;
    case 'link':
      return <LinkIcon className="w-5 h-5" />;
    case 'image':
      return <Image className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export default function AssetCard({ asset, onSelect, selected }: AssetCardProps) {
  return (
    <div
      className={`p-4 bg-white rounded-lg border transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${
          asset.type === 'presentation' ? 'bg-blue-100 text-blue-600' :
          asset.type === 'video' ? 'bg-purple-100 text-purple-600' :
          asset.type === 'document' ? 'bg-green-100 text-green-600' :
          asset.type === 'calculator' ? 'bg-orange-100 text-orange-600' :
          asset.type === 'link' ? 'bg-gray-100 text-gray-600' :
          'bg-pink-100 text-pink-600'
        }`}>
          <AssetTypeIcon type={asset.type} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{asset.description}</p>
        </div>
      </div>

      {asset.thumbnailUrl && (
        <div className="mt-4">
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {asset.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {asset.stats?.views}
          </div>
          <div className="flex items-center">
            <Download className="w-4 h-4 mr-1" />
            {asset.stats?.downloads}
          </div>
          <div className="flex items-center">
            <Share2 className="w-4 h-4 mr-1" />
            {asset.stats?.shares}
          </div>
        </div>
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {asset.metadata?.duration && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {Math.floor(asset.metadata.duration / 60)}:{(asset.metadata.duration % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
}