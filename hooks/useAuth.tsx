"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// User interface for frontend
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest' | 'investor' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  city?: string;
  phone?: string;
  cnicNumber?: string;
  totalInvested: number;
  portfolioValue: number;
  joinDate: string;
  lastLogin?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (requiredRole: 'guest' | 'investor' | 'admin') => boolean;
  isAuthenticated: boolean;
  clearError: () => void;
}

// Registration data interface
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

// Role hierarchy for checking permissions
const ROLE_HIERARCHY = {
  guest: 0,
  investor: 1,
  admin: 2
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear error function
  const clearError = () => setError(null);

  // Check if user has required role
  const hasRole = (requiredRole: 'guest' | 'investor' | 'admin'): boolean => {
    if (!user) return requiredRole === 'guest';
    
    const userRoleLevel = ROLE_HIERARCHY[user.role];
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
    
    return userRoleLevel >= requiredRoleLevel;
  };

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  // Fetch current user on app load
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Try main authentication API first
      let response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();

      // If main auth fails, try mock authentication
      if (!response.ok) {
        console.warn('Main auth failed, trying mock auth');
        response = await fetch('/api/auth/mock-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        data = await response.json();
      }

      if (response.ok) {
        setUser(data.user);
        // Handle role-based redirect
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'investor') {
          window.location.href = '/dashboard';
        } else if (data.user.role === 'guest') {
          window.location.href = '/guest-dashboard';
        }
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API fails
    } finally {
      setUser(null);
      setError(null);
      
      // Clear any localStorage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('investx-role');
        localStorage.removeItem('user-data');
      }
      
      router.push('/');
    }
  };

  // Auto-refresh token periodically
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    };

    // Refresh token every 23 hours (tokens expire in 24 hours)
    const interval = setInterval(refreshToken, 23 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    isAuthenticated,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'guest' | 'investor' | 'admin'
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/auth/login');
          return;
        }

        if (requiredRole && !hasRole(requiredRole)) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [user, loading, hasRole, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user || (requiredRole && !hasRole(requiredRole))) {
      return null;
    }

    return <Component {...props} />;
  };
}
