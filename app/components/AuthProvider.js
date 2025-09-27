"use client";

import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isAuthenticated');
        const userData = localStorage.getItem('user');

        if (authStatus === 'true' && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
