"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building2, Wallet, Target, ArrowUpRight, ArrowDownRight, Plus, Eye, ImageIcon } from "lucide-react"
import Link from "next/link"
import { mockInvestments } from "@/lib/mockData"

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
}

export default function DashboardPage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch featured projects
  useEffect(() => {
    fetchFeaturedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      const response = await fetch('/api/projects?limit=3')
      const result = await response.json()
      
      if (result.success) {
        setFeaturedProjects(result.projects)
      } else {
        console.error('Failed to fetch projects:', result.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate portfolio stats (using mock data for now)
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalReturns = totalCurrentValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

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
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Across {mockInvestments.length} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />+{returnPercentage.toFixed(1)}% growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReturns)}</div>
              <p className="text-xs text-muted-foreground">Unrealized gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInvestments.length}</div>
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
            <div className="space-y-4">
              {mockInvestments.map((investment) => {
                // For now, we'll skip showing the project title since we don't have real investment data
                // This section can be updated when you have real investment tracking
                const returnPercentage = (investment.returns / investment.amount) * 100

                return (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Investment #{investment.id}</h4>
                        <p className="text-sm text-muted-foreground">Real Estate Project</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                      <div
                        className={`text-sm flex items-center ${investment.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {investment.returns >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {returnPercentage >= 0 ? "+" : ""}
                        {returnPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/portfolio">View Full Portfolio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Investment Opportunities</CardTitle>
            <CardDescription>Discover new projects available for investment</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : featuredProjects.length === 0 ? (
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
                      {project.images.length > 0 ? (
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
                      <p className="text-sm text-muted-foreground">{project.location.area}, {project.location.city}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                        </div>
                        <Progress value={calculateProgress(project.raisedAmount, project.targetAmount)} />
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
