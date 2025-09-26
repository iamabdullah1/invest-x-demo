'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from "@/components/landing-page";

export default function HomePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Always refresh user data when home page loads to get latest role
    if (!loading) {
      refreshUser();
    }
  }, [loading, refreshUser]);

  // Periodic refresh to check for role updates (every 2 minutes)
  useEffect(() => {
    if (!loading && user) {
      const interval = setInterval(() => {
        refreshUser();
      }, 120000); // 2 minutes

      return () => clearInterval(interval);
    }
  }, [loading, user, refreshUser]);

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their appropriate dashboards
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'investor') {
        router.replace('/dashboard');
      } else if (user.role === 'guest') {
        router.replace('/guest-dashboard');
      }
    }
  }, [user, loading, router]);

  // Show landing page only for unauthenticated users
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected, so show nothing
  if (user) {
    return null;
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
