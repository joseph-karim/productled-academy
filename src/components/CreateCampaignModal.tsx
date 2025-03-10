import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Calendar, Users, Target, X, Plus } from 'lucide-react';
import type { Campaign, CampaignType, CampaignTarget } from '../types/campaign';
import { createCampaign } from '../types/campaign';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreate: (campaign: Campaign) => void;
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onCampaignCreate
}: CreateCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CampaignType>('outbound');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [target, setTarget] = useState<CampaignTarget>({
    industry: [],
    companySize: [],
    region: [],
    jobTitles: []
  });

  const handleCreate = () => {
    if (!name || !description || !startDate || !type) return;

    const campaign = createCampaign(
      name,
      description,
      type,
      startDate,
      target,
      {
        id: 'current-user',
        name: 'Current User',
        role: 'Campaign Manager'
      }
    );

    onCampaignCreate(campaign);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setType('outbound');
    setStartDate('');
    setEndDate('');
    setTarget({
      industry: [],
      companySize: [],
      region: [],
      jobTitles: []
    });
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
                  <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <div className="mt-6">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Campaign Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter campaign name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Describe your campaign..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Campaign Type
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value as CampaignType)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="outbound">Outbound</option>
                          <option value="inbound">Inbound</option>
                          <option value="nurture">Nurture</option>
                          <option value="event">Event</option>
                          <option value="product_launch">Product Launch</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            End Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : step === 2 ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Industries
                        </label>
                        <select
                          multiple
                          value={target.industry}
                          onChange={(e) => setTarget({
                            ...target,
                            industry: Array.from(e.target.selectedOptions, option => option.value)
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="Software">Software</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Manufacturing">Manufacturing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Size
                        </label>
                        <select
                          multiple
                          value={target.companySize}
                          onChange={(e) => setTarget({
                            ...target,
                            companySize: Array.from(e.target.selectedOptions, option => option.value)
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="1-50">1-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="501-1000">501-1000</option>
                          <option value="1000+">1000+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Regions
                        </label>
                        <select
                          multiple
                          value={target.region}
                          onChange={(e) => setTarget({
                            ...target,
                            region: Array.from(e.target.selectedOptions, option => option.value)
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="North America">North America</option>
                          <option value="Europe">Europe</option>
                          <option value="Asia Pacific">Asia Pacific</option>
                          <option value="Latin America">Latin America</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Job Titles
                        </label>
                        <select
                          multiple
                          value={target.jobTitles}
                          onChange={(e) => setTarget({
                            ...target,
                            jobTitles: Array.from(e.target.selectedOptions, option => option.value)
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="CEO">CEO</option>
                          <option value="CTO">CTO</option>
                          <option value="VP Engineering">VP Engineering</option>
                          <option value="Director of Engineering">Director of Engineering</option>
                          <option value="Product Manager">Product Manager</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Campaign Summary</h4>
                        <div className="space-y-4">
                          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Timeline</p>
                              <p className="text-sm text-gray-500">
                                {new Date(startDate).toLocaleDateString()} - 
                                {endDate ? new Date(endDate).toLocaleDateString() : 'Ongoing'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Target className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Target Audience</p>
                              <p className="text-sm text-gray-500">
                                {target.industry.length} industries, {target.region.length} regions
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Users className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Campaign Team</p>
                              <p className="text-sm text-gray-500">
                                1 owner, 0 team members
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    {step > 1 && (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Back
                      </button>
                    )}
                    <div className="ml-auto">
                      <button
                        onClick={onClose}
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      {step < 3 ? (
                        <button
                          onClick={() => setStep(step + 1)}
                          disabled={step === 1 && (!name || !description || !startDate)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={handleCreate}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Create Campaign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}