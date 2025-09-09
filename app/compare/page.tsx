"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockProjects, formatCurrency, calculateProgress, type Project } from "@/lib/mockData"
import { ArrowLeft, Plus, X, MapPin, Building } from "lucide-react"
import Link from "next/link"

export default function ComparePage() {
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])

  useEffect(() => {
    // Get projects from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const projectIds = urlParams.get("projects")?.split(",") || []

    const selected = mockProjects.filter((p) => projectIds.includes(p.id))
    setSelectedProjects(selected)
    setAvailableProjects(mockProjects.filter((p) => !projectIds.includes(p.id)))
  }, [])

  const addProject = (project: Project) => {
    if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, project])
      setAvailableProjects(availableProjects.filter((p) => p.id !== project.id))
    }
  }

  const removeProject = (projectId: string) => {
    const project = selectedProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProjects(selectedProjects.filter((p) => p.id !== projectId))
      setAvailableProjects([...availableProjects, project])
    }
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
              <Card key={project.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => removeProject(project.id)}
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
                      <span className="text-sm">Min Investment</span>
                      <span className="font-semibold">{formatCurrency(project.minInvestment)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return</span>
                      <span className="font-semibold text-green-600">{project.expectedReturn}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Duration</span>
                      <span className="font-semibold">{project.duration} months</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Price per Sq.Ft</span>
                      <span className="font-semibold">{formatCurrency(project.pricePerSqFt)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(project.raisedAmount, project.targetAmount)}%` }}
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
                      <span className="text-sm">Type</span>
                      <Badge variant="outline">{project.type}</Badge>
                    </div>
                  </div>

                  <Link href={`/projects/${project.id}`}>
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
                  key={project.id}
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
