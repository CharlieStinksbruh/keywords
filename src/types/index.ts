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
  platform: 'reddit' | 'quora' | 'stackoverflow' | 'hackernews' | 'producthunt' | 'indiehackers';
  url: string;
  title: string;
  snippet: string;
  rankingPosition: number;
  discoveredAt: string;
  visited: boolean;
}

export interface Dashboard {
  totalClients: number;
  totalKeywords: number;
  totalOpportunities: number;
  recentOpportunities: Opportunity[];
}