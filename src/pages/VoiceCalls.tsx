import { Phone, Play, Pause } from 'lucide-react';

const calls = [
  {
    id: 1,
    contact: 'John Smith',
    company: 'Tech Corp',
    duration: '5:23',
    status: 'Completed',
    outcome: 'Interested',
    timestamp: '2h ago',
  },
  {
    id: 2,
    contact: 'Sarah Johnson',
    company: 'Digital Solutions',
    duration: '3:45',
    status: 'In Progress',
    outcome: 'Pending',
    timestamp: 'Now',
  },
  {
    id: 3,
    contact: 'Michael Brown',
    company: 'Innovation Inc',
    duration: '4:12',
    status: 'Completed',
    outcome: 'Not Interested',
    timestamp: '4h ago',
  },
];

export default function VoiceCalls() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Voice Calls</h2>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Phone className="w-5 h-5 mr-2" />
          New Call
        </button>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Call</h3>
          <button className="flex items-center px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
            <Pause className="w-4 h-4 mr-2" />
            End Call
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-500">Digital Solutions</p>
            </div>
            <div className="text-sm text-gray-500">Duration: 3:45</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {calls.map((call) => (
            <li key={call.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{call.contact}</p>
                  <p className="text-sm text-gray-500">{call.company}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Duration: {call.duration}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      call.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {call.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      call.outcome === 'Interested'
                        ? 'bg-blue-100 text-blue-800'
                        : call.outcome === 'Not Interested'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {call.outcome}
                  </span>
                  <div className="text-sm text-gray-500">{call.timestamp}</div>
                  {call.status === 'Completed' && (
                    <button className="p-1 text-gray-400 hover:text-gray-500">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}