import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FileText, Video, Calculator, Link as LinkIcon, Image, Presentation, Upload, X, Bot, Database } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { AssetType, AssetCategory } from '../types/asset';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdd: (data: {
    name: string;
    description: string;
    type: AssetType;
    category: AssetCategory;
    url: string;
    source?: 'upload' | 'hubspot' | 'google_drive' | 'link';
    sourceConfig?: any;
  }) => void;
}

const assetTypes: Array<{ type: AssetType; label: string; icon: typeof FileText }> = [
  { type: 'presentation', label: 'Presentation', icon: Presentation },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'document', label: 'Document', icon: FileText },
  { type: 'calculator', label: 'Calculator', icon: Calculator },
  { type: 'link', label: 'Link', icon: LinkIcon },
  { type: 'image', label: 'Image', icon: Image },
];

const sourceTypes = [
  { id: 'upload', label: 'Upload File', icon: Upload },
  { id: 'hubspot', label: 'HubSpot Content', icon: Database },
  { id: 'google_drive', label: 'Google Drive', icon: Database },
  { id: 'link', label: 'External Link', icon: LinkIcon },
];

export default function AddAssetModal({ isOpen, onClose, onAssetAdd }: AddAssetModalProps) {
  const [step, setStep] = useState(1);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AssetCategory>('sales');
  const [url, setUrl] = useState('');
  const [hubspotFolder, setHubspotFolder] = useState('');
  const [googleDriveFolder, setGoogleDriveFolder] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'video/mp4': ['.mp4'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    onDrop: (acceptedFiles) => {
      // Handle file upload
      console.log('Files:', acceptedFiles);
    }
  });

  const handleSubmit = () => {
    if (!name || !assetType || !source) return;

    let finalUrl = url;
    let sourceConfig = {};

    switch (source) {
      case 'hubspot':
        sourceConfig = { hubspotFolder };
        break;
      case 'google_drive':
        sourceConfig = { googleDriveFolder };
        break;
    }

    onAssetAdd({
      name,
      description,
      type: assetType,
      category,
      url: finalUrl,
      source: source as any,
      sourceConfig
    });

    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setAssetType(null);
    setSource(null);
    setName('');
    setDescription('');
    setCategory('sales');
    setUrl('');
    setHubspotFolder('');
    setGoogleDriveFolder('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Add Asset</h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <div className="mt-6">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Select Asset Type</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {assetTypes.map(({ type, label, icon: Icon }) => (
                            <button
                              key={type}
                              onClick={() => {
                                setAssetType(type);
                                setStep(2);
                              }}
                              className={`flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 ${
                                assetType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <Icon className="w-8 h-8 text-gray-600 mb-2" />
                              <span className="text-sm font-medium text-gray-900">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : step === 2 ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Select Source</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {sourceTypes.map(({ id, label, icon: Icon }) => (
                            <button
                              key={id}
                              onClick={() => {
                                setSource(id);
                                setStep(3);
                              }}
                              className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 ${
                                source === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <Icon className="w-6 h-6 text-gray-600 mr-3" />
                              <span className="text-sm font-medium text-gray-900">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => setStep(1)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as AssetCategory)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="sales">Sales</option>
                          <option value="marketing">Marketing</option>
                          <option value="technical">Technical</option>
                          <option value="support">Support</option>
                          <option value="legal">Legal</option>
                        </select>
                      </div>

                      {source === 'upload' && (
                        <div>
                          <div
                            {...getRootProps()}
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                            }`}
                          >
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <input {...getInputProps()} />
                                <p>Drag & drop files here, or click to select files</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, PPT, PPTX, MP4, PNG, JPG up to 50MB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {source === 'link' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">URL</label>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {source === 'hubspot' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            HubSpot Folder
                          </label>
                          <select
                            value={hubspotFolder}
                            onChange={(e) => setHubspotFolder(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select folder...</option>
                            <option value="sales">Sales Materials</option>
                            <option value="marketing">Marketing Assets</option>
                            <option value="product">Product Resources</option>
                          </select>
                        </div>
                      )}

                      {source === 'google_drive' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Google Drive Folder
                          </label>
                          <select
                            value={googleDriveFolder}
                            onChange={(e) => setGoogleDriveFolder(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select folder...</option>
                            <option value="presentations">Presentations</option>
                            <option value="documents">Documents</option>
                            <option value="media">Media</option>
                          </select>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <button
                          onClick={() => setStep(2)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={!name || !assetType}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Asset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}