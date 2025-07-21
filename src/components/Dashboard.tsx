import React from 'react';
import { useClients } from '../hooks/useClients';
import { useOpportunities } from '../hooks/useOpportunities';
import { 
  Users, 
  Target, 
  Search, 
  TrendingUp,
  ExternalLink,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { clients } = useClients();
  const { opportunities, isLoading, searchOpportunities, exportToCsv } = useOpportunities();

  const totalKeywords = clients.reduce((sum, client) => sum + client.keywords.length, 0);
  const recentOpportunities = opportunities
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      name: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Keywords Monitored',
      value: totalKeywords,
      icon: Target,
      color: 'bg-green-500',
    },
    {
      name: 'Opportunities Found',
      value: opportunities.length,
      icon: Search,
      color: 'bg-purple-500',
    },
    {
      name: 'Avg. Ranking Position',
      value: opportunities.length > 0 
        ? Math.round(opportunities.reduce((sum, opp) => sum + opp.rankingPosition, 0) / opportunities.length)
        : 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const platformStats = {
    reddit: opportunities.filter(opp => opp.platform === 'reddit').length,
    quora: opportunities.filter(opp => opp.platform === 'quora').length,
    facebook: opportunities.filter(opp => opp.platform === 'facebook').length,
    linkedin: opportunities.filter(opp => opp.platform === 'linkedin').length,
    twitter: opportunities.filter(opp => opp.platform === 'twitter').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Reddit</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{platformStats.reddit}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Quora</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{platformStats.quora}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{platformStats.facebook}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">LinkedIn</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{platformStats.linkedin}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Twitter</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{platformStats.twitter}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => searchOpportunities(clients)}
              disabled={isLoading || clients.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run New Search
            </button>
            <button 
              onClick={() => exportToCsv(opportunities, clients)}
              disabled={opportunities.length === 0}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export All Data
            </button>
          </div>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Opportunities</h3>
        </div>
        <div className="p-6">
          {recentOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No opportunities yet</h4>
              <p className="mt-2 text-gray-600">Start by adding clients and running keyword searches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOpportunities.map((opportunity) => {
                const client = clients.find(c => c.id === opportunity.clientId);
                return (
                  <div
                    key={opportunity.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          opportunity.platform === 'reddit' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {opportunity.platform}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          #{opportunity.rankingPosition}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {opportunity.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Keyword: <span className="font-medium">{opportunity.keyword}</span> • 
                        Client: <span className="font-medium">{client?.name}</span>
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(opportunity.discoveredAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(opportunity.url, '_blank')}
                      className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;