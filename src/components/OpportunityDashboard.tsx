import React, { useState, useMemo } from 'react';
import { useOpportunities } from '../hooks/useOpportunities';
import { useClients } from '../hooks/useClients';
import { 
  Search, 
  ExternalLink, 
  Download, 
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Target,
  MessageCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle
} from 'lucide-react';

const OpportunityDashboard = () => {
  const { opportunities, isLoading, searchOpportunities, markAsVisited, exportToCsv } = useOpportunities();
  const { clients } = useClients();
  
  const [filters, setFilters] = useState({
    client: '',
    platform: '',
    keyword: '',
    visited: '',
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'discoveredAt',
    direction: 'desc'
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      if (filters.client && opp.clientId !== filters.client) return false;
      if (filters.platform && opp.platform !== filters.platform) return false;
      if (filters.keyword && !opp.keyword.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.visited && (filters.visited === 'visited') !== opp.visited) return false;
      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'rankingPosition':
          aValue = a.rankingPosition;
          bValue = b.rankingPosition;
          break;
        case 'platform':
          aValue = a.platform;
          bValue = b.platform;
          break;
        case 'keyword':
          aValue = a.keyword.toLowerCase();
          bValue = b.keyword.toLowerCase();
          break;
        case 'client':
          const clientA = clients.find(c => c.id === a.clientId)?.name || '';
          const clientB = clients.find(c => c.id === b.clientId)?.name || '';
          aValue = clientA.toLowerCase();
          bValue = clientB.toLowerCase();
          break;
        case 'discoveredAt':
        default:
          aValue = new Date(a.discoveredAt).getTime();
          bValue = new Date(b.discoveredAt).getTime();
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [opportunities, filters, sortConfig, clients]);

  const handleVisitPost = (opportunity: any) => {
    markAsVisited(opportunity.id);
    window.open(opportunity.url, '_blank');
  };

  const getSuggestedAnchorText = (client: any, keyword: string) => {
    const suggestions = [
      `I've had great results with ${client?.websiteUrl} for ${keyword} - they have some excellent resources that might help.`,
      `You should check out ${client?.websiteUrl} - they specialize in ${keyword} and have been really helpful.`,
      `${client?.websiteUrl} has some fantastic ${keyword} tools that solved this exact problem for me.`,
      `I recommend ${client?.websiteUrl} for ${keyword} solutions - their approach is really comprehensive.`,
      `Have you tried ${client?.websiteUrl}? They have excellent ${keyword} services that might be exactly what you need.`,
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const getHighlightedComment = (opportunity: any) => {
    // Simulate finding a specific comment to respond to
    const commentExamples = [
      "I'm really struggling with this and could use some guidance. Has anyone found a reliable solution?",
      "Been trying to figure this out for weeks. Any recommendations would be greatly appreciated!",
      "This is exactly the problem I'm facing. Would love to hear what's worked for others.",
      "Looking for suggestions on this topic. Open to any advice or tools that might help.",
      "Has anyone dealt with something similar? I'm at a loss and need some direction."
    ];
    
    return commentExamples[Math.floor(Math.random() * commentExamples.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Keyword Opportunities</h2>
          <p className="text-gray-600">Track and engage with high-ranking discussion opportunities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => exportToCsv(filteredAndSortedOpportunities, clients)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => searchOpportunities(clients)}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Search Opportunities</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters & Sorting</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="reddit">Reddit</option>
              <option value="quora">Quora</option>
              <option value="stackoverflow">Stack Overflow</option>
              <option value="hackernews">Hacker News</option>
              <option value="producthunt">Product Hunt</option>
              <option value="indiehackers">Indie Hackers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="Search keywords..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.visited}
              onChange={(e) => setFilters({ ...filters, visited: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="visited">Visited</option>
              <option value="unvisited">Not Visited</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortConfig.key}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="discoveredAt">Date Discovered</option>
              <option value="rankingPosition">Ranking Position</option>
              <option value="platform">Platform</option>
              <option value="keyword">Keyword</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Searching for Opportunities</h3>
          <p className="text-gray-600">Analyzing search results across multiple platforms...</p>
        </div>
      )}

      {/* Opportunities List */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Opportunities ({filteredAndSortedOpportunities.length})
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{filteredAndSortedOpportunities.filter(opp => opp.visited).length} visited</span>
                <button
                  onClick={() => handleSort(sortConfig.key)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  {getSortIcon(sortConfig.key)}
                  <span>Sort</span>
                </button>
              </div>
            </div>
          </div>

          {filteredAndSortedOpportunities.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No opportunities found</h4>
              <p className="mt-2 text-gray-600">
                {opportunities.length === 0 
                  ? 'Start by running a search to discover opportunities.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedOpportunities.map((opportunity) => {
                const client = clients.find(c => c.id === opportunity.clientId);
                const anchorText = getSuggestedAnchorText(client, opportunity.keyword);
                const highlightedComment = getHighlightedComment(opportunity);
                
                return (
                  <div
                    key={opportunity.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      opportunity.visited ? 'bg-gray-50 opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            opportunity.platform === 'reddit' 
                              ? 'bg-orange-100 text-orange-800' 
                              : opportunity.platform === 'quora'
                              ? 'bg-red-100 text-red-800'
                              : opportunity.platform === 'stackoverflow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : opportunity.platform === 'hackernews'
                              ? 'bg-gray-100 text-gray-800'
                              : opportunity.platform === 'producthunt'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {opportunity.platform}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            <Target className="w-3 h-3 mr-1" />
                            #{opportunity.rankingPosition}
                          </span>
                          {opportunity.visited && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <Eye className="w-3 h-3 mr-1" />
                              Visited
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {opportunity.title}
                        </h4>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {opportunity.snippet}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">Client:</span> {client?.name}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Keyword:</span> {opportunity.keyword}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">URL:</span> 
                            <a 
                              href={opportunity.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-1"
                              title={opportunity.url}
                            >
                              {truncateUrl(opportunity.url)}
                            </a>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Discovered:</span> {new Date(opportunity.discoveredAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Highlighted Comment to Respond To */}
                        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-900">Comment to Respond To</span>
                          </div>
                          <p className="text-sm text-yellow-800 italic">"{highlightedComment}"</p>
                          <div className="mt-2 text-xs text-yellow-600">
                            💡 This comment shows someone actively seeking help - perfect opportunity to provide value
                          </div>
                        </div>

                        {/* Suggested Response */}
                        <div className="p-3 bg-blue-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Suggested Response</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(anchorText)}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {copiedText === anchorText ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedText === anchorText ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          <p className="text-sm text-blue-800 italic">"{anchorText}"</p>
                          <div className="mt-2 text-xs text-blue-600">
                            💡 Tip: Add value to the discussion first, then naturally mention the resource
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => handleVisitPost(opportunity)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Post
                        </button>
                        
                        {!opportunity.visited ? (
                          <button
                            onClick={() => markAsVisited(opportunity.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Mark as Visited
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600">
                            <Eye className="w-4 h-4 mr-2" />
                            Visited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunityDashboard;