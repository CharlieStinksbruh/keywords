import { useState, useEffect } from 'react';
import { RedditAuth } from '../types';

export const useRedditAuth = () => {
  const [redditAuth, setRedditAuth] = useState<RedditAuth>({
    username: '',
    password: '',
    isAuthenticated: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('kef_reddit_auth');
    if (stored) {
      setRedditAuth(JSON.parse(stored));
    }
  }, []);

  const saveAuth = (auth: RedditAuth) => {
    localStorage.setItem('kef_reddit_auth', JSON.stringify(auth));
    setRedditAuth(auth);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real implementation, this would authenticate with Reddit's API
    // For demo purposes, we'll simulate authentication
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any non-empty credentials
      if (username.trim() && password.trim()) {
        const auth: RedditAuth = {
          username,
          password,
          isAuthenticated: true,
        };
        saveAuth(auth);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Reddit authentication failed:', error);
      return false;
    }
  };

  const logout = () => {
    const auth: RedditAuth = {
      username: '',
      password: '',
      isAuthenticated: false,
    };
    saveAuth(auth);
  };

  const postComment = async (postUrl: string, comment: string): Promise<boolean> => {
    if (!redditAuth.isAuthenticated) {
      throw new Error('Not authenticated with Reddit');
    }

    try {
      // In a real implementation, this would use Reddit's API to post a comment
      // For demo purposes, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Posting comment to ${postUrl}:`, comment);
      console.log(`Authenticated as: ${redditAuth.username}`);
      
      // Simulate success
      return true;
    } catch (error) {
      console.error('Failed to post comment:', error);
      return false;
    }
  };

  return {
    redditAuth,
    login,
    logout,
    postComment,
  };
};