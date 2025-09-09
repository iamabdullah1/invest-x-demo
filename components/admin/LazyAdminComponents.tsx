"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Lazy load heavy admin components
export const LazyAdminProjects = dynamic(
  () => import('@/app/admin/projects/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Projects...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    ssr: false
  }
)

export const LazyAdminInvestors = dynamic(
  () => import('@/app/admin/investors/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Investors...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    ssr: false
  }
)

export const LazyAdminAnalytics = dynamic(
  () => import('@/app/admin/analytics/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Analytics...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    ssr: false
  }
)
