'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from "@/components/landing-page";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
