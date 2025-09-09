'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatCurrency, calculateProgress } from "@/lib/mockData"

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  upcomingProjects: number
  totalRaised: number
  totalTarget: number
  totalInvestors: number
  activeInvestors: number
  pendingApprovals: number
}

interface RecentProject {
  _id: string
  title: string
  location: {
    city?: string
    area?: string
  }
  status: string
  raisedAmount: number
  targetAmount: number
  progress: number
}

interface ActivityItem {
  id: string
  type: string
  message: string
  time: string
  status: string
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    upcomingProjects: 0,
    totalRaised: 0,
    totalTarget: 0,
    totalInvestors: 0,
    activeInvestors: 0,
    pendingApprovals: 0
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setRecentProjects(data.data.recentProjects)
        setRecentActivity(data.data.recentActivity)
      } else {
        console.error('Failed to fetch dashboard data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your real estate investment platform</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProjects} active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
              <p className="text-xs text-green-600">
                {stats.totalTarget > 0 ? ((stats.totalRaised / stats.totalTarget) * 100).toFixed(1) : 0}% of target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvestors}</div>
              <p className="text-xs text-muted-foreground">{stats.activeInvestors} active investors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-yellow-600">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading projects...</span>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects found.</p>
                </div>
              ) : (
                <>
                  {recentProjects.map((project) => (
                    <div key={project._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.location?.area || ''}{project.location?.area && project.location?.city ? ', ' : ''}{project.location?.city || ''}
                          </p>
                        </div>
                        <Badge
                          variant={
                            project.status === "active" ? "default" : 
                            project.status === "completed" ? "secondary" : 
                            project.status === "funded" ? "secondary" : "outline"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(project.progress)}%</span>
                        </div>
                        <Progress value={project.progress} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(project.raisedAmount)}</span>
                          <span>{formatCurrency(project.targetAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/admin/projects">Manage All Projects</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading activity...</span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity.</p>
                </div>
              ) : (
                <>
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {activity.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.status === "info" && <TrendingUp className="h-4 w-4 text-blue-600" />}
                        {activity.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/admin/analytics">View Analytics</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 bg-transparent">
                <Link href="/admin/projects/new" className="flex flex-col items-center space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>Add New Project</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 bg-transparent">
                <Link href="/admin/investors" className="flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Investors</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 bg-transparent">
                <Link href="/admin/analytics" className="flex flex-col items-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
