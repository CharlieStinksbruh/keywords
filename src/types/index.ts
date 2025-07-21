export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Client {
  id: string;
  name: string;
  websiteUrl: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  keyword: string;
  platform: 'reddit' | 'quora' | 'discord' | 'facebook' | 'linkedin' | 'twitter';
  platform: 'reddit' | 'quora' | 'facebook' | 'linkedin' | 'twitter';
  url: string;
  title: string;
  snippet: string;
  intent: 'positive' | 'negative' | 'neutral' | 'question';
  commentUrl?: string;
  rankingPosition: number;
  discoveredAt: string;
  visited: boolean;
}

export interface RedditAuth {
  username: string;
  password: string;
  isAuthenticated: boolean;
}

export interface Dashboard {
  totalClients: number;
  totalKeywords: number;
  totalOpportunities: number;
  recentOpportunities: Opportunity[];
}