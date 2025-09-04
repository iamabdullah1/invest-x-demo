import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"
import { mockProjects, formatCurrency, calculateProgress } from "@/lib/mockData"

export default function AdminHomePage() {
  // Calculate admin stats
  const totalProjects = mockProjects.length
  const activeProjects = mockProjects.filter((p) => p.status === "active").length
  const totalRaised = mockProjects.reduce((sum, p) => sum + p.raisedAmount, 0)
  const totalTarget = mockProjects.reduce((sum, p) => sum + p.targetAmount, 0)
  const totalInvestors = 1250 // Mock data
  const pendingApprovals = 8 // Mock data

  // Recent activity
  const recentActivity = [
    {
      id: "1",
      type: "investment",
      message: "New investment of PKR 2.5L in Emerald Heights",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: "2",
      type: "project",
      message: "Liberty Commercial Plaza reached 60% funding",
      time: "4 hours ago",
      status: "info",
    },
    {
      id: "3",
      type: "approval",
      message: "3 new investor applications pending review",
      time: "6 hours ago",
      status: "warning",
    },
    {
      id: "4",
      type: "completion",
      message: "Centaurus Mall Extension project completed",
      time: "1 day ago",
      status: "success",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your real estate investment platform</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/test-seed">
                <Users className="h-4 w-4 mr-2" />
                Seed Database
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Link>
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
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">{activeProjects} active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRaised)}</div>
              <p className="text-xs text-green-600">{((totalRaised / totalTarget) * 100).toFixed(1)}% of target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvestors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals}</div>
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
              {mockProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                    </div>
                    <Badge
                      variant={
                        project.status === "active" ? "default" : project.status === "funded" ? "secondary" : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                    </div>
                    <Progress value={calculateProgress(project.raisedAmount, project.targetAmount)} />
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
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
