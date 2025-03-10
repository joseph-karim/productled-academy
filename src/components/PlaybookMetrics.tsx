import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Clock, TrendingUp, ArrowRight, Bot } from 'lucide-react';
import type { PlaybookMetrics } from '../types/playbook';

interface PlaybookMetricsProps {
  metrics: PlaybookMetrics;
}

export default function PlaybookMetrics({ metrics }: PlaybookMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.totalLeads}</p>
              <p className="mt-1 text-sm text-blue-600">{metrics.engagementRate}% engagement</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Qualified Leads</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.qualifiedLeads}</p>
              <p className="mt-1 text-sm text-green-600">{metrics.successRate}% success rate</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Bot className="w-6 h-6 text-violet-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">AI to Human Handoffs</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.humanHandoffs}</p>
              <p className="mt-1 text-sm text-violet-600">{metrics.aiHandoffs} AI interactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Qualification Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="metrics.qualified" 
                  name="Qualified Leads"
                  stroke="#16a34a" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="metrics.leads" 
                  name="Total Leads"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="metrics.engagement" 
                  name="Engagement Rate" 
                  fill="#8b5cf6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Handoff Rules</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <ArrowRight className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">High Value Prospects</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Hand off to sales team when deal value exceeds $50k
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                High Priority
              </span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <ArrowRight className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Technical Requirements</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Route to solutions engineering for complex technical needs
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Medium Priority
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}