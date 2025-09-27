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
            const parsedUser = userData;
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

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.doubleehbatteries.com/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', data.user_id); // Assuming API returns { user: userData }
        }
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        console.error('Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Network error during login:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.doubleehbatteries.com/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        login(credentials);
        return { success: true };
      } else {
        console.error('Signup failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Network error during signup:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
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
    signup, // Add signup to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
