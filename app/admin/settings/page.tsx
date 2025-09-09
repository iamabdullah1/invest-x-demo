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
    adminEmail: "admin@investx.com",

    // Investment Settings
    minInvestmentAmount: "500000",
    maxInvestmentAmount: "50000000",
    platformFee: "1",
    withdrawalFee: "0.5",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,

    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",

    // Feature Flags
    newProjectApproval: true,
    autoInvestorVerification: false,
    maintenanceMode: false,
    betaFeatures: false,
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
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
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
                        <span className="font-semibold text-green-600">
                          {realTimeData.realTimeMetrics.verification.approvalRate}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-medium">Recent Investments</h4>
                      <div className="space-y-2">
                        {realTimeData.recentActivity.investments.slice(0, 5).map((investment) => (
                          <div key={investment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="text-sm font-medium">{investment.user}</span>
                              <span className="text-xs text-muted-foreground ml-2">invested in {investment.project}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatPKR(investment.amount)}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(investment.time).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <h4 className="font-medium">New Users</h4>
                      <div className="space-y-2">
                        {realTimeData.recentActivity.newUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="text-sm font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">joined</span>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline" 
                                className={
                                  user.verificationStatus === 'approved' ? 'bg-green-50' :
                                  user.verificationStatus === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
                                }
                              >
                                {user.verificationStatus}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {new Date(user.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading real-time data...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Platform Information
                </CardTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Investment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minInvestment">Minimum Investment (PKR)</Label>
                    <Input
                      id="minInvestment"
                      type="number"
                      value={settings.minInvestmentAmount}
                      onChange={(e) => handleInputChange("minInvestmentAmount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxInvestment">Maximum Investment (PKR)</Label>
                    <Input
                      id="maxInvestment"
                      type="number"
                      value={settings.maxInvestmentAmount}
                      onChange={(e) => handleInputChange("maxInvestmentAmount", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      step="0.1"
                      value={settings.platformFee}
                      onChange={(e) => handleInputChange("platformFee", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalFee">Withdrawal Fee (%)</Label>
                    <Input
                      id="withdrawalFee"
                      type="number"
                      step="0.1"
                      value={settings.withdrawalFee}
                      onChange={(e) => handleInputChange("withdrawalFee", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to mobile apps</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange("pushNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Send promotional and marketing emails</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleInputChange("marketingEmails", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) => handleInputChange("passwordExpiry", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.loginAttempts}
                    onChange={(e) => handleInputChange("loginAttempts", e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Feature Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Project Approval</Label>
                    <p className="text-sm text-muted-foreground">Require admin approval for new projects</p>
                  </div>
                  <Switch
                    checked={settings.newProjectApproval}
                    onCheckedChange={(checked) => handleInputChange("newProjectApproval", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Investor Verification</Label>
                    <p className="text-sm text-muted-foreground">Automatically verify new investor accounts</p>
                  </div>
                  <Switch
                    checked={settings.autoInvestorVerification}
                    onCheckedChange={(checked) => handleInputChange("autoInvestorVerification", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode for platform updates</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Beta Features</Label>
                    <p className="text-sm text-muted-foreground">Enable experimental features for testing</p>
                  </div>
                  <Switch
                    checked={settings.betaFeatures}
                    onCheckedChange={(checked) => handleInputChange("betaFeatures", checked)}
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
