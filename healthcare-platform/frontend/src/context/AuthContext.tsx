'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 2;

    const verifySession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await apiClient.get('/auth/me');
          if (response.data && response.data.id) {
            setUser(response.data);
            setIsLoading(false);
          } else {
            throw new Error('Invalid user data');
          }
        } catch (error: any) {
           // If it's a network error and we have retries left, try again
           if (retryCount < maxRetries && !error.response) {
             retryCount++;
             console.log(`Retrying session verification (${retryCount}/${maxRetries})...`);
             setTimeout(verifySession, 1000);
             return;
           }

           console.warn('Session verification failed:', error);
           if (typeof window !== 'undefined') localStorage.removeItem('authToken');
           setUser(null);
           delete apiClient.defaults.headers.common['Authorization'];
           setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
      }
      setUser(response.data.user);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/signup', { email, password, fullName });
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
      }
      setUser(response.data.user);
      router.push('/profile-setup');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
