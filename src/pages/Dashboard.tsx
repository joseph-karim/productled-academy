import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Phone, Mail, MessageSquare, Calendar, TrendingUp, Users, CheckCircle2, PhoneCall, ArrowRight } from 'lucide-react';

const weeklyData = [
  { name: 'Mon', qualifiedLeads: 4, totalLeads: 12, engaged: 8, attempted: 15 },
  { name: 'Tue', qualifiedLeads: 6, totalLeads: 15, engaged: 10, attempted: 18 },
  { name: 'Wed', qualifiedLeads: 8, totalLeads: 20, engaged: 12, attempted: 22 },
  { name: 'Thu', qualifiedLeads: 5, totalLeads: 14, engaged: 9, attempted: 16 },
  { name: 'Fri', qualifiedLeads: 7, totalLeads: 18, engaged: 11, attempted: 20 },
  { name: 'Sat', qualifiedLeads: 3, totalLeads: 8, engaged: 5, attempted: 10 },
  { name: 'Sun', qualifiedLeads: 2, totalLeads: 6, engaged: 4, attempted: 8 },
];

const engagementData = [
  { name: 'Mon', calls: 8, emails: 12, texts: 6 },
  { name: 'Tue', calls: 10, emails: 15, texts: 8 },
  { name: 'Wed', calls: 12, emails: 18, texts: 9 },
  { name: 'Thu', calls: 9, emails: 14, texts: 7 },
  { name: 'Fri', calls: 11, emails: 16, texts: 8 },
  { name: 'Sat', calls: 6, emails: 8, texts: 4 },
  { name: 'Sun', calls: 5, emails: 7, texts: 3 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link
          to="/ai-actions"
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          View AI Action Log
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/leads?status=qualified" className="block">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Qualified Booked Leads</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">35</p>
                <p className="mt-1 text-sm text-green-600">+12% from last week</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/leads" className="block">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">93</p>
                <p className="mt-1 text-sm text-blue-600">+8% from last week</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/leads?status=engaged" className="block">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Leads Engaged</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">59</p>
                <p className="mt-1 text-sm text-purple-600">63% engagement rate</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/voice-calls" className="block">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PhoneCall className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Contact Attempts</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">109</p>
                <p className="mt-1 text-sm text-orange-600">1.8 attempts per lead</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Lead Qualification Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="qualifiedLeads" 
                  stroke="#16a34a" 
                  name="Qualified Leads"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalLeads" 
                  stroke="#93c5fd" 
                  name="Total Leads"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Engagement Channels</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" name="Phone Calls" />
                <Bar dataKey="emails" fill="#10b981" name="Emails" />
                <Bar dataKey="texts" fill="#8b5cf6" name="Text Messages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Qualified Leads</h3>
          <div className="space-y-4">
            {[
              { id: '1', name: 'Sarah Johnson', company: 'Tech Corp', time: '2h ago', value: '$45k' },
              { id: '2', name: 'Michael Chen', company: 'Innovate Inc', time: '4h ago', value: '$32k' },
              { id: '3', name: 'Emily Brown', company: 'Data Systems', time: '6h ago', value: '$28k' },
            ].map((lead) => (
              <Link key={lead.id} to={`/leads/${lead.id}`} className="block">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{lead.value}</p>
                    <p className="text-xs text-gray-500">{lead.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Engagement Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">Phone Calls</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">42</span>
                <span className="ml-2 text-xs text-green-600">68% success</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Emails</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">86</span>
                <span className="ml-2 text-xs text-green-600">45% open rate</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-700">Text Messages</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">38</span>
                <span className="ml-2 text-xs text-green-600">92% delivered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Upcoming Meetings</h3>
          <div className="space-y-4">
            {[
              { id: '1', title: 'Product Demo', company: 'Tech Corp', time: '2:00 PM', attendees: 4 },
              { id: '2', title: 'Discovery Call', company: 'Innovate Inc', time: '3:30 PM', attendees: 2 },
              { id: '3', title: 'Technical Review', company: 'Data Systems', time: '4:45 PM', attendees: 5 },
            ].map((meeting) => (
              <Link key={meeting.id} to={`/calendar/${meeting.id}`} className="block">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                      <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{meeting.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{meeting.time}</p>
                    <p className="text-xs text-gray-500">{meeting.attendees} attendees</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}