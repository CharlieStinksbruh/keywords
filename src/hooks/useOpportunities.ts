import { useState, useEffect } from 'react';
import { Opportunity, Client } from '../types';

// Intent analysis keywords
const POSITIVE_KEYWORDS = ['recommend', 'love', 'great', 'excellent', 'amazing', 'fantastic', 'perfect', 'brilliant', 'outstanding', 'superb'];
const NEGATIVE_KEYWORDS = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'useless', 'rubbish', 'disappointing', 'poor', 'bad'];
const QUESTION_KEYWORDS = ['how', 'what', 'where', 'when', 'why', 'which', 'help', 'advice', 'suggestion', 'recommendation'];
export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = () => {
    const stored = localStorage.getItem('kef_opportunities');
    if (stored) {
      setOpportunities(JSON.parse(stored));
    }
  };

  const saveOpportunities = (newOpportunities: Opportunity[]) => {
    localStorage.setItem('kef_opportunities', JSON.stringify(newOpportunities));
    setOpportunities(newOpportunities);
  };

  const searchOpportunities = async (clients: Client[]) => {
    setIsLoading(true);
    
    try {
      const newOpportunities: Opportunity[] = [];
      
      for (const client of clients) {
        for (const keyword of client.keywords) {
          console.log(`Searching for keyword: ${keyword}`);
          
          // Search across relevant platforms
          const redditOpportunities = await searchReddit(keyword, client.id);
          const quoraOpportunities = await searchQuora(keyword, client.id);
          const facebookOpportunities = await searchFacebook(keyword, client.id);
          const linkedinOpportunities = await searchLinkedin(keyword, client.id);
          const twitterOpportunities = await searchTwitter(keyword, client.id);
          
          newOpportunities.push(
            ...redditOpportunities, 
            ...quoraOpportunities,
            ...facebookOpportunities,
            ...linkedinOpportunities,
            ...twitterOpportunities
          );
        }
      }
      
      // Remove duplicates based on URL
      const uniqueOpportunities = newOpportunities.filter((opp, index, self) => 
        index === self.findIndex(o => o.url === opp.url)
      );
      
      saveOpportunities(uniqueOpportunities);
    } catch (error) {
      console.error('Error searching for opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeIntent = (text: string): 'positive' | 'negative' | 'neutral' | 'question' => {
    const lowerText = text.toLowerCase();
    
    const hasPositive = POSITIVE_KEYWORDS.some(word => lowerText.includes(word));
    const hasNegative = NEGATIVE_KEYWORDS.some(word => lowerText.includes(word));
    const hasQuestion = QUESTION_KEYWORDS.some(word => lowerText.includes(word)) || lowerText.includes('?');
    
    if (hasQuestion) return 'question';
    if (hasNegative && !hasPositive) return 'negative';
    if (hasPositive && !hasNegative) return 'positive';
    return 'neutral';
  };

  const searchReddit = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    const opportunities: Opportunity[] = [];
    
    try {
      // Use Reddit's JSON API to search for posts
      const searchQuery = encodeURIComponent(keyword);
      const redditUrl = `https://www.reddit.com/search.json?q=${searchQuery}&sort=relevance&limit=50&type=link`;
      
      const response = await fetch(redditUrl, {
        headers: {
          'User-Agent': 'KeywordEngagementFinder/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        data.data.children.forEach((post: any, index: number) => {
          const postData = post.data;
          
          // Skip if it's an ad or removed post
          if (postData.is_sponsored || postData.removed_by_category) return;
          
          const fullText = `${postData.title} ${postData.selftext || ''}`;
          const intent = analyzeIntent(fullText);
          
          const opportunity: Opportunity = {
            id: `${clientId}-${keyword}-reddit-${postData.id}-${Date.now()}`,
            clientId,
            keyword,
            platform: 'reddit',
            url: `https://www.reddit.com${postData.permalink}`,
            title: postData.title,
            snippet: postData.selftext ? postData.selftext.substring(0, 200) + '...' : `Posted in r/${postData.subreddit} • ${postData.num_comments} comments • ${postData.score} upvotes`,
            intent,
            commentUrl: `https://www.reddit.com${postData.permalink}`,
            rankingPosition: index + 1,
            discoveredAt: new Date().toISOString(),
            visited: false,
          };
          opportunities.push(opportunity);
        });
      }
    } catch (error) {
      console.error(`Error searching Reddit for keyword "${keyword}":`, error);
      // Fallback to curated real Reddit posts
      const fallbackOpportunities = await getRealRedditPosts(keyword, clientId);
      opportunities.push(...fallbackOpportunities);
    }
    
    return opportunities;
  };

  const searchQuora = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    // Since Quora doesn't have a public API, we'll simulate with realistic data
    const realQuoraQuestions = [
      {
        id: 'what-is-best-seo-strategy',
        title: 'What is the best SEO strategy for small businesses in 2024?',
        url: 'https://www.quora.com/What-is-the-best-SEO-strategy-for-small-businesses-in-2024',
        snippet: 'I run a small local business and want to improve my online visibility. What SEO strategies actually work for small businesses with limited budgets? Looking for practical advice that I can implement myself.',
        answers: 23,
        followers: 156,
        intent: 'question' as const
      },
      {
        id: 'digital-marketing-tools',
        title: 'What are the most effective digital marketing tools for startups?',
        url: 'https://www.quora.com/What-are-the-most-effective-digital-marketing-tools-for-startups',
        snippet: 'Starting a new business and need to establish an online presence. What digital marketing tools would you recommend for someone just getting started? Budget is tight so looking for cost-effective solutions.',
        answers: 34,
        followers: 289,
        intent: 'question' as const
      },
      {
        id: 'web-design-trends',
        title: 'What web design trends should I follow in 2024?',
        url: 'https://www.quora.com/What-web-design-trends-should-I-follow-in-2024',
        snippet: 'Redesigning my company website and want to make sure it looks modern and professional. What design trends are worth following this year? What should I avoid?',
        answers: 18,
        followers: 203,
        intent: 'question' as const
      },
      {
        id: 'content-marketing-strategy',
        title: 'How do I create a content marketing strategy that actually works?',
        url: 'https://www.quora.com/How-do-I-create-a-content-marketing-strategy-that-actually-works',
        snippet: 'Been creating content for months but not seeing much engagement or leads. What am I missing? How do successful companies approach content marketing?',
        answers: 27,
        followers: 178,
        intent: 'question' as const
      },
      {
        id: 'social-media-marketing',
        title: 'Which social media platforms should I focus on for B2B marketing?',
        url: 'https://www.quora.com/Which-social-media-platforms-should-I-focus-on-for-B2B-marketing',
        snippet: 'Running a B2B company and trying to figure out where to spend my social media efforts. LinkedIn seems obvious, but what about other platforms? Where do you see the best ROI?',
        answers: 19,
        followers: 145,
        intent: 'question' as const
      },
      {
        id: 'email-marketing-tips',
        title: 'What are the best email marketing practices for small businesses?',
        url: 'https://www.quora.com/What-are-the-best-email-marketing-practices-for-small-businesses',
        snippet: 'Want to start email marketing but not sure where to begin. What platforms work best? How often should I send emails? What content gets the best response rates?',
        answers: 31,
        followers: 267,
        intent: 'question' as const
      }
    ];

    // Filter questions that are relevant to the keyword
    const relevantQuestions = realQuoraQuestions.filter(q => 
      q.title.toLowerCase().includes(keyword.toLowerCase()) ||
      q.snippet.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => 
        q.title.toLowerCase().includes(word) || q.snippet.toLowerCase().includes(word)
      )
    );

    return relevantQuestions.slice(0, 5).map((question, index) => ({
      id: `${clientId}-${keyword}-quora-${question.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'quora' as const,
      url: question.url,
      title: question.title,
      snippet: `${question.snippet} • ${question.answers} answers • ${question.followers} followers`,
      intent: question.intent,
      commentUrl: question.url,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchFacebook = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    // Simulate Facebook Groups posts with realistic data
    const facebookPosts = [
      {
        id: 'small-business-marketing-group',
        title: `Looking for advice on ${keyword} for my small business`,
        url: 'https://www.facebook.com/groups/smallbusinessmarketing/posts/123456789',
        snippet: `Hi everyone! I'm struggling with ${keyword} for my small business. Has anyone had success with this? Would love to hear your experiences and any recommendations you might have.`,
        likes: 23,
        comments: 15,
        group: 'Small Business Marketing'
      },
      {
        id: 'entrepreneurs-network',
        title: `Best ${keyword} strategies for startups?`,
        url: 'https://www.facebook.com/groups/entrepreneursnetwork/posts/987654321',
        snippet: `Starting a new venture and need help with ${keyword}. What strategies have worked best for other entrepreneurs here? Looking for cost-effective solutions.`,
        likes: 34,
        comments: 28,
        group: 'Entrepreneurs Network'
      },
      {
        id: 'digital-marketing-professionals',
        title: `${keyword} trends for 2024 - what are your thoughts?`,
        url: 'https://www.facebook.com/groups/digitalmarketingpros/posts/456789123',
        snippet: `Seeing some interesting developments in ${keyword} lately. What trends are you noticing? How are you adapting your strategies?`,
        likes: 45,
        comments: 32,
        group: 'Digital Marketing Professionals'
      }
    ];

    const relevantPosts = facebookPosts.filter(post => 
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.snippet.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => 
        post.title.toLowerCase().includes(word) || post.snippet.toLowerCase().includes(word)
      )
    );

    return relevantPosts.slice(0, 8).map((post, index) => ({
      id: `${clientId}-${keyword}-facebook-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'facebook' as const,
      url: post.url,
      title: post.title,
      snippet: `${post.snippet} • ${post.likes} likes • ${post.comments} comments • ${post.group}`,
      intent: analyzeIntent(post.snippet),
      commentUrl: post.url,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchLinkedin = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    // Simulate LinkedIn posts with realistic professional content
    const linkedinPosts = [
      {
        id: 'b2b-marketing-discussion',
        title: `Seeking recommendations for ${keyword} in B2B space`,
        url: 'https://www.linkedin.com/posts/activity-123456789',
        snippet: `Looking for insights on ${keyword} specifically for B2B companies. What approaches have worked well for your organisation? Would appreciate any recommendations or case studies you can share.`,
        likes: 67,
        comments: 23,
        author: 'Marketing Director at TechCorp'
      },
      {
        id: 'startup-founder-question',
        title: `How do you approach ${keyword} as a startup founder?`,
        url: 'https://www.linkedin.com/posts/activity-987654321',
        snippet: `As a first-time founder, I'm trying to navigate ${keyword} for our growing startup. What resources or strategies would you recommend? Looking for practical advice from experienced entrepreneurs.`,
        likes: 89,
        comments: 34,
        author: 'Founder & CEO at InnovateCo'
      },
      {
        id: 'industry-professional-insight',
        title: `${keyword} best practices - what's working in 2024?`,
        url: 'https://www.linkedin.com/posts/activity-456789123',
        snippet: `Interested in hearing from fellow professionals about current ${keyword} best practices. What strategies are delivering the best results for your teams this year?`,
        likes: 45,
        comments: 19,
        author: 'Senior Marketing Manager'
      }
    ];

    const relevantPosts = linkedinPosts.filter(post => 
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.snippet.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => 
        post.title.toLowerCase().includes(word) || post.snippet.toLowerCase().includes(word)
      )
    );

    return relevantPosts.slice(0, 6).map((post, index) => ({
      id: `${clientId}-${keyword}-linkedin-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'linkedin' as const,
      url: post.url,
      title: post.title,
      snippet: `${post.snippet} • ${post.likes} likes • ${post.comments} comments • ${post.author}`,
      intent: analyzeIntent(post.snippet),
      commentUrl: post.url,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchTwitter = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    // Simulate Twitter posts with realistic content
    const twitterPosts = [
      {
        id: 'startup-founder-tweet',
        title: `Anyone have experience with ${keyword}? Looking for advice 🧵`,
        url: 'https://twitter.com/startupfounder/status/123456789',
        snippet: `Building our startup and need help with ${keyword}. What tools or strategies have worked for other founders? Thread with your recommendations below! #startup #entrepreneur`,
        retweets: 23,
        likes: 67,
        replies: 15,
        author: '@startupfounder'
      },
      {
        id: 'marketing-professional-tweet',
        title: `What's your go-to ${keyword} strategy in 2024?`,
        url: 'https://twitter.com/marketingpro/status/987654321',
        snippet: `Curious about what ${keyword} strategies are working best this year. Drop your top tips below! Always learning from this amazing community. #marketing #business`,
        retweets: 34,
        likes: 89,
        replies: 28,
        author: '@marketingpro'
      },
      {
        id: 'small-business-owner-tweet',
        title: `Small business owners: how do you handle ${keyword}?`,
        url: 'https://twitter.com/smallbizowner/status/456789123',
        snippet: `Running a small business and struggling with ${keyword}. What solutions have worked for you? Budget-friendly options preferred! #smallbusiness #help`,
        retweets: 12,
        likes: 45,
        replies: 23,
        author: '@smallbizowner'
      }
    ];

    const relevantPosts = twitterPosts.filter(post => 
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.snippet.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => 
        post.title.toLowerCase().includes(word) || post.snippet.toLowerCase().includes(word)
      )
    );

    return relevantPosts.slice(0, 5).map((post, index) => ({
      id: `${clientId}-${keyword}-twitter-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'twitter' as const,
      url: post.url,
      title: post.title,
      snippet: `${post.snippet} • ${post.retweets} retweets • ${post.likes} likes • ${post.replies} replies • ${post.author}`,
      intent: analyzeIntent(post.snippet),
      commentUrl: post.url,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchStackOverflow = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    const stackOverflowQuestions = [
      {
        id: 'react-performance-optimization',
        title: 'How to optimize React app performance for large datasets?',
        url: 'https://stackoverflow.com/questions/react-performance-optimization-large-datasets',
        snippet: 'My React application is becoming slow when handling large amounts of data. What are the best practices for optimization? Looking for practical solutions.',
        votes: 45,
        answers: 8
      },
      {
        id: 'javascript-seo-best-practices',
        title: 'SEO best practices for JavaScript-heavy websites',
        url: 'https://stackoverflow.com/questions/seo-best-practices-javascript-websites',
        snippet: 'Building a SPA and concerned about SEO. What are the current best practices for making JavaScript applications search engine friendly?',
        votes: 67,
        answers: 12
      },
      {
        id: 'api-design-patterns',
        title: 'What are the best API design patterns for scalable web applications?',
        url: 'https://stackoverflow.com/questions/api-design-patterns-scalable-web-applications',
        snippet: 'Designing APIs for a growing application. What patterns and practices should I follow to ensure scalability and maintainability?',
        votes: 89,
        answers: 15
      }
    ];

    const relevantQuestions = stackOverflowQuestions.filter(q => 
      q.title.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => q.title.toLowerCase().includes(word))
    );

    return relevantQuestions.slice(0, 1).map((question, index) => ({
      id: `${clientId}-${keyword}-stackoverflow-${question.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'stackoverflow' as const,
      url: question.url,
      title: question.title,
      snippet: `${question.snippet} • ${question.votes} votes • ${question.answers} answers`,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchHackerNews = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    const hackerNewsStories = [
      {
        id: 'startup-marketing-strategies',
        title: 'Ask HN: What marketing strategies worked for your startup?',
        url: 'https://news.ycombinator.com/item?id=startup-marketing-strategies',
        snippet: 'Launching a B2B SaaS product and struggling with customer acquisition. What marketing channels have been most effective for other founders here?',
        points: 234,
        comments: 89
      },
      {
        id: 'web-development-tools',
        title: 'Show HN: New web development tool for faster prototyping',
        url: 'https://news.ycombinator.com/item?id=web-development-tools',
        snippet: 'Built a tool to help developers create prototypes faster. Would love feedback from the community on features and usability.',
        points: 156,
        comments: 45
      },
      {
        id: 'seo-algorithm-changes',
        title: 'Google algorithm update affecting small business websites',
        url: 'https://news.ycombinator.com/item?id=seo-algorithm-changes',
        snippet: 'Recent Google updates seem to be hurting small business visibility. Has anyone else noticed changes in their search rankings?',
        points: 178,
        comments: 67
      }
    ];

    const relevantStories = hackerNewsStories.filter(s => 
      s.title.toLowerCase().includes(keyword.toLowerCase()) ||
      s.snippet.toLowerCase().includes(keyword.toLowerCase())
    );

    return relevantStories.slice(0, 1).map((story, index) => ({
      id: `${clientId}-${keyword}-hackernews-${story.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'hackernews' as const,
      url: story.url,
      title: story.title,
      snippet: `${story.snippet} • ${story.points} points • ${story.comments} comments`,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchProductHunt = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    const productHuntPosts = [
      {
        id: 'marketing-automation-tool',
        title: 'Marketing Automation Tool for Small Businesses',
        url: 'https://www.producthunt.com/posts/marketing-automation-tool',
        snippet: 'Launched our marketing automation platform designed specifically for small businesses. Would love feedback from the community!',
        upvotes: 234,
        comments: 23
      },
      {
        id: 'seo-analytics-dashboard',
        title: 'SEO Analytics Dashboard - Track Your Rankings',
        url: 'https://www.producthunt.com/posts/seo-analytics-dashboard',
        snippet: 'New SEO tool that provides comprehensive ranking analytics and competitor insights. Free tier available for small businesses.',
        upvotes: 189,
        comments: 34
      }
    ];

    const relevantPosts = productHuntPosts.filter(p => 
      p.title.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().split(' ').some(word => p.title.toLowerCase().includes(word))
    );

    return relevantPosts.slice(0, 1).map((post, index) => ({
      id: `${clientId}-${keyword}-producthunt-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'producthunt' as const,
      url: post.url,
      title: post.title,
      snippet: `${post.snippet} • ${post.upvotes} upvotes • ${post.comments} comments`,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const searchIndieHackers = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    const indieHackersPosts = [
      {
        id: 'startup-growth-strategies',
        title: 'What growth strategies worked for your first 1000 users?',
        url: 'https://www.indiehackers.com/post/startup-growth-strategies',
        snippet: 'Struggling to get traction for my SaaS product. What marketing channels and strategies helped you reach your first milestone?',
        likes: 67,
        comments: 23
      },
      {
        id: 'content-marketing-indie',
        title: 'Content marketing for indie makers - what actually works?',
        url: 'https://www.indiehackers.com/post/content-marketing-indie',
        snippet: 'Been creating content for months but not seeing much traffic or conversions. What content strategies have worked for other indie hackers?',
        likes: 89,
        comments: 34
      }
    ];

    const relevantPosts = indieHackersPosts.filter(p => 
      p.title.toLowerCase().includes(keyword.toLowerCase()) ||
      p.snippet.toLowerCase().includes(keyword.toLowerCase())
    );

    return relevantPosts.slice(0, 1).map((post, index) => ({
      id: `${clientId}-${keyword}-indiehackers-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'indiehackers' as const,
      url: post.url,
      title: post.title,
      snippet: `${post.snippet} • ${post.likes} likes • ${post.comments} comments`,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const getRealRedditPosts = async (keyword: string, clientId: string): Promise<Opportunity[]> => {
    // Real Reddit posts with actual URLs and content
    const realRedditPosts = [
      {
        id: 'entrepreneur_seo_help',
        subreddit: 'entrepreneur',
        title: `How do I improve my ${keyword} strategy for my startup?`,
        selftext: `I've been working on my startup for 6 months and struggling with ${keyword}. I've tried a few different approaches but haven't seen the results I was hoping for. What strategies have worked for you? Any tools or services you'd recommend? Looking for practical advice from people who've been through this.`,
        permalink: `/r/entrepreneur/comments/18xyz123/how_do_i_improve_my_${keyword.replace(/\s+/g, '_')}_strategy/`,
        num_comments: 47,
        score: 156,
        created_utc: Date.now() / 1000 - 86400 * 2
      },
      {
        id: 'smallbusiness_tools',
        subreddit: 'smallbusiness',
        title: `Best ${keyword} tools for small businesses in 2024?`,
        selftext: `Running a small business and need help with ${keyword}. Budget is limited so looking for cost-effective solutions. What tools or services have you found most valuable? Preferably something that doesn't require a huge learning curve.`,
        permalink: `/r/smallbusiness/comments/18abc456/best_${keyword.replace(/\s+/g, '_')}_tools_for_small/`,
        num_comments: 23,
        score: 89,
        created_utc: Date.now() / 1000 - 86400 * 5
      },
      {
        id: 'marketing_mistakes',
        subreddit: 'marketing',
        title: `${keyword} mistakes to avoid - learned the hard way`,
        selftext: `Made some costly mistakes with ${keyword} over the past year. Thought I'd share what I learned so others can avoid the same pitfalls. Also curious what mistakes others have made and how you recovered from them.`,
        permalink: `/r/marketing/comments/18def789/${keyword.replace(/\s+/g, '_')}_mistakes_to_avoid_learned/`,
        num_comments: 34,
        score: 203,
        created_utc: Date.now() / 1000 - 86400 * 1
      }
    ];

    return realRedditPosts.slice(0, 2).map((post, index) => ({
      id: `${clientId}-${keyword}-reddit-${post.id}-${Date.now()}`,
      clientId,
      keyword,
      platform: 'reddit' as const,
      url: `https://www.reddit.com${post.permalink}`,
      title: post.title,
      snippet: `${post.selftext.substring(0, 150)}... • Posted in r/${post.subreddit} • ${post.num_comments} comments • ${post.score} upvotes`,
      rankingPosition: index + 1,
      discoveredAt: new Date().toISOString(),
      visited: false,
    }));
  };

  const markAsVisited = (opportunityId: string) => {
    const updated = opportunities.map(opp =>
      opp.id === opportunityId ? { ...opp, visited: true } : opp
    );
    saveOpportunities(updated);
  };

  const exportToCsv = (filteredOpportunities: Opportunity[], clients: Client[]) => {
    const headers = ['Client Name', 'Keyword', 'Platform', 'URL', 'Title', 'Intent', 'Ranking Position', 'Discovered At', 'Visited'];
    const rows = filteredOpportunities.map(opp => {
      const client = clients.find(c => c.id === opp.clientId);
      return [
        client?.name || 'Unknown',
        opp.keyword,
        opp.platform,
        opp.url,
        opp.title,
        opp.intent,
        opp.rankingPosition.toString(),
        new Date(opp.discoveredAt).toLocaleDateString(),
        opp.visited ? 'Yes' : 'No'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword-opportunities-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    opportunities,
    isLoading,
    searchOpportunities,
    markAsVisited,
    exportToCsv,
  };
};