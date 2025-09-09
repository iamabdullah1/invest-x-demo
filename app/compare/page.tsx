"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, X, MapPin, Building } from "lucide-react"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description: string
  location: string
  city: string
  type: "residential" | "commercial" | "mixed"
  status: "active" | "funded" | "completed"
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  images: string[]
  riskLevel: "low" | "medium" | "high"
  progress: number
  category: string
  features: string[]
  pricePerSqFt?: number
}

export default function ComparePage() {
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllProjects()
  }, [])

  const fetchAllProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/projects', {
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        // Transform projects to match the expected format
        const transformedProjects = result.projects.map((project: any) => {
          // Calculate progress
          const progress = project.targetAmount > 0 ? 
            Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;

          // Calculate minimum investment (1% of target, minimum PKR 100,000, maximum PKR 5,000,000)
          const minInvestmentCalc = Math.max(
            100000, // Minimum PKR 1 Lakh
            Math.min(
              project.targetAmount * 0.01, // 1% of target
              5000000 // Maximum PKR 50 Lakh
            )
          );

          // Map risk level based on expected return
          let riskLevel: 'low' | 'medium' | 'high' = 'medium';
          if (project.expectedReturn <= 10) {
            riskLevel = 'low';
          } else if (project.expectedReturn >= 18) {
            riskLevel = 'high';
          }

          return {
            _id: project._id,
            id: project._id.toString(),
            title: project.title,
            description: project.description || 'No description available',
            location: project.location?.address || `${project.location?.area}, ${project.location?.city}` || project.city || 'Location TBD',
            city: project.location?.city || project.city || 'Unknown',
            type: project.type,
            status: project.status,
            targetAmount: project.targetAmount,
            raisedAmount: project.raisedAmount,
            minInvestment: Math.round(minInvestmentCalc),
            expectedReturn: project.expectedReturn,
            duration: project.duration || 24, // Default 2 years
            images: project.images || ['/placeholder.svg'],
            riskLevel,
            progress: Math.round(progress),
            category: project.category || project.type,
            features: project.features || [],
            pricePerSqFt: project.pricePerSqFt || Math.round(project.targetAmount / (project.area || 1000))
          };
        });

        const activeProjects = transformedProjects.filter((p: Project) => p.status === 'active');
        setAllProjects(activeProjects);

        // Get projects from URL params after data is loaded
        initializeFromURL(activeProjects);
      } else {
        setError(result.error || 'Failed to fetch projects')
        console.error('Failed to fetch projects:', result.error)
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeFromURL = (projects: Project[]) => {
    // Get projects from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const projectIds = urlParams.get("projects")?.split(",") || []

    const selected = projects.filter((p) => projectIds.includes(p._id.toString()))
    setSelectedProjects(selected)
    setAvailableProjects(projects.filter((p) => !projectIds.includes(p._id.toString())))
  }

  useEffect(() => {
    if (allProjects.length > 0) {
      initializeFromURL(allProjects)
    }
  }, [allProjects])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const addProject = (project: Project) => {
    if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, project])
      setAvailableProjects(availableProjects.filter((p) => p._id !== project._id))
    }
  }

  const removeProject = (projectId: string) => {
    const project = selectedProjects.find((p) => p._id.toString() === projectId)
    if (project) {
      setSelectedProjects(selectedProjects.filter((p) => p._id.toString() !== projectId))
      setAvailableProjects([...availableProjects, project])
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Compare Investments</h1>
              <p className="text-muted-foreground">Compare up to 3 projects side by side</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Compare Investments</h1>
              <p className="text-muted-foreground">Compare up to 3 projects side by side</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAllProjects}>Try Again</Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="investor">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Compare Investments</h1>
            <p className="text-muted-foreground">Compare up to 3 projects side by side</p>
          </div>
        </div>

        {selectedProjects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No projects selected</h3>
              <p className="text-muted-foreground mb-4">Choose projects below to start comparing</p>
            </CardContent>
          </Card>
        )}

        {selectedProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedProjects.map((project) => (
              <Card key={project._id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => removeProject(project._id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Target Amount</span>
                      <span className="font-semibold">{formatCurrency(project.targetAmount)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Raised Amount</span>
                      <span className="font-semibold">{formatCurrency(project.raisedAmount)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return</span>
                      <span className="font-semibold text-green-600">{project.expectedReturn}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Duration</span>
                      <span className="font-semibold">{project.duration} months</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{((project.raisedAmount / project.targetAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((project.raisedAmount / project.targetAmount) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level</span>
                      <Badge
                        variant={
                          project.riskLevel === "low"
                            ? "default"
                            : project.riskLevel === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {project.riskLevel}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Category</span>
                      <Badge variant="outline" className="capitalize">{project.category}</Badge>
                    </div>
                  </div>

                  <Link href={`/projects/${project._id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedProjects.length < 3 && availableProjects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Projects to Compare</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.map((project) => (
                <Card
                  key={project._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addProject(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                        <p className="text-sm font-semibold text-green-600">{project.expectedReturn}% return</p>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
