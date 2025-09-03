import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Eye, Download } from "lucide-react"
import Link from "next/link"
import { mockProjects, mockInvestments, formatCurrency, calculateProgress } from "@/lib/mockData"

export default function PortfolioPage() {
  // Calculate portfolio statistics
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalReturns = totalCurrentValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

  // Performance data for chart (mock)
  const performanceData = [
    { month: "Jan", value: totalInvested * 0.95 },
    { month: "Feb", value: totalInvested * 0.98 },
    { month: "Mar", value: totalInvested * 1.02 },
    { month: "Apr", value: totalInvested * 1.05 },
    { month: "May", value: totalInvested * 1.08 },
    { month: "Jun", value: totalCurrentValue },
  ]

  return (
    <RoleGuard requiredRole="investor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
            <p className="text-muted-foreground">Track and manage your real estate investments</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button asChild>
              <Link href="/projects">
                <Building2 className="h-4 w-4 mr-2" />
                New Investment
              </Link>
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{returnPercentage.toFixed(1)}% from invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Across {mockInvestments.length} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReturns)}</div>
              <p className="text-xs text-muted-foreground">Unrealized gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInvestments.length}</div>
              <p className="text-xs text-muted-foreground">Investment positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Tabs */}
        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {mockInvestments.map((investment) => {
                const project = mockProjects.find((p) => p.id === investment.projectId)
                if (!project) return null

                const returnPercentage = (investment.returns / investment.amount) * 100
                const projectProgress = calculateProgress(project.raisedAmount, project.targetAmount)

                return (
                  <Card key={investment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={project.images[0] || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{project.title}</h3>
                              <p className="text-muted-foreground">{project.location}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{project.type}</Badge>
                                <Badge variant="outline">{project.expectedReturn}% Target</Badge>
                                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" asChild>
                              <Link href={`/projects/${project.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Project
                              </Link>
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                              <div className="text-sm text-muted-foreground">Investment Amount</div>
                              <div className="text-lg font-semibold">{formatCurrency(investment.amount)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Current Value</div>
                              <div className="text-lg font-semibold">{formatCurrency(investment.currentValue)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Returns</div>
                              <div
                                className={`text-lg font-semibold flex items-center ${
                                  investment.returns >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {investment.returns >= 0 ? (
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 mr-1" />
                                )}
                                {formatCurrency(Math.abs(investment.returns))} ({returnPercentage >= 0 ? "+" : ""}
                                {returnPercentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Shares Owned</div>
                              <div className="text-lg font-semibold">{investment.shares}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Project Progress</span>
                              <span>{projectProgress}%</span>
                            </div>
                            <Progress value={projectProgress} />
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Purchased: {new Date(investment.purchaseDate).toLocaleDateString()}</span>
                            <span>Duration: {project.duration} months</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+{returnPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">6 months</div>
                      <div className="text-sm text-muted-foreground">Avg. Holding Period</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-sm text-muted-foreground">Active Projects</div>
                    </div>
                  </div>

                  {/* Mock Performance Chart */}
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Performance chart would be displayed here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInvestments.map((investment) => {
                    const project = mockProjects.find((p) => p.id === investment.projectId)
                    if (!project) return null

                    return (
                      <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Investment Purchase</div>
                            <div className="text-sm text-muted-foreground">{project.title}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(investment.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(investment.purchaseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
