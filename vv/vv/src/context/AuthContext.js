import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await ApiService.getToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await ApiService.getUserProfile();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        await ApiService.removeToken();
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      setIsAuthenticated(false);
      setUser(null);
      await ApiService.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, userType = 'user') => {
    try {
      // Clear any existing data before login to prevent data contamination
      await ApiService.clearAllStoredData();
      setUser(null);
      setIsAuthenticated(false);
      
      const response = await ApiService.login(email, password, userType);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear all user state completely
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const handleTokenExpiration = async () => {
    console.log('Token expired, logging out user');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    await ApiService.clearAllStoredData();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    handleTokenExpiration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
