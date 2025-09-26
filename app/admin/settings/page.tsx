"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Bell, Shield, DollarSign, Database, Activity, Users, TrendingUp, Server, Zap, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { formatPKR, formatPKRPercentage } from "@/lib/currency"

interface RealTimeData {
  realTimeMetrics: {
    platform: {
      totalUsers: number
      activeUsers24h: number
      newUsersToday: number
      totalProjects: number
      activeProjects: number
      projectsCreatedToday: number
    }
    investments: {
      totalInvestments: number
      investmentsToday: number
      investmentsThisWeek: number
      totalAmountInvested: number
      avgInvestmentAmount: number
      amountInvestedToday: number
      amountInvestedThisWeek: number
    }
    verification: {
      pending: number
      approved: number
      rejected: number
      approvalRate: string
    }
    systemHealth: {
      database: string
      apiResponse: string
      activeConnections: number
      serverLoad: number
      memoryUsage: number
      uptime: number
    }
  }
  recentActivity: {
    investments: Array<{
      id: string
      user: string
      project: string
      amount: number
      time: string
      status: string
    }>
    newUsers: Array<{
      id: string
      name: string
      joinedAt: string
      verificationStatus: string
    }>
  }
  lastUpdated: string
}

export default function AdminSettingsPage() {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: "InvestX",
    platformDescription: "Real Estate Investment Platform for Pakistan",
    supportEmail: "support@investx.com",
    adminEmail: "admin@investx.com"
  })

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setRealTimeData(data.data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchRealTimeData()
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        console.log("Settings saved successfully")
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getHealthStatus = (value: number, type: 'load' | 'memory') => {
    if (type === 'load') {
      if (value < 50) return { status: 'good', color: 'text-green-600' }
      if (value < 80) return { status: 'warning', color: 'text-yellow-600' }
      return { status: 'critical', color: 'text-red-600' }
    } else {
      if (value < 60) return { status: 'good', color: 'text-green-600' }
      if (value < 85) return { status: 'warning', color: 'text-yellow-600' }
      return { status: 'critical', color: 'text-red-600' }
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Live Overview</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* Real-Time Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Header with refresh info */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Real-Time Platform Metrics</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading...'}
                </p>
              </div>
              <Button onClick={fetchRealTimeData} disabled={loading} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {realTimeData && (
              <>
                {/* Platform Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold">{realTimeData.realTimeMetrics.platform.totalUsers.toLocaleString()}</p>
                          <p className="text-xs text-green-600">
                            +{realTimeData.realTimeMetrics.platform.newUsersToday} today
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Zap className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Active Users (24h)</p>
                          <p className="text-2xl font-bold">{realTimeData.realTimeMetrics.platform.activeUsers24h.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {((realTimeData.realTimeMetrics.platform.activeUsers24h / realTimeData.realTimeMetrics.platform.totalUsers) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                          <p className="text-2xl font-bold">{formatPKR(realTimeData.realTimeMetrics.investments.totalAmountInvested)}</p>
                          <p className="text-xs text-green-600">
                            +{formatPKR(realTimeData.realTimeMetrics.investments.amountInvestedToday)} today
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Database className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                          <p className="text-2xl font-bold">{realTimeData.realTimeMetrics.platform.activeProjects}</p>
                          <p className="text-xs text-muted-foreground">
                            of {realTimeData.realTimeMetrics.platform.totalProjects} total
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database</span>
                          <Badge variant={realTimeData.realTimeMetrics.systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                            {realTimeData.realTimeMetrics.systemHealth.database}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API Response</span>
                          <Badge variant={realTimeData.realTimeMetrics.systemHealth.apiResponse === 'normal' ? 'default' : 'destructive'}>
                            {realTimeData.realTimeMetrics.systemHealth.apiResponse}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Server Load</span>
                          <span className={`text-sm font-medium ${getHealthStatus(realTimeData.realTimeMetrics.systemHealth.serverLoad, 'load').color}`}>
                            {realTimeData.realTimeMetrics.systemHealth.serverLoad}%
                          </span>
                        </div>
                        <Progress 
                          value={realTimeData.realTimeMetrics.systemHealth.serverLoad} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Memory Usage</span>
                          <span className={`text-sm font-medium ${getHealthStatus(realTimeData.realTimeMetrics.systemHealth.memoryUsage, 'memory').color}`}>
                            {realTimeData.realTimeMetrics.systemHealth.memoryUsage}%
                          </span>
                        </div>
                        <Progress 
                          value={realTimeData.realTimeMetrics.systemHealth.memoryUsage} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Uptime</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatUptime(realTimeData.realTimeMetrics.systemHealth.uptime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Connections</span>
                          <span className="text-sm font-medium">
                            {realTimeData.realTimeMetrics.systemHealth.activeConnections}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Investment Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Investments</span>
                        <span className="font-semibold">{realTimeData.realTimeMetrics.investments.totalInvestments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investments Today</span>
                        <span className="font-semibold text-green-600">+{realTimeData.realTimeMetrics.investments.investmentsToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Week</span>
                        <span className="font-semibold">{realTimeData.realTimeMetrics.investments.investmentsThisWeek}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Average Investment</span>
                        <span className="font-semibold">{formatPKR(realTimeData.realTimeMetrics.investments.avgInvestmentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Total</span>
                        <span className="font-semibold">{formatPKR(realTimeData.realTimeMetrics.investments.amountInvestedThisWeek)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Verification Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Pending</span>
                        <Badge variant="outline" className="bg-yellow-50">
                          {realTimeData.realTimeMetrics.verification.pending}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Approved</span>
                        <Badge variant="outline" className="bg-green-50">
                          {realTimeData.realTimeMetrics.verification.approved}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Rejected</span>
                        <Badge variant="outline" className="bg-red-50">
                          {realTimeData.realTimeMetrics.verification.rejected}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Approval Rate</span>
                        <span className="font-semibold text-green-600">{realTimeData.realTimeMetrics.verification.approvalRate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {realTimeData.recentActivity.investments.length > 0 ? (
                          realTimeData.recentActivity.investments.map((investment, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium text-sm">{investment.user}</p>
                                <p className="text-xs text-muted-foreground">{investment.project}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatPKR(investment.amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(investment.time).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-muted-foreground">No recent investments</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>New Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {realTimeData.recentActivity.newUsers.length > 0 ? (
                          realTimeData.recentActivity.newUsers.map((user, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(user.joinedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={user.verificationStatus === 'approved' ? 'default' : 'outline'}>
                                {user.verificationStatus}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-muted-foreground">No new users</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.platformName}
                      onChange={(e) => handleInputChange("platformName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange("supportEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformDescription">Platform Description</Label>
                  <Textarea
                    id="platformDescription"
                    value={settings.platformDescription}
                    onChange={(e) => handleInputChange("platformDescription", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </RoleGuard>
  )
}