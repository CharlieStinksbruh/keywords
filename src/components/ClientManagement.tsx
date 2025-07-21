import React, { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../hooks/useAuth.tsx';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Tag,
  Calendar,
  Upload,
  X,
  Users
} from 'lucide-react';
import { Client } from '../types';

const ClientManagement = () => {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    keywords: [] as string[],
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Dynamic keyword suggestions based on client context
  const getKeywordSuggestions = (clientName: string, websiteUrl: string) => {
    const baseKeywords = [
      'SEO optimisation',
      'digital marketing',
      'web design',
      'content marketing',
      'social media marketing',
      'email marketing',
      'PPC advertising',
      'conversion optimisation',
      'brand strategy',
      'online advertising',
      'website development',
      'e-commerce solutions',
      'marketing automation',
      'lead generation',
      'customer acquisition',
      'growth hacking',
      'influencer marketing',
      'video marketing',
      'mobile marketing',
      'analytics and tracking'
    ];

    // Add client-specific suggestions
    const clientSpecific = [];
    if (websiteUrl) {
      const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      clientSpecific.push(`${domain} alternative`, `${domain} review`, `${domain} vs`);
    }
    if (clientName) {
      clientSpecific.push(`${clientName} service`, `${clientName} solution`, `${clientName} tool`);
    }

    return [...baseKeywords, ...clientSpecific];
  };

  const isAdmin = user?.role === 'admin';

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        websiteUrl: client.websiteUrl,
        keywords: client.keywords,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        websiteUrl: '',
        keywords: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setKeywordInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    
    closeModal();
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const keywords = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !formData.keywords.includes(line));
      
      setFormData({
        ...formData,
        keywords: [...formData.keywords, ...keywords],
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage your clients and their keyword targets</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        )}
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(client)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                <a 
                  href={client.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate"
                >
                  {client.websiteUrl}
                </a>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Tag className="w-4 h-4 mr-2" />
                <span>{client.keywords.length} keywords</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Added {new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {client.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {client.keywords.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    +{client.keywords.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No clients yet</h3>
          <p className="mt-2 text-gray-600">Get started by adding your first client.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  
                  {/* Keyword Suggestions */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Keyword suggestions for this client:</p>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {getKeywordSuggestions(formData.name, formData.websiteUrl).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            if (!formData.keywords.includes(suggestion)) {
                              setFormData({
                                ...formData,
                                keywords: [...formData.keywords, suggestion],
                              });
                            }
                          }}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter keyword"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mb-2">
                    <label className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingClient ? 'Update' : 'Add'} Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;