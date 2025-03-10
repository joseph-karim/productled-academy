import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const leads = [
  {
    id: 1,
    name: 'John Smith',
    company: 'Tech Corp',
    email: 'john@techcorp.com',
    status: 'Qualified',
    source: 'Website',
    lastContact: '2h ago',
    score: 85,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Digital Solutions',
    email: 'sarah@digitalsolutions.com',
    status: 'New',
    source: 'LinkedIn',
    lastContact: '1d ago',
    score: 65,
  },
  {
    id: 3,
    name: 'Michael Brown',
    company: 'Innovation Inc',
    email: 'michael@innovation.com',
    status: 'In Progress',
    source: 'Referral',
    lastContact: '4h ago',
    score: 75,
  },
];

export default function Leads() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      <div className="flex items-center px-4 py-2 bg-white rounded-md shadow">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          className="w-full px-4 py-2 text-gray-600 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
        />
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Company
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Score
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Source
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {lead.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lead.company}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'Qualified'
                        ? 'bg-green-100 text-green-800'
                        : lead.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.score}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lead.source}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lead.lastContact}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}