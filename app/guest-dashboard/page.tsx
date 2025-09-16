"use client"

import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building2, UserCheck, Star, ArrowRight, Eye, RefreshCw, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import Image from "next/image"

interface Project {
  _id: string
  id: string
  title: string
  location: {
    area?: string
    city: string
    address?: string
  }
  type: string
  status: string
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  images: string[]
  developer: {
    name: string
  }
  featured?: boolean
  progress: number
}

// Currency formatter for PKR
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `PKR ${(amount / 10000000).toFixed(1)} Cr`
  } else if (amount >= 100000) {
    return `PKR ${(amount / 100000).toFixed(1)} Lac`
  } else {
    return `PKR ${amount.toLocaleString()}`
  }
}

export default function GuestDashboardPage() {
  const { user, refreshUser } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<string>('none')
  const [verificationData, setVerificationData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Fetch real projects from the database
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true)
      const response = await fetch('/api/projects?limit=3&featured=true')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  // Get featured projects (top 3 by expected return if no featured projects)
  const featuredProjects = projects.length > 0 
    ? projects.slice(0, 3)
    : []

  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/auth/verification-status', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data.user.verificationStatus || 'none')
        setVerificationData(data.user.verificationData || null)
        
        // If status is approved, refresh the user context to update role
        if (data.user.verificationStatus === 'approved' && user?.role === 'guest') {
          await refreshUser()
        }
      }
    } catch (error) {
      // Handle error silently to avoid console pollution
    }
  }

  // Auto-refresh verification status every 2 minutes and fetch projects
  useEffect(() => {
    checkVerificationStatus()
    fetchProjects()
    const interval = setInterval(checkVerificationStatus, 120000) // 2 minutes
    return () => clearInterval(interval)
  }, [user])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([checkVerificationStatus(), refreshUser()])
    setIsRefreshing(false)
  }

  return (
    <RoleGuard requiredRole="guest">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to InvestX</h1>
          <p className="text-muted-foreground">Explore premium real estate investment opportunities</p>
        </div>

        {/* Verification Status Card */}
        {verificationStatus === 'pending' && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <CardTitle className="text-lg text-yellow-900">Verification Under Review</CardTitle>
                    <CardDescription className="text-yellow-700">
                      Your investor verification is being processed. We'll notify you once approved.
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Checking...' : 'Check Status'}
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {verificationStatus === 'approved' && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-lg text-green-900">Verification Approved!</CardTitle>
                    <CardDescription className="text-green-700">
                      Congratulations! Your investor status has been approved. Redirecting to investor dashboard...
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {verificationStatus === 'rejected' && (
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-6 w-6 text-red-600" />
                  <div>
                    <CardTitle className="text-lg text-red-900">Verification Needs Attention</CardTitle>
                    <CardDescription className="text-red-700">
                      Your verification request needs to be updated. Please submit a new request.
                    </CardDescription>
                    {verificationData?.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                        <strong>Reason:</strong> {verificationData.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/auth/investor-verification">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Submit New Request
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Become Investor CTA - Only show if no verification submitted */}
        {verificationStatus === 'none' && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-blue-900">Ready to Start Investing?</CardTitle>
                  <CardDescription className="text-blue-700">
                    Upgrade to investor status and unlock exclusive investment opportunities
                  </CardDescription>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/auth/investor-verification">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Become an Investor
                  </Link>
                </Button>
              </div>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Premium Projects</h4>
                  <p className="text-sm text-blue-700">Access exclusive investment opportunities</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">High Returns</h4>
                  <p className="text-sm text-blue-700">Earn up to 15%+ annual returns</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Expert Support</h4>
                  <p className="text-sm text-blue-700">Get dedicated investment guidance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Featured Projects Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Featured Investment Opportunities</CardTitle>
                <CardDescription>Explore top-performing real estate projects</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/projects">
                  View All Projects
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectsLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : featuredProjects.length > 0 ? (
                featuredProjects.map((project, index) => (
                  <Card key={project._id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video overflow-hidden relative">
                      <Image
                        src={project.images[0] || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">
                          {project.expectedReturn}% Returns
                        </Badge>
                      </div>
                      {(index === 0 || project.featured) && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            🏆 Top Pick
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-1">{project.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {project.location?.area && project.location?.city 
                          ? `${project.location.area}, ${project.location.city}`
                          : project.location?.city || 'Location not specified'
                        }
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Min Investment</p>
                          <p className="font-medium text-sm">{formatCurrency(project.minInvestment)}</p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/projects/${project.id || project._id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No featured projects available at the moment.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{projects.length}+</h3>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {projects.length > 0 
                      ? Math.round(projects.reduce((acc, p) => acc + p.expectedReturn, 0) / projects.length)
                      : 15
                    }%
                  </h3>
                  <p className="text-sm text-muted-foreground">Average Returns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">1000+</h3>
                  <p className="text-sm text-muted-foreground">Happy Investors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-2">Ready to Start Your Investment Journey?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of investors who are building wealth through real estate
            </p>
            <Button asChild size="lg">
              <Link href="/auth/investor-verification">
                <UserCheck className="h-5 w-5 mr-2" />
                Become an Investor Today
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
