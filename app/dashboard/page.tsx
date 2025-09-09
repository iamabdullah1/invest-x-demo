"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building2, Wallet, Target, ArrowUpRight, ArrowDownRight, Plus, Eye, ImageIcon } from "lucide-react"
import Link from "next/link"

interface Investment {
  _id: string
  amount: number
  currentValue: number
  returns: number
  projectTitle: string
  projectProgress: number
  projectLocation: string
  projectStatus: string
  createdAt: string
}

interface Portfolio {
  totalInvested: number
  totalCurrentValue: number
  totalReturns: number
  returnPercentage: number
  activeInvestments: number
}

interface Project {
  _id: string
  title: string
  location: {
    city: string
    area: string
    address: string
  }
  city: string
  type: string
  status: string
  targetAmount: number
  raisedAmount: number
  expectedReturn: number
  duration: number
  images: string[]
  developer: {
    name: string
  }
  createdAt: string
  progress?: number
}

interface DashboardData {
  portfolio: Portfolio
  investments: Investment[]
  featuredProjects: Project[]
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/user/dashboard', {
        credentials: 'include' // Include cookies for authentication
      })
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format')
      }
      
      const result = await response.json()
      
      if (response.status === 401) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login'
        return
      }
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
        console.error('Failed to fetch dashboard data:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        setError('Authentication required. Please login again.')
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      } else {
        setError('Network error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProgress = (raised: number, target: number) => {
    return Math.round((raised / target) * 100)
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  const portfolio = dashboardData?.portfolio || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalReturns: 0,
    returnPercentage: 0,
    activeInvestments: 0
  }
  
  const investments = dashboardData?.investments || []
  const featuredProjects = dashboardData?.featuredProjects || []

  return (
    <RoleGuard requiredRole="investor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Dashboard</h1>
            <p className="text-muted-foreground">Track your real estate investments and discover new opportunities</p>
          </div>
          <Button asChild>
            <Link href="/projects">
              <Plus className="h-4 w-4 mr-2" />
              New Investment
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolio.totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Across {investments.length} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolio.totalCurrentValue)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />+{portfolio.returnPercentage.toFixed(1)}% growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(portfolio.totalReturns)}</div>
              <p className="text-xs text-muted-foreground">Unrealized gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.activeInvestments}</div>
              <p className="text-xs text-muted-foreground">Investment positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Investments</CardTitle>
            <CardDescription>Track the performance of your latest investments</CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No investments yet</h3>
                <p className="text-muted-foreground mb-4">Start investing in real estate projects to see your portfolio here</p>
                <Button asChild>
                  <Link href="/projects">Explore Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.slice(0, 5).map((investment) => {
                  const returnPercentage = investment.amount > 0 ? (investment.returns / investment.amount) * 100 : 0

                  return (
                    <div key={investment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{investment.projectTitle}</h4>
                          <p className="text-sm text-muted-foreground">{investment.projectLocation}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={investment.projectProgress} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground">{investment.projectProgress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                        <div
                          className={`text-sm flex items-center justify-end ${investment.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {investment.returns >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invested: {formatCurrency(investment.amount)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {investments.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/portfolio">View All Investments</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Available Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Investment Opportunities</CardTitle>
            <CardDescription>Discover new projects available for investment</CardDescription>
          </CardHeader>
          <CardContent>
            {featuredProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No projects available at the moment</p>
                <Button asChild>
                  <Link href="/projects">Browse All Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <div key={project._id} className="border rounded-lg p-4 space-y-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={project.type === "residential" ? "default" : "secondary"}>{project.type}</Badge>
                        <Badge variant="outline">{project.expectedReturn}% Returns</Badge>
                      </div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.location?.area || project.city}, {project.location?.city || project.city}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress || calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                        </div>
                        <Progress value={project.progress || calculateProgress(project.raisedAmount, project.targetAmount)} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target</span>
                        <span className="font-medium">{formatCurrency(project.targetAmount)}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/projects/${project._id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
