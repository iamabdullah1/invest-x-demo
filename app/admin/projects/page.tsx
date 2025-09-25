"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Eye, MoreHorizontal, ImageIcon, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  location: string
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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    city: 'all'
  })

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [filters])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.city !== 'all') params.append('city', filters.city)

      const response = await fetch(`/api/admin/projects?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setProjects(result.projects)
      } else {
        console.error('Failed to fetch projects:', result.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleDelete = async (projectId: string) => {
    try {
      setDeleting(projectId)
      const response = await fetch(`/api/admin/projects?id=${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove project from local state
        setProjects(prev => prev.filter(p => p._id !== projectId))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'funded': return 'bg-blue-500'
      case 'completed': return 'bg-purple-500'
      case 'draft': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Projects</h1>
            <p className="text-muted-foreground">Oversee all investment projects on the platform</p>
          </div>
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects..." 
                  className="pl-10" 
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="mixed">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <Button asChild>
                <Link href="/admin/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {/* Project Image */}
                  <div className="relative h-48 mb-3 overflow-hidden rounded-lg bg-muted">
                    {project.images && project.images.length > 0 ? (
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
                    <Badge className={`absolute top-2 right-2 ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {typeof project.location === 'string' 
                          ? project.location 
                          : `${project.location?.area || ''}, ${project.location?.city || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '') || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof project.developer === 'string' 
                          ? project.developer 
                          : project.developer?.name || 'N/A'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project._id}`}>
                            <div className="flex items-center w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/projects/${project._id}/edit`}>
                            <div className="flex items-center w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                {project.raisedAmount > 0 && (
                                  <span className="text-red-600 block mt-2">
                                    ⚠️ This project has investments and cannot be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(project._id)}
                                disabled={project.raisedAmount > 0 || deleting === project._id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting === project._id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Financial Info */}
                  {/* <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target Amount:</span>
                      <span className="font-medium">{formatCurrency(project.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Raised:</span>
                      <span className="font-medium">{formatCurrency(project.raisedAmount)}</span>
                    </div>
                    <Progress 
                      value={calculateProgress(project.raisedAmount, project.targetAmount)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{calculateProgress(project.raisedAmount, project.targetAmount)}% funded</span>
                      <span>{project.expectedReturn}% expected return</span>
                    </div>
                  </div> */}
                  
                  {/* Project Details */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-2">
                      <Badge variant="outline">{project.type}</Badge>
                      <Badge variant="outline">{project.city}</Badge>
                    </div>
                    <span className="text-muted-foreground">{project.duration} months</span>
                  </div>
                  
                  {/* Inventory Actions */}
                  <div className="pt-2 space-y-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/admin/inventory">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Inventory
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/inventory/new?projectId=${project._id}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Inventory
                      </Link>
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
