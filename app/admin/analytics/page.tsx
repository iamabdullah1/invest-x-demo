
'use client'
import { useState, useEffect } from 'react'
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, BarChart3, PieChart, Activity, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/mockData"


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

export default function AdminAnalyticsPage() {
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
    <RoleGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.totalRaised)}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
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
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalInvestors.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />{stats.activeInvestors} active investors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeProjects}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />{stats.totalProjects} total projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingApprovals}
              </div>
              <p className="text-xs text-yellow-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />Awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Projects Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project._id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{project.title}</span>
                            <span className="font-medium">{formatCurrency(project.raisedAmount)}</span>
                          </div>
                          <Progress value={project.progress} />
                          <div className="text-xs text-muted-foreground">
                            {project.location?.city || 'Unknown'} • {Math.round(project.progress)}% funded
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Project Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading distribution...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Active Projects</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.activeProjects} projects</span>
                          <span>{formatCurrency(stats.totalRaised)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Completed Projects</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedProjects} projects</span>
                          <span>Target reached</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Upcoming Projects</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.totalProjects > 0 ? Math.round((stats.upcomingProjects / stats.totalProjects) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={stats.totalProjects > 0 ? (stats.upcomingProjects / stats.totalProjects) * 100 : 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.upcomingProjects} projects</span>
                          <span>In pipeline</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography">
            <Card>
              <CardHeader>
                <CardTitle>Projects by Location</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading locations...</span>
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No location data available.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentProjects.map((project) => (
                      <div key={project._id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{project.location?.city || 'Unknown City'}</h4>
                            <p className="text-sm text-muted-foreground">{project.title}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(project.raisedAmount)}</div>
                            <div className="text-sm text-muted-foreground">{Math.round(project.progress)}% funded</div>
                          </div>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading project analysis...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold">{stats.activeProjects}</div>
                          <div className="text-sm text-muted-foreground">Active Projects</div>
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(stats.totalRaised)}</div>
                          <Badge variant="outline">
                            {stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}% of portfolio
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold">{stats.completedProjects}</div>
                          <div className="text-sm text-muted-foreground">Completed Projects</div>
                          <div className="text-lg font-semibold text-blue-600">Successfully Funded</div>
                          <Badge variant="outline">
                            {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% success rate
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold">{stats.upcomingProjects}</div>
                          <div className="text-sm text-muted-foreground">Upcoming Projects</div>
                          <div className="text-lg font-semibold text-purple-600">In Pipeline</div>
                          <Badge variant="outline">
                            {stats.totalProjects > 0 ? Math.round((stats.upcomingProjects / stats.totalProjects) * 100) : 0}% pipeline
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Platform Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading insights...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Platform Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Total Funding Raised</span>
                            <Badge variant="default">{formatCurrency(stats.totalRaised)}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Active Investors</span>
                            <Badge variant="secondary">{stats.activeInvestors} users</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Funding Success Rate</span>
                            <Badge variant="outline">
                              {stats.totalTarget > 0 ? ((stats.totalRaised / stats.totalTarget) * 100).toFixed(1) : 0}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Current Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Average Project Progress</span>
                            <span className="font-medium">
                              {recentProjects.length > 0 
                                ? Math.round(recentProjects.reduce((sum, p) => sum + p.progress, 0) / recentProjects.length)
                                : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending Verifications</span>
                            <span className="font-medium">{stats.pendingApprovals} users</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Project Portfolio</span>
                            <span className="font-medium">{stats.totalProjects} projects</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {recentActivity.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-4">Recent Activity Summary</h4>
                        <div className="space-y-2">
                          {recentActivity.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <span className="text-sm">{activity.message}</span>
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
