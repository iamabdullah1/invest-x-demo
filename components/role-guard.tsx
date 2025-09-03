"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'guest' | 'investor' | 'admin';
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback,
  showError = true 
}: RoleGuardProps) {
  const { user, loading, hasRole, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this content.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  // Check role permissions
  if (!hasRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this content. Required role: {requiredRole}.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  // User has required permissions
  return <>{children}</>;
}
