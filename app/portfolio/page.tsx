"use client"

import { useState, useEffect } from "react"
import React from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Eye, Download } from "lucide-react"
import Link from "next/link"
import { formatPKR, formatPKRReturn, formatPKRPercentage } from "@/lib/currency"

interface Project {
  _id: string
  title: string
  location: {
    city: string
    area: string
  }
  type: string
  status: string
  targetAmount: number
  raisedAmount: number
  expectedReturn: number
  images: string[]
}

interface Investment {
  id: string
  projectId: string
  amount: number
  investedAt: string
  currentValue: number
  returns: number
  project: Project
}

interface PortfolioData {
  investments: Investment[]
  summary: {
    totalInvested: number
    totalCurrentValue: number
    totalReturns: number
    returnPercentage: number
  }
  performance: Array<{
    month: string
    value: number
  }>
}

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateProgress = (raised: number, target: number) => {
    if (target === 0) return 0
    return Math.min((raised / target) * 100, 100)
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/portfolio')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPortfolioData(data.portfolio)
        } else {
          setError(data.message || 'Failed to fetch portfolio')
        }
      } else {
        setError('Failed to fetch portfolio')
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setError('Failed to fetch portfolio')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading portfolio...</div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!portfolioData || portfolioData.investments.length === 0) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Investments Yet</h1>
            <p className="text-muted-foreground mb-6">Start building your real estate portfolio today</p>
            <Button asChild>
              <Link href="/projects">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  const { summary, performance, investments } = portfolioData

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
              <div className="text-2xl font-bold">{formatPKR(summary.totalCurrentValue, { compact: true })}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{formatPKRPercentage(summary.returnPercentage)} from invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(summary.totalInvested, { compact: true })}</div>
              <p className="text-xs text-muted-foreground">Across {investments.length} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPKR(summary.totalReturns, { compact: true })}</div>
              <p className="text-xs text-muted-foreground">Unrealized gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
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
              {investments.map((investment) => {
                const returnPercentage = (investment.returns / investment.amount) * 100
                const projectProgress = calculateProgress(investment.project.raisedAmount, investment.project.targetAmount)

                return (
                  <Card key={investment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={investment.project.images?.[0] || "/placeholder.svg"}
                            alt={investment.project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{investment.project.title}</h3>
                              <p className="text-muted-foreground">{investment.project.location.area}, {investment.project.location.city}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{investment.project.type}</Badge>
                                <Badge variant="outline">{investment.project.expectedReturn}% Target</Badge>
                                <Badge variant={investment.project.status === "active" ? "default" : "secondary"}>
                                  {investment.project.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" asChild>
                              <Link href={`/projects/${investment.project._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Project
                              </Link>
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                              <div className="text-sm text-muted-foreground">Investment Amount</div>
                              <div className="text-lg font-semibold">{formatPKR(investment.amount)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Current Value</div>
                              <div className="text-lg font-semibold">{formatPKR(investment.currentValue)}</div>
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
                                {formatPKRReturn(investment.amount, investment.currentValue)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Investment Date</div>
                              <div className="text-lg font-semibold">{new Date(investment.investedAt).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Project Progress</span>
                              <span>{projectProgress.toFixed(1)}%</span>
                            </div>
                            <Progress value={projectProgress} />
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
                      <div className="text-2xl font-bold text-green-600">+{summary.returnPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{investments.length}</div>
                      <div className="text-sm text-muted-foreground">Active Investments</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{formatPKR(summary.totalCurrentValue / investments.length || 0, { compact: true })}</div>
                      <div className="text-sm text-muted-foreground">Avg. Investment</div>
                    </div>
                  </div>

                  {/* Performance Chart Data */}
                  <div className="space-y-4">
                    <h4 className="font-medium">6-Month Performance Trend</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {performance.map((data, index) => (
                        <div key={index} className="text-center">
                          <div className="h-24 bg-muted rounded flex items-end p-2">
                            <div 
                              className="w-full bg-blue-600 rounded-t"
                              style={{ height: `${(data.value / summary.totalCurrentValue) * 100}%` } as React.CSSProperties}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{data.month}</div>
                        </div>
                      ))}
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
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Investment Purchase</div>
                          <div className="text-sm text-muted-foreground">{investment.project.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPKR(investment.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(investment.investedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
