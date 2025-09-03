import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, BarChart3, PieChart, Activity } from "lucide-react"
import { formatCurrency } from "@/lib/mockData"

export default function AdminAnalyticsPage() {
  // Mock analytics data
  const platformStats = {
    totalRevenue: 2500000000, // PKR 250 Crore
    monthlyGrowth: 15.2,
    totalInvestors: 1250,
    investorGrowth: 8.5,
    totalProjects: 12,
    projectGrowth: 25.0,
    avgInvestment: 5600000, // PKR 56 Lakh
    investmentGrowth: -2.1,
  }

  const cityData = [
    { city: "Karachi", projects: 5, investment: 1200000000, percentage: 48 },
    { city: "Lahore", projects: 3, investment: 750000000, percentage: 30 },
    { city: "Islamabad", projects: 2, investment: 400000000, percentage: 16 },
    { city: "Rawalpindi", projects: 2, investment: 150000000, percentage: 6 },
  ]

  const projectTypeData = [
    { type: "Residential", count: 7, investment: 1500000000, percentage: 60 },
    { type: "Commercial", count: 4, investment: 800000000, percentage: 32 },
    { type: "Mixed Use", count: 1, investment: 200000000, percentage: 8 },
  ]

  const monthlyData = [
    { month: "Jan", investments: 180000000, investors: 45 },
    { month: "Feb", investments: 220000000, investors: 52 },
    { month: "Mar", investments: 280000000, investors: 68 },
    { month: "Apr", investments: 320000000, investors: 75 },
    { month: "May", investments: 380000000, investors: 89 },
    { month: "Jun", investments: 450000000, investors: 102 },
  ]

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
              <div className="text-2xl font-bold">{formatCurrency(platformStats.totalRevenue)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{platformStats.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalInvestors.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{platformStats.investorGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalProjects}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{platformStats.projectGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Investment</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(platformStats.avgInvestment)}</div>
              <p className="text-xs text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {platformStats.investmentGrowth}% from last month
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
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={data.month} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{data.month}</span>
                          <span className="font-medium">{formatCurrency(data.investments)}</span>
                        </div>
                        <Progress value={(data.investments / 450000000) * 100} />
                        <div className="text-xs text-muted-foreground">{data.investors} new investors</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Investment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectTypeData.map((data) => (
                      <div key={data.type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{data.type}</span>
                          <span className="text-sm text-muted-foreground">{data.percentage}%</span>
                        </div>
                        <Progress value={data.percentage} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{data.count} projects</span>
                          <span>{formatCurrency(data.investment)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography">
            <Card>
              <CardHeader>
                <CardTitle>Investment by City</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cityData.map((city) => (
                    <div key={city.city} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{city.city}</h4>
                          <p className="text-sm text-muted-foreground">{city.projects} active projects</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(city.investment)}</div>
                          <div className="text-sm text-muted-foreground">{city.percentage}% of total</div>
                        </div>
                      </div>
                      <Progress value={city.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Type Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projectTypeData.map((type) => (
                    <Card key={type.type}>
                      <CardContent className="p-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold">{type.count}</div>
                          <div className="text-sm text-muted-foreground">{type.type} Projects</div>
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(type.investment)}</div>
                          <Badge variant="outline">{type.percentage}% of portfolio</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Top Performing Sectors</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Commercial Real Estate</span>
                          <Badge variant="default">+28% ROI</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Residential Complexes</span>
                          <Badge variant="secondary">+22% ROI</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Mixed Use Developments</span>
                          <Badge variant="outline">+18% ROI</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Investment Patterns</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Average Investment Size</span>
                          <span className="font-medium">{formatCurrency(5600000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Popular Duration</span>
                          <span className="font-medium">24 months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Risk Level</span>
                          <span className="font-medium">Moderate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
